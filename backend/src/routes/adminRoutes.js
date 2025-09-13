const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  toggleUserActive,
} = require("../controllers/adminController");

const router = express.Router();

// All routes here require authentication + admin role
router.use(protect, adminOnly);

// 👤 User management
router.get("/users", getUsers);
router.get("/users/:id", getUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id/toggle", toggleUserActive);

module.exports = router;
