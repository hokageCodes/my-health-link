const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const passport = require("../config/passport");
const { signAccessToken, signRefreshToken } = require("../utils/tokens");
const bcrypt = require("bcryptjs");

// Email/password routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refresh);

// OTP
router.post("/verify-otp", authController.verifyOtp);
router.post("/resend-otp", authController.resendOtp);

// Password reset
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);

// Current user
router.get("/me", protect, (req, res) => {
  res.json({ 
    success: true,
    user: req.user 
  });
});

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", { 
    scope: ["profile", "email"],
    session: false // We'll use JWT tokens, not sessions
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`,
    session: false 
  }),
  async (req, res) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_no_user`);
      }

      // Generate tokens for the authenticated user
      const accessToken = signAccessToken(user._id, user.role);
      const refreshTokenData = signRefreshToken(user._id, user.role);

      if (!accessToken || !refreshTokenData?.token) {
        console.error("❌ Token generation failed for Google OAuth user");
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=token_generation_failed`);
      }

      // Store refresh token hash in database
      user.refreshTokenHash = await bcrypt.hash(refreshTokenData.token, 12);
      user.lastLoginAt = new Date();
      await user.save();

      // Redirect to frontend with tokens
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?` +
        `access_token=${accessToken}&` +
        `refresh_token=${refreshTokenData.token}&` +
        `user=${encodeURIComponent(JSON.stringify({
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        }))}`;

      res.redirect(redirectUrl);
    } catch (error) {
      console.error("❌ Google OAuth callback error:", error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_callback_error`);
    }
  }
);

module.exports = router;