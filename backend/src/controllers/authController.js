const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/tokens");
const { sendEmail } = require("../utils/email");

const MAX_FAILED_LOGIN = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes
const BCRYPT_ROUNDS = 12;

// Helper functions for consistent responses
const sendSuccess = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

const sendError = (res, message, statusCode = 400, error = null) => {
  console.error(`❌ ERROR [${statusCode}]:`, message, error ? error.message || error : '');
  return res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error : undefined,
    timestamp: new Date().toISOString()
  });
};

// REGISTER
exports.register = async (req, res) => {
  try {
    console.log("📝 Registration attempt:", req.body.email);
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return sendError(res, "Name, email, and password are required", 400);
    }

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      return sendError(res, "Name must be at least 2 characters long", 400);
    }
    if (trimmedName.length > 100) {
      return sendError(res, "Name cannot exceed 100 characters", 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sanitizedEmail = email.toLowerCase().trim();
    if (!emailRegex.test(sanitizedEmail)) {
      return sendError(res, "Please provide a valid email address", 400);
    }

    if (password.length < 6) {
      return sendError(res, "Password must be at least 6 characters long", 400);
    }
    if (password.length > 100) {
      return sendError(res, "Password cannot exceed 100 characters", 400);
    }

    if (role && !['patient', 'caregiver', 'doctor'].includes(role)) {
      return sendError(res, "Invalid role specified", 400);
    }
    const userRole = role || "patient";

    // Check if user already exists
    const existingUser = await User.findOne({ email: sanitizedEmail });
    if (existingUser) {
      return sendError(res, "User with this email already exists", 409);
    }

    console.log("✅ All validations passed, proceeding with registration...");

    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Hash password
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Create user
    const userData = {
      name: trimmedName,
      email: sanitizedEmail,
      passwordHash,
      role: userRole,
      isVerified: false,
      otp: {
        code: otpCode,
        expiresAt: otpExpires
      },
      failedLoginAttempts: 0,
      createdAt: new Date()
    };

    const user = await User.create(userData);
    console.log("✅ User created in database:", user.email);

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

    if (!emailResult.success) {
      console.warn("⚠️ Email sending failed but user was created:", emailResult.error);
      return sendSuccess(
        res,
        "User registered successfully, but there was an issue sending the OTP email. Please use the 'Resend OTP' option.",
        responseData,
        201
      );
    }

    console.log("✅ Registration completed successfully");
    return sendSuccess(
      res,
      "Registration successful! Please check your email for the OTP verification code.",
      responseData,
      201
    );

  } catch (error) {
    console.error("❌ REGISTRATION ERROR:", error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return sendError(res, `User with this ${field} already exists`, 409);
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return sendError(res, `Validation error: ${validationErrors.join(', ')}`, 400);
    }
    
    return sendError(res, "Internal server error during registration", 500);
  }
};

// LOGIN - ENHANCED VERSION WITH DEBUGGING
exports.login = async (req, res) => {
  try {
    console.log("🔑 Login attempt:", req.body.email);
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      console.log("❌ Missing email or password");
      return sendError(res, "Email and password are required", 400);
    }

    const sanitizedEmail = email.toLowerCase().trim();
    console.log("🔍 Looking for user with email:", sanitizedEmail);
    
    // Find user - make sure to select passwordHash
    const user = await User.findOne({ email: sanitizedEmail }).select('+passwordHash');
    
    if (!user) {
      console.log("❌ User not found for email:", sanitizedEmail);
      return sendError(res, "Invalid email or password", 401);
    }

    console.log("✅ User found:", {
      id: user._id,
      email: user.email,
      hasPasswordHash: !!user.passwordHash,
      passwordHashLength: user.passwordHash?.length,
      isVerified: user.isVerified,
      failedAttempts: user.failedLoginAttempts,
      lockUntil: user.lockUntil
    });

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
      console.log("🔒 Account locked for", lockTimeRemaining, "minutes");
      return sendError(res, `Account is temporarily locked. Try again in ${lockTimeRemaining} minutes.`, 423);
    }

    // Verify password hash exists
    if (!user.passwordHash) {
      console.error("❌ No password hash found for user:", user.email);
      return sendError(res, "Account configuration error. Please contact support.", 500);
    }

    // Password verification with detailed logging
    console.log("🔐 Verifying password...");
    console.log("Password length:", password.length);
    console.log("Hash starts with:", user.passwordHash.substring(0, 7));
    
    let isPasswordValid;
    try {
      isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      console.log("🔍 Password comparison result:", isPasswordValid);
    } catch (bcryptError) {
      console.error("❌ Bcrypt comparison error:", bcryptError);
      return sendError(res, "Authentication error", 500);
    }

    if (!isPasswordValid) {
      console.log("❌ Invalid password for user:", user.email);
      
      // Increment failed login attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      console.log("Failed attempts now:", user.failedLoginAttempts);
      
      if (user.failedLoginAttempts >= MAX_FAILED_LOGIN) {
        user.lockUntil = new Date(Date.now() + LOCK_TIME);
        await user.save();
        console.warn(`🔒 Account locked for user: ${user.email}`);
        return sendError(res, "Too many failed login attempts. Account has been temporarily locked.", 423);
      }
      
      await user.save();
      return sendError(res, "Invalid email or password", 401);
    }

    // Check if account is verified
    if (!user.isVerified) {
      console.log("❌ Account not verified for user:", user.email);
      return sendError(res, "Please verify your email address before logging in.", 403);
    }

    console.log("✅ Password valid, proceeding with login...");

    // Reset failed login attempts and unlock account on successful login
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;

    // Generate tokens with error handling
     let accessToken, refreshTokenData;
    try {
      accessToken = signAccessToken(user._id, user.role);
      refreshTokenData = signRefreshToken(user._id, user.role); // This returns { token, hash }
      
      console.log("🔑 Tokens generated:", { 
        accessToken: !!accessToken, 
        refreshTokenData: !!refreshTokenData,
        accessTokenLength: accessToken?.length,
        refreshTokenLength: refreshTokenData?.token?.length
      });

      if (!accessToken) {
        console.error("❌ Access token generation failed");
        return sendError(res, "Access token generation failed", 500);
      }

      if (!refreshTokenData || !refreshTokenData.token) {
        console.error("❌ Refresh token generation failed");
        return sendError(res, "Refresh token generation failed", 500);
      }
    } catch (tokenError) {
      console.error("❌ Token generation error:", tokenError);
      return sendError(res, "Authentication token error", 500);
    }

    // Hash and store refresh token
    try {
      // Use the hash from refreshTokenData instead of generating a new one
      user.refreshTokenHash = await bcrypt.hash(refreshTokenData.token, BCRYPT_ROUNDS);
      user.lastLoginAt = new Date();
      await user.save();
      console.log("✅ User updated with refresh token hash");
    } catch (saveError) {
      console.error("❌ Error saving user:", saveError);
      return sendError(res, "Database save error", 500);
    }

    console.log("✅ Login successful for:", user.email);

    // Prepare response data - use refreshTokenData.token for the actual token
    const responseData = {
      accessToken,
      refreshToken: refreshTokenData.token, // Use the actual token, not the hash
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profileCompletion: user.getProfileCompletion ? user.getProfileCompletion() : 0
      }
    };

    console.log("📤 Sending response with data structure:", {
      hasAccessToken: !!responseData.accessToken,
      hasRefreshToken: !!responseData.refreshToken,
      hasUser: !!responseData.user,
      userFields: Object.keys(responseData.user)
    });

    return sendSuccess(res, "Login successful", responseData);

  } catch (error) {
    console.error("❌ UNEXPECTED LOGIN ERROR:", error);
    console.error("Error stack:", error.stack);
    return sendError(res, "Internal server error during login", 500);
  }
};

// VERIFY OTP
exports.verifyOtp = async (req, res) => {
  try {
    console.log("🔐 OTP verification attempt:", req.body.email);
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

    // Verify the account
    user.isVerified = true;
    user.otp = undefined;
    user.verifiedAt = new Date();
    await user.save();

    console.log("✅ Account verified:", user.email);
    return sendSuccess(res, "Account verified successfully! You can now log in.");

  } catch (error) {
    console.error("❌ OTP VERIFICATION ERROR:", error);
    return sendError(res, "Internal server error during verification", 500);
  }
};

// RESEND OTP
exports.resendOtp = async (req, res) => {
  try {
    console.log("📩 Resend OTP request:", req.body.email);
    const { email } = req.body;

    if (!email) {
      return sendError(res, "Email is required", 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sanitizedEmail = email.toLowerCase().trim();
    
    if (!emailRegex.test(sanitizedEmail)) {
      return sendError(res, "Please provide a valid email address", 400);
    }

    const user = await User.findOne({ email: sanitizedEmail });
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    if (user.isVerified) {
      return sendError(res, "Account is already verified", 400);
    }

    console.log("✅ Generating new OTP...");

    // Generate new OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = {
      code: otpCode,
      expiresAt: otpExpires
    };
    await user.save();

    console.log("✅ New OTP saved to database");

    // Send new OTP email
    const emailResult = await sendOTPEmail(user.email, user.name, otpCode, true);
    
    if (!emailResult.success) {
      console.error("❌ Failed to send resend OTP email:", emailResult.error);
      return sendError(res, "Failed to send OTP email. Please try again later.", 500);
    }

    console.log("✅ New OTP sent successfully");
    return sendSuccess(res, "New OTP has been sent to your email address.");

  } catch (error) {
    console.error("❌ RESEND OTP ERROR:", error);
    return sendError(res, "Internal server error", 500);
  }
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    console.log("🔒 Forgot password request:", req.body.email);
    const { email } = req.body;

    if (!email) {
      return sendError(res, "Email is required", 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sanitizedEmail = email.toLowerCase().trim();
    
    if (!emailRegex.test(sanitizedEmail)) {
      return sendError(res, "Please provide a valid email address", 400);
    }

    const user = await User.findOne({ email: sanitizedEmail });
    if (!user) {
      console.log("⚠️ Password reset requested for non-existent email:", sanitizedEmail);
      return sendSuccess(res, "If an account with that email exists, a password reset link has been sent.");
    }

    console.log("✅ Valid user found, generating reset token...");

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000);

    // Hash token before storing
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetToken = {
      token: hashedToken,
      expiresAt: resetExpires
    };
    await user.save();

    console.log("✅ Reset token saved to database");

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(user.email, user.name, resetUrl);
    
    if (!emailResult.success) {
      console.error("❌ Failed to send password reset email:", emailResult.error);
      return sendError(res, "Failed to send password reset email. Please try again later.", 500);
    }

    console.log("✅ Password reset email sent successfully");
    return sendSuccess(res, "If an account with that email exists, a password reset link has been sent.");

  } catch (error) {
    console.error("❌ FORGOT PASSWORD ERROR:", error);
    return sendError(res, "Internal server error", 500);
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    console.log("🔑 Password reset attempt");
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return sendError(res, "Reset token and new password are required", 400);
    }

    if (password.length < 6) {
      return sendError(res, "Password must be at least 6 characters long", 400);
    }

    if (password.length > 100) {
      return sendError(res, "Password cannot exceed 100 characters", 400);
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with valid reset token
    const user = await User.findOne({
      "resetToken.token": hashedToken,
      "resetToken.expiresAt": { $gt: new Date() }
    });

    if (!user) {
      return sendError(res, "Invalid or expired reset token", 400);
    }

    // Update password and clear reset token
    user.passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    user.resetToken = undefined;
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    user.refreshTokenHash = undefined; // Invalidate all existing sessions
    await user.save();

    console.log("✅ Password reset successful:", user.email);
    return sendSuccess(res, "Password has been reset successfully. You can now log in with your new password.");

  } catch (error) {
    console.error("❌ RESET PASSWORD ERROR:", error);
    return sendError(res, "Internal server error", 500);
  }
};

// REFRESH TOKEN - FIXED VERSION
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendError(res, "Refresh token is required", 401);
    }

    // Verify the refresh token JWT
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (tokenError) {
      console.error("Invalid refresh token JWT:", tokenError.message);
      return sendError(res, "Invalid or expired refresh token", 403);
    }

    if (!decoded || !decoded.id) {
      return sendError(res, "Invalid refresh token payload", 403);
    }

    // Get user from database
    const user = await User.findById(decoded.id).select('+refreshTokenHash');
    if (!user || !user.refreshTokenHash) {
      return sendError(res, "Invalid refresh token - user not found or token revoked", 403);
    }

    // Verify the refresh token hash matches what's stored
    const isValidRefreshToken = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isValidRefreshToken) {
      console.warn(`🚨 Refresh token hash mismatch for user: ${user.email}`);
      return sendError(res, "Invalid refresh token", 403);
    }

    // Generate new access token
    const accessToken = signAccessToken(decoded.id, decoded.role);

    console.log("✅ Token refreshed for user:", decoded.id);
    
    // FIXED: Ensure proper response structure
    return sendSuccess(res, "Access token refreshed", { accessToken });

  } catch (error) {
    console.error("❌ TOKEN REFRESH ERROR:", error);
    return sendError(res, "Internal server error", 500);
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

    // Clear refresh token from database
    user.refreshTokenHash = undefined;
    user.lastLogoutAt = new Date();
    await user.save();

    console.log("✅ User logged out:", user.email);
    return sendSuccess(res, "Logged out successfully");

  } catch (error) {
    console.error("❌ LOGOUT ERROR:", error);
    return sendError(res, "Internal server error", 500);
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
    console.error("❌ GET CURRENT USER ERROR:", error);
    return sendError(res, "Internal server error", 500);
  }
};

// Helper function for sending OTP emails
async function sendOTPEmail(email, name, otpCode, isResend = false) {
  const subject = isResend ? "New Verification Code - HealthTree" : "Verify Your HealthTree Account";
  const title = isResend ? "New Verification Code" : "Welcome to HealthTree!";
  const message = isResend 
    ? "Here's your new verification code:" 
    : "Thanks for registering with HealthTree. Please verify your email address by entering this OTP:";

  const emailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb;">
      <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">HealthTree</h1>
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
          If you didn't create an account with HealthTree, please ignore this email.
        </p>
      </div>
      <div style="background: #f9fafb; padding: 15px 20px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="color: #9ca3af; font-size: 11px; margin: 0;">
          This is an automated email from HealthTree. Please do not reply.
        </p>
      </div>
    </div>
  `;

  return await sendEmail(email, subject, emailTemplate);
}

// Helper function for sending password reset emails
async function sendPasswordResetEmail(email, name, resetUrl) {
  const emailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb;">
      <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">HealthTree</h1>
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
          This is an automated email from HealthTree. Please do not reply.
        </p>
      </div>
    </div>
  `;

  return await sendEmail(email, "Password Reset Request - HealthTree", emailTemplate);
}