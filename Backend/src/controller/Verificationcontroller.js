const User = require("../model/Usermodel");
const crypto = require("crypto");
const { sendEmail } = require("../services/BrevoServices");

const resendEmail = async (req, res) => {
    try {
        const email = String(req.body.email || "").trim().toLowerCase();
        if (!email) return res.status(400).json({ message: "Email is required" });
        const user = await User.findOne({ email });
        let devVerificationPath;
        if (user && !user.isEmailVerified) {
            const token = crypto.randomBytes(32).toString("hex");
            user.emailVerificationToken = crypto.createHash("sha256").update(token).digest("hex");
            user.emailVerificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
            await user.save();
            try {
                const emailBaseUrl =
                    process.env.NODE_ENV !== "production"
                        ? req.get("origin") || process.env.FRONTEND_URL
                        : process.env.FRONTEND_URL;
                const result = await sendEmail(user.email, user.name, token, emailBaseUrl);
                if (result?.skipped && process.env.NODE_ENV !== "production") {
                    devVerificationPath = `/verify-email?token=${encodeURIComponent(token)}`;
                }
            } catch (emailError) {
                console.error("Failed to resend verification email:", emailError.message);
            }
        }
        return res.status(200).json({
            message: "If your account needs verification, a new link has been sent.",
            ...(devVerificationPath ? { devVerificationPath } : {}),
        });
    } catch (error) {
        return res.status(500).json({ message: "Unable to send verification email", error: error.message });
    }
};

module.exports = { resendEmail };
