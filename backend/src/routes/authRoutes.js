const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const passport = require("../config/passport");

// Auth routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refresh);

// OTP
router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);

// Password reset
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);

// Protected example
router.get("/me", protect, (req, res) => {
  res.json({ user: req.user });
});

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

const { signAccessToken, signRefreshToken } = require("../utils/tokens");

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  (req, res) => {
    const accessToken = signAccessToken(req.user._id);
    const refreshToken = signRefreshToken(req.user._id);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // redirect back to frontend
    res.redirect(process.env.FRONTEND_URL);
  }
);

module.exports = router;
