import User from "../Models/Auth.Model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

/* ===================== SIGNIN ===================== */
export const Signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      success: true,
      token,
      user: { id: user._id, email: user.email, role: user.role },
      message: "Signin successful"
    });

  } catch (error) {
    console.error("Error during signin:", error);
    return res.status(500).json({ message: "Cannot signin" });
  }
};

/* ===================== SIGNUP ===================== */
export const SignUp = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword
    });

    return res.status(201).json({
      success: true,
      message: "Signup successful",
      user: { id: user._id, email: user.email }
    });

  } catch (error) {
    console.error("Error during signup:", error);
    return res.status(500).json({ message: "Cannot signup" });
  }
};

/* ===================== SIGNOUT ===================== */
export const SignOut = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({
      success: true,
      message: "Signout successful"
    });
  } catch (error) {
    console.error("Error during signout:", error);
    return res.status(500).json({ message: "Cannot signout" });
  }
};

/* ===================== FORGOT PASSWORD ===================== */
export const ForgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    // 🔒 Always return success (prevent email enumeration)
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If email exists, reset link sent"
      });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before saving (security)
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.userResetPasswordToken = hashedToken;
    user.userResetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 min

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Password Reset",
      html: `
        <h3>Password Reset Request</h3>
        <p>You requested to reset your password.</p>
        <a href="${resetUrl}">Click here to reset</a>
        <p>This link will expire in 10 minutes.</p>
      `
    });

    return res.status(200).json({
      success: true,
      message: "Reset link sent"
    });

  } catch (error) {
    console.error("Error during forgot password:", error);
    return res.status(500).json({
      success: false,
      message: "Cannot process request"
    });
  }
};

/* ===================== RESET PASSWORD ===================== */
export const ResetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    // Hash incoming token to match DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      userResetPasswordToken: hashedToken,
      userResetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.userResetPasswordToken = undefined;
    user.userResetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful"
    });

  } catch (error) {
    console.error("Error during reset password:", error);
    return res.status(500).json({
      success: false,
      message: "Cannot reset password"
    });
  }
};

export const CheckAuth = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json(
      new ApiResponse(201, user, "Authorized user")
    )
  } catch (error) {
    res.status(400).json(
      new ApiResponse(401, error, "Error in user authentication")
    )
  }
}