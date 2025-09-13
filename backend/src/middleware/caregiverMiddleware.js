const { error } = require("../utils/response");

module.exports = function caregiverOnly(req, res, next) {
  if (!req.user || req.user.role !== "caregiver") {
    return error(res, "Not authorized as caregiver", 403);
  }
  next();
};
