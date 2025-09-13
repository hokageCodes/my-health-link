const User = require("../models/User");
const Observation = require("../models/Observation");
const { success, error } = require("../utils/response");

// ===================== MY PATIENTS =====================
exports.getMyPatients = async (req, res) => {
  try {
    const patients = await User.find({ doctors: req.user._id, role: "patient" })
    .select("-passwordHash -refreshTokenHash -otp");

    return success(res, "Assigned patients fetched", { patients });
  } catch (err) {
    return error(res, "Server error", 500, err.message);
  }
};

// ===================== ADD OBSERVATION =====================
exports.addObservation = async (req, res) => {
  try {
    const { id } = req.params; // patient ID
    const { note, vitals } = req.body;

    const patient = await User.findById(id);
    if (!patient || patient.role !== "patient") {
      return error(res, "Patient not found", 404);
    }

    const obs = await Observation.create({
      patient: patient._id,
      doctor: req.user._id,
      note,
      vitals
    });

    return success(res, "Observation added", obs);
  } catch (err) {
    return error(res, "Server error", 500, err.message);
  }
};

// ===================== GET PATIENT OBSERVATIONS =====================
exports.getPatientObservations = async (req, res) => {
  try {
    const { id } = req.params;

    const observations = await Observation.find({ patient: id })
      .populate("doctor", "name email");

    return success(res, "Patient observations fetched", { observations });
  } catch (err) {
    return error(res, "Server error", 500, err.message);
  }
};
