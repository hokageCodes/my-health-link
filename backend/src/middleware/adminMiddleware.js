// Middleware to restrict access to admins only
const { error } = require("../utils/response");

module.exports = function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return error(res, "Not authorized as admin", 403);
  }
  next();
};
