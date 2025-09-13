const express = require("express");
const router = express.Router();
const {
  getMyProfile,
  updateMyProfile,
  getPublicProfile
} = require("../controllers/profileController");
const { protect } = require("../middleware/authMiddleware");

// Private routes
router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);

// Public route
router.get("/:username", getPublicProfile);

module.exports = router;
