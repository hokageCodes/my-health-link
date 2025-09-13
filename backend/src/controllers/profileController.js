const User = require("../models/User");
const { success, error } = require("../utils/response");
const _ = require("lodash");
const QRCode = require("qrcode");

// Allowed enums for validation
const allowedBloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const allowedGenotypes = ["AA", "AS", "SS", "AC", "SC"];

// ===================== GET MY PROFILE =====================
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash -refreshTokenHash -otp");
    if (!user) return error(res, "User not found", 404);

    return success(res, "Profile fetched", {
      user: user.toObject(),
      profileCompletion: user.getProfileCompletion(),
    });
  } catch (err) {
    return error(res, "Server error", 500, err.message);
  }
};

// ===================== UPDATE MY PROFILE =====================
exports.updateMyProfile = async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return error(res, "User not found", 404);

    // Validation
    if (updates.bloodType && !allowedBloodTypes.includes(updates.bloodType)) {
      return error(res, "Invalid blood type", 400);
    }
    if (updates.genotype && !allowedGenotypes.includes(updates.genotype)) {
      return error(res, "Invalid genotype", 400);
    }

    // Deep merge updates directly into profile
    _.merge(user.profile, updates);

    await user.save();

    return success(res, "Profile updated", {
      profile: user.profile,
      profileCompletion: user.getProfileCompletion(),
    });
  } catch (err) {
    return error(res, "Server error", 500, err.message);
  }
};

// ===================== GET PUBLIC PROFILE =====================
exports.getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;

    // Find user by username
    const user = await User.findOne({ username })
      .select("name profile verifiedFields role createdAt")
      .lean();

    if (!user) return error(res, "Profile not found", 404);

    // Generate QR code pointing to this public profile
    const profileUrl = `${process.env.FRONTEND_URL}/profile/${username}`;
    const qrCodeData = await QRCode.toDataURL(profileUrl);

    return success(res, "Public profile fetched", {
      user,
      qrCode: qrCodeData,
    });
  } catch (err) {
    return error(res, "Server error", 500, err.message);
  }
};

// ===================== HELPER: GENERATE USERNAME =====================
// Call this in registration or when creating new users
exports.generateUsername = (name, email) => {
  const base = name.toLowerCase().replace(/\s+/g, '');
  const timestamp = Date.now();
  return `${base}${timestamp}`;
};
