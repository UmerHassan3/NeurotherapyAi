const generateContactEmail = ({ name, message }) => {
    return `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">

    <table width="100%" style="padding:20px 0;background:#f4f6f8;">
      <tr>
        <td align="center">

          <table width="600" style="background:#ffffff;border-radius:10px;overflow:hidden;">

            <!-- Header -->
            <tr>
              <td style="background:#2563eb;color:#fff;text-align:center;padding:20px;">
                <h2 style="margin:0;">NeuroTherapy</h2>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:25px;color:#333;">

                <h3 style="margin-top:0;">Hello ${name || "User"} 👋</h3>

                <p style="font-size:14px;line-height:1.6;">
                  Thank you for contacting NeuroTherapy. We have received your message and it is now being reviewed.
                </p>

                <div style="background:#f9fafb;border-left:4px solid #2563eb;padding:15px;margin:20px 0;border-radius:6px;">
                  <p style="margin:0;font-size:14px;color:#555;">
                    ${message}
                  </p>
                </div>

                <p style="font-size:14px;line-height:1.6;">
                  Our team will respond shortly. If you have further inquiries, feel free to reply to this email.
                </p>

                <p style="margin-top:30px;font-size:14px;">
                  Regards,<br/>
                  <strong>NeuroTherapy Team</strong>
                </p>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f1f5f9;text-align:center;padding:12px;font-size:12px;color:#888;">
                © ${new Date().getFullYear()} NeuroTherapy. All rights reserved.
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
</html>
`;
};

export default generateContactEmail;