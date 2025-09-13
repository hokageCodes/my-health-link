// src/controllers/caregiverController.js
const User = require("../models/User");
const { success, error } = require("../utils/response");

// ENROLL PATIENT
exports.enrollPatient = async (req, res) => {
  try {
    const { patientId } = req.body;

    const caregiver = req.user;
    const patient = await User.findById(patientId);

    if (!patient || patient.role !== "patient") {
      return error(res, "Patient not found", 404);
    }

    // Avoid duplicates
    if (!caregiver.patients.includes(patient._id)) {
      caregiver.patients.push(patient._id);
      await caregiver.save();
    }

    if (!patient.caregivers.includes(caregiver._id)) {
      patient.caregivers.push(caregiver._id);
      await patient.save();
    }

    return success(res, "Patient enrolled successfully", { patient });
  } catch (err) {
    return error(res, "Server error", 500, err.message);
  }
};

// GET CAREGIVER'S PATIENTS
exports.getAssignedPatients = async (req, res) => {
  try {
    const caregiver = await User.findById(req.user._id).populate("patients", "-passwordHash");
    return success(res, "Assigned patients fetched", { patients: caregiver.patients });
  } catch (err) {
    return error(res, "Server error", 500, err.message);
  }
};

// ADD CARE NOTE (per patient)
exports.addCareNote = async (req, res) => {
  try {
    const { id } = req.params; // patientId
    const { note } = req.body;

    const patient = await User.findById(id);
    if (!patient || patient.role !== "patient") {
      return error(res, "Patient not found", 404);
    }

    patient.careNotes = patient.careNotes || [];
    patient.careNotes.push({
      caregiver: req.user._id,
      note,
      createdAt: new Date(),
    });

    await patient.save();

    return success(res, "Care note added", { patient });
  } catch (err) {
    return error(res, "Server error", 500, err.message);
  }
};
