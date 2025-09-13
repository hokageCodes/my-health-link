const { error } = require("../utils/response");

module.exports = function doctorOnly(req, res, next) {
  if (!req.user || req.user.role !== "doctor") {
    return error(res, "Not authorized as doctor", 403);
  }
  next();
};
