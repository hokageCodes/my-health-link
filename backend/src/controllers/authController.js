const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/tokens");
const { sendEmail } = require("../utils/email");

const MAX_FAILED_LOGIN = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes
const BCRYPT_ROUNDS = 12;

// Helper functions
const sendSuccess = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

const sendError = (res, message, statusCode = 400, error = null) => {
  if (process.env.NODE_ENV === 'development' && error) {
    console.error(`❌ ERROR [${statusCode}]:`, message, error.message || error);
  }
  return res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error : undefined,
    timestamp: new Date().toISOString()
  });
};

// Validation helpers
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.toLowerCase().trim());
};

const validatePassword = (password) => {
  return password.length >= 6 && password.length <= 100;
};

const validateName = (name) => {
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 100;
};

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return sendError(res, "Name, email, and password are required", 400);
    }

    if (!validateName(name)) {
      return sendError(res, "Name must be between 2-100 characters", 400);
    }

    const sanitizedEmail = email.toLowerCase().trim();
    if (!validateEmail(sanitizedEmail)) {
      return sendError(res, "Please provide a valid email address", 400);
    }

    if (!validatePassword(password)) {
      return sendError(res, "Password must be between 6-100 characters", 400);
    }

    const userRole = role && ['patient', 'caregiver', 'doctor'].includes(role) ? role : 'patient';

    // Check existing user
    const existingUser = await User.findOne({ email: sanitizedEmail });
    if (existingUser) {
      return sendError(res, "User with this email already exists", 409);
    }

    // Generate OTP and hash password
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: sanitizedEmail,
      passwordHash,
      role: userRole,
      isVerified: false,
      otp: { code: otpCode, expiresAt: otpExpires }
    });

    // Send OTP email
    const emailResult = await sendOTPEmail(user.email, user.name, otpCode);

    const responseData = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      },
      emailStatus: emailResult.success ? "sent" : "failed"
    };

    const message = emailResult.success 
      ? "Registration successful! Please check your email for the OTP verification code."
      : "User registered successfully, but there was an issue sending the OTP email. Please use the 'Resend OTP' option.";

    return sendSuccess(res, message, responseData, 201);

  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return sendError(res, `User with this ${field} already exists`, 409);
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return sendError(res, `Validation error: ${validationErrors.join(', ')}`, 400);
    }
    
    return sendError(res, "Internal server error during registration", 500, error);
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, "Email and password are required", 400);
    }

    const sanitizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: sanitizedEmail }).select('+passwordHash');
    
    if (!user) {
      return sendError(res, "Invalid email or password", 401);
    }

    // Check account lock
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return sendError(res, `Account is temporarily locked. Try again in ${lockTimeRemaining} minutes.`, 423);
    }

    // Verify password
    if (!user.passwordHash) {
      return sendError(res, "Account configuration error. Please contact support.", 500);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      
      if (user.failedLoginAttempts >= MAX_FAILED_LOGIN) {
        user.lockUntil = new Date(Date.now() + LOCK_TIME);
        await user.save();
        return sendError(res, "Too many failed login attempts. Account has been temporarily locked.", 423);
      }
      
      await user.save();
      return sendError(res, "Invalid email or password", 401);
    }

    // Check verification
    if (!user.isVerified) {
      return sendError(res, "Please verify your email address before logging in.", 403);
    }

    // Reset failed attempts
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;

    // Generate tokens
    const accessToken = signAccessToken(user._id, user.role);
    const refreshTokenData = signRefreshToken(user._id, user.role);

    if (!accessToken || !refreshTokenData?.token) {
      return sendError(res, "Authentication token generation failed", 500);
    }

    // Store refresh token hash
    user.refreshTokenHash = await bcrypt.hash(refreshTokenData.token, BCRYPT_ROUNDS);
    user.lastLoginAt = new Date();
    await user.save();

    const responseData = {
      accessToken,
      refreshToken: refreshTokenData.token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profileCompletion: user.getProfileCompletion ? user.getProfileCompletion() : 0
      }
    };

    return sendSuccess(res, "Login successful", responseData);

  } catch (error) {
    return sendError(res, "Internal server error during login", 500, error);
  }
};

// VERIFY OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return sendError(res, "Email and OTP are required", 400);
    }

    if (!/^\d{6}$/.test(otp)) {
      return sendError(res, "OTP must be a 6-digit number", 400);
    }

    const sanitizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: sanitizedEmail });

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    if (user.isVerified) {
      return sendError(res, "Account is already verified", 400);
    }

    if (!user.otp?.code) {
      return sendError(res, "No OTP found. Please request a new one.", 400);
    }

    if (Date.now() > user.otp.expiresAt) {
      user.otp = undefined;
      await user.save();
      return sendError(res, "OTP has expired. Please request a new one.", 400);
    }

    if (user.otp.code !== otp) {
      return sendError(res, "Invalid OTP. Please check and try again.", 400);
    }

    // Verify account
    user.isVerified = true;
    user.otp = undefined;
    user.verifiedAt = new Date();
    await user.save();

    return sendSuccess(res, "Account verified successfully! You can now log in.");

  } catch (error) {
    return sendError(res, "Internal server error during verification", 500, error);
  }
};

// RESEND OTP
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendError(res, "Email is required", 400);
    }

    const sanitizedEmail = email.toLowerCase().trim();
    if (!validateEmail(sanitizedEmail)) {
      return sendError(res, "Please provide a valid email address", 400);
    }

    const user = await User.findOne({ email: sanitizedEmail });
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    if (user.isVerified) {
      return sendError(res, "Account is already verified", 400);
    }

    // Generate new OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = { code: otpCode, expiresAt: otpExpires };
    await user.save();

    // Send new OTP
    const emailResult = await sendOTPEmail(user.email, user.name, otpCode, true);
    
    if (!emailResult.success) {
      return sendError(res, "Failed to send OTP email. Please try again later.", 500, emailResult.error);
    }

    return sendSuccess(res, "New OTP has been sent to your email address.");

  } catch (error) {
    return sendError(res, "Internal server error", 500, error);
  }
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendError(res, "Email is required", 400);
    }

    const sanitizedEmail = email.toLowerCase().trim();
    if (!validateEmail(sanitizedEmail)) {
      return sendError(res, "Please provide a valid email address", 400);
    }

    const user = await User.findOne({ email: sanitizedEmail });
    if (!user) {
      return sendSuccess(res, "If an account with that email exists, a password reset link has been sent.");
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000);
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetToken = { token: hashedToken, expiresAt: resetExpires };
    await user.save();

    // Create reset URL and send email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const emailResult = await sendPasswordResetEmail(user.email, user.name, resetUrl);
    
    if (!emailResult.success) {
      return sendError(res, "Failed to send password reset email. Please try again later.", 500, emailResult.error);
    }

    return sendSuccess(res, "If an account with that email exists, a password reset link has been sent.");

  } catch (error) {
    return sendError(res, "Internal server error", 500, error);
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return sendError(res, "Reset token and new password are required", 400);
    }

    if (!validatePassword(password)) {
      return sendError(res, "Password must be between 6-100 characters", 400);
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      "resetToken.token": hashedToken,
      "resetToken.expiresAt": { $gt: new Date() }
    });

    if (!user) {
      return sendError(res, "Invalid or expired reset token", 400);
    }

    // Update password and clear tokens
    user.passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    user.resetToken = undefined;
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    user.refreshTokenHash = undefined;
    await user.save();

    return sendSuccess(res, "Password has been reset successfully. You can now log in with your new password.");

  } catch (error) {
    return sendError(res, "Internal server error", 500, error);
  }
};

// REFRESH TOKEN
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendError(res, "Refresh token is required", 401);
    }

    // Verify JWT
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded?.id) {
      return sendError(res, "Invalid refresh token payload", 403);
    }

    // Get user and verify stored hash
    const user = await User.findById(decoded.id).select('+refreshTokenHash');
    if (!user?.refreshTokenHash) {
      return sendError(res, "Invalid refresh token - user not found or token revoked", 403);
    }

    const isValidRefreshToken = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isValidRefreshToken) {
      return sendError(res, "Invalid refresh token", 403);
    }

    // Generate new access token
    const accessToken = signAccessToken(decoded.id, decoded.role);
    
    return sendSuccess(res, "Access token refreshed", { accessToken });

  } catch (error) {
    return sendError(res, "Invalid or expired refresh token", 403, error);
  }
};

// LOGOUT
exports.logout = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return sendError(res, "User ID is required", 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    // Clear refresh token
    user.refreshTokenHash = undefined;
    user.lastLogoutAt = new Date();
    await user.save();

    return sendSuccess(res, "Logged out successfully");

  } catch (error) {
    return sendError(res, "Internal server error", 500, error);
  }
};

// GET CURRENT USER
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-passwordHash -refreshTokenHash -otp -resetToken')
      .populate('caregivers', 'name email role')
      .populate('patients', 'name email role')
      .populate('doctors', 'name email role');

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    const userData = {
      ...user.toObject(),
      profileCompletion: user.getProfileCompletion ? user.getProfileCompletion() : 0
    };

    return sendSuccess(res, "User data retrieved", { user: userData });

  } catch (error) {
    return sendError(res, "Internal server error", 500, error);
  }
};

// Email helper functions
async function sendOTPEmail(email, name, otpCode, isResend = false) {
  const subject = isResend ? "New Verification Code - MyHealthLink" : "Verify Your MyHealthLink Account";
  const title = isResend ? "New Verification Code" : "Welcome to MyHealthLink!";
  const message = isResend 
    ? "Here's your new verification code:" 
    : "Thanks for registering with MyHealthLink. Please verify your email address by entering this OTP:";

  const emailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb;">
      <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">MyHealthLink</h1>
      </div>
      <div style="padding: 30px 20px;">
        <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 20px;">${title}</h2>
        <p style="color: #4b5563; margin: 0 0 15px;">Hi ${name},</p>
        <p style="color: #4b5563; margin: 0 0 25px; line-height: 1.5;">${message}</p>
        <div style="background: #f3f4f6; border: 2px dashed #d1d5db; padding: 25px; text-align: center; margin: 25px 0; border-radius: 8px;">
          <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 1px;">Verification Code</p>
          <h1 style="color: #1f2937; letter-spacing: 4px; margin: 0; font-size: 28px; font-weight: bold; font-family: monospace;">${otpCode}</h1>
        </div>
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 15px; margin: 20px 0;">
          <p style="color: #92400e; margin: 0; font-size: 13px;">
            <strong>This code will expire in 10 minutes.</strong> If it expires, you can request a new one.
          </p>
        </div>
        <p style="color: #6b7280; font-size: 13px; margin: 0;">
          If you didn't create an account with MyHealthLink, please ignore this email.
        </p>
      </div>
      <div style="background: #f9fafb; padding: 15px 20px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="color: #9ca3af; font-size: 11px; margin: 0;">
          This is an automated email from MyHealthLink. Please do not reply.
        </p>
      </div>
    </div>
  `;

  return await sendEmail(email, subject, emailTemplate);
}

async function sendPasswordResetEmail(email, name, resetUrl) {
  const emailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb;">
      <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">MyHealthLink</h1>
      </div>
      <div style="padding: 30px 20px;">
        <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 20px;">Password Reset Request</h2>
        <p style="color: #4b5563; margin: 0 0 15px;">Hi ${name},</p>
        <p style="color: #4b5563; margin: 0 0 25px; line-height: 1.5;">
          We received a request to reset your password. Click the button below to create a new password:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
            Reset Password
          </a>
        </div>
        <p style="color: #6b7280; font-size: 13px; margin: 15px 0;">
          Or copy and paste this link in your browser:
        </p>
        <p style="word-break: break-all; color: #6b7280; background: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 11px;">
          ${resetUrl}
        </p>
        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 12px 15px; margin: 20px 0;">
          <p style="color: #991b1b; margin: 0; font-size: 13px;">
            <strong>This link will expire in 15 minutes.</strong> If it expires, you can request a new one.
          </p>
        </div>
        <p style="color: #6b7280; font-size: 13px; margin: 0;">
          If you didn't request this password reset, please ignore this email.
        </p>
      </div>
      <div style="background: #f9fafb; padding: 15px 20px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="color: #9ca3af; font-size: 11px; margin: 0;">
          This is an automated email from MyHealthLink. Please do not reply.
        </p>
      </div>
    </div>
  `;

  return await sendEmail(email, "Password Reset Request - MyHealthLink", emailTemplate);
}