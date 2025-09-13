const User = require("../models/User");
const { success, error } = require("../utils/response");

// GET ALL USERS
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash -refreshTokenHash -otp");
    return success(res, "Users fetched", { users });
  } catch (err) {
    return error(res, "Server error", 500, err.message);
  }
};

// GET SINGLE USER
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash -refreshTokenHash -otp");
    if (!user) return error(res, "User not found", 404);
    return success(res, "User fetched", { user });
  } catch (err) {
    return error(res, "Server error", 500, err.message);
  }
};

// UPDATE USER
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select("-passwordHash");
    if (!user) return error(res, "User not found", 404);

    return success(res, "User updated", { user });
  } catch (err) {
    return error(res, "Server error", 500, err.message);
  }
};

// DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return error(res, "User not found", 404);
    return success(res, "User deleted", { user });
  } catch (err) {
    return error(res, "Server error", 500, err.message);
  }
};

// TOGGLE ACTIVE/INACTIVE
exports.toggleUserActive = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return error(res, "User not found", 404);

    user.isActive = !user.isActive;
    await user.save();

    return success(res, `User ${user.isActive ? "activated" : "deactivated"}`, { user });
  } catch (err) {
    return error(res, "Server error", 500, err.message);
  }
};
