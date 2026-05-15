import User from "../Models/Auth.Model.js";
import Contact from "../Models/Contact.Model.js";
import ApiResponse from "../Utils/ApiResponse.js";
import generateContactEmail from "../Utils/generateContactEmail.js";
import { transporter } from "../Utils/mailer.js";

export const fetchAllUsers = async (req, res) => {
    try {
        const allUsers = await User.find({});

        // check empty array properly
        if (allUsers.length === 0) {
            return res
                .status(404)
                .json(new ApiResponse(404, [], "No users found"));
        }

        return res.status(200).json(
            new ApiResponse(200, allUsers, "All Users Fetched Successfully")
        );

    } catch (error) {
        console.error("Fetch Users Error:", error);

        return res.status(500).json(
            new ApiResponse(500, null, "Internal Server Error")
        );
    }
};

export const deleteUsers = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json(
                new ApiResponse(400, null, "ID is required")
            );
        }

        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json(
                new ApiResponse(404, null, "User not found")
            );
        }

        return res.status(200).json(
            new ApiResponse(200, deletedUser, "User deleted successfully")
        );

    } catch (error) {
        console.error("Delete User Error:", error);

        return res.status(500).json(
            new ApiResponse(500, null, "Cannot delete user")
        );
    }
};

export const getContact = async (req, res) => {
    try {
        const contact = await Contact.find({});

        if (!contact) {
            return res.status(400).json(
                new ApiResponse(401, null, "no contact to fetch")
            )
        }

        return res.status(200).json(
            new ApiResponse(201, contact, "Contacts fetched")
        )
    } catch (error) {
        return res.status(500).json(
            new ApiResponse(501, error, "cannot fetch contacts")
        )
    }
}

export const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json(
                new ApiResponse(401, null, "id reqiured")
            )
        }

        const deletedContact = await Contact.findByIdAndDelete(id);

        return res.status(200).json(
            new ApiResponse(201, deleteContact, "Contact Deleted")
        )
    } catch (error) {
        return res.status(500).json(
            new ApiResponse(501, error, "cannot delete contact")
        )
    }
}

export const sendReply = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json(
                new ApiResponse(401, null, "all field required")
            )
        }

        await transporter.sendMail({
            from: `"NeuroTherapy" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Your Message is Reviewed",
            html: generateContactEmail({
                name,
                message,
            })
        });

        return res.status(200).json(
            new ApiResponse(201, null, "Reply Sent")
        )

    } catch (error) {
        return res.status(500).json(
            new ApiResponse(501, error, "cannot sent reply")
        )
    }
}