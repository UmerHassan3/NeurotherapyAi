import Contact from "../Models/Contact.Model.js";
import ApiResponse from "../Utils/ApiResponse.js";
import { transporter } from "../Utils/mailer.js";

export const addContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // validation
    if (!name || !email || !message) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "All fields are required"));
    }

    // save contact
    const contact = await Contact.create({
      name,
      email,
      message,
    });

    // send email
    await transporter.sendMail({
      from: `"NeuroTherapy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "We received your message",
      html: `
        <div style="font-family:Arial;padding:10px">
          <h2>Thank you for contacting NeuroTherapy</h2>
          <p>Hi <b>${name}</b>,</p>
          <p>We have received your message:</p>
          <blockquote>${message}</blockquote>
          <p>Our team will respond soon.</p>
          <br/>
          <p>— NeuroTherapy Team</p>
        </div>
      `,
    });

    return res.status(201).json(
      new ApiResponse(201, contact, "Message sent successfully")
    );

  } catch (error) {
    console.error(error);

    return res.status(500).json(
      new ApiResponse(500, null, "Cannot send contact message")
    );
  }
};