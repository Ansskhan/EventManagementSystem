const { BrevoClient } = require("@getbrevo/brevo");



const brevoClient = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

const PLACEHOLDER_PREFIX = "replace_with";

// Brevo is only usable once real credentials replace the .env placeholders.
function isEmailConfigured() {
  const apiKey = process.env.BREVO_API_KEY || "";
  const sender = process.env.BREVO_SENDER_EMAIL || "";
  return (
    apiKey.length > 0 &&
    !apiKey.startsWith(PLACEHOLDER_PREFIX) &&
    sender.length > 0 &&
    !sender.startsWith(PLACEHOLDER_PREFIX)
  );
}

const sendEmail = async (to, name , verificationToken, baseUrl = process.env.FRONTEND_URL) => {
  const verificationUrl =
    `${baseUrl}/verify-email?token=${encodeURIComponent(verificationToken)}`;

  if (!isEmailConfigured()) {
    console.warn(
      `[email] Brevo is not configured. Verification link for ${to}: ${verificationUrl}`
    );
    return { skipped: true, verificationUrl };
  }

  try {
    const response =
      await brevoClient.transactionalEmails.sendTransacEmail({
        sender: {
          email: process.env.BREVO_SENDER_EMAIL,
          name: process.env.BREVO_SENDER_NAME || "EventSphere",
        },

        to: [
          {
            email: to,
            name: name,
          },
        ],

        subject: "Verify Your Email",

        htmlContent: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: Arial, sans-serif;">
              <h2>Verify your email</h2>

              <p>Hi ${name},</p>

              <p>
                Thanks for creating an account.
                Click the button below to verify your email.
              </p>

              <a
                href="${verificationUrl}"
                style="
                  display:inline-block;
                  padding:12px 20px;
                  background:#111;
                  color:white;
                  text-decoration:none;
                  border-radius:6px;
                "
              >
                Verify Email
              </a>

              <p>This link expires in 24 hours.</p>

              <p>
                If you didn't create this account,
                you can ignore this email.
              </p>
            </body>
          </html>
        `,
      });

    console.log("Email sent successfully:", response);

    return response;
  } catch (error) {
    console.error("BREVO FULL ERROR:", error);
    console.error("BREVO MESSAGE:", error.message);
    console.error("BREVO STATUS:", error.statusCode);

    throw error;
  }
};

const sendPasswordResetEmail = async (to, name , resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;

    if (!isEmailConfigured()) {
        console.warn(
            `[email] Brevo is not configured. Password reset link for ${to}: ${resetUrl}`
        );
        return { skipped: true, resetUrl };
    }

    try {
        const result = await brevoClient.transactionalEmails.sendTransacEmail({
            sender: {
                email: process.env.BREVO_SENDER_EMAIL,
                name: process.env.BREVO_SENDER_NAME || "EventSphere",
            },
            to: [
                {
                    email: to,
                    name: name,
                },
            ],
            subject: "Reset Your Password",
            htmlContent: `
                <!DOCTYPE html>
                <html>
                    <body style="font-family: Arial, sans-serif;">
                        <h2>Reset your password</h2>
                        <p>Hi ${name},</p>
                        <p>You requested a password reset. Click the button below to reset your password.</p>
                        <a href="${resetUrl}" style="
                            display:inline-block;
                            padding:12px 20px;
                            background:#111;
                            color:white;
                            text-decoration:none;
                            border-radius:6px;
                        ">Reset Password</a>
                        <p>This link expires in 30 minutes.</p>
                        <p>If you didn't request a password reset, you can ignore this email.</p>
                    </body>
                </html>
            `,
        });

        console.log("Password reset email sent successfully:", result);
        return result;
    } catch (error) {
        console.error("Error sending password reset email:", error);
        throw error;
    }
}

const sendNotificationEmail = async (to, name, subject, title, message) => {
  if (!isEmailConfigured()) {
    console.warn(`[email] Brevo is not configured. Skipping notification email to ${to}: ${subject}`);
    return null;
  }

  try {
    const response = await brevoClient.transactionalEmails.sendTransacEmail({
      sender: {
        email: process.env.BREVO_SENDER_EMAIL,
        name: process.env.BREVO_SENDER_NAME || "EventSphere",
      },
      to: [
        {
          email: to,
          name: name,
        },
      ],
      subject,
      htmlContent: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif;">
            <h2>${title}</h2>
            <p>Hi ${name},</p>
            <p>${message}</p>
            <p>EventSphere</p>
          </body>
        </html>
      `,
    });
    return response;
  } catch (error) {
    console.error("BREVO NOTIFICATION ERROR:", error.message);
    return null;
  }
};

module.exports = { sendEmail, sendPasswordResetEmail, sendNotificationEmail, isEmailConfigured };
