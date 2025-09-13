const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const doctorOnly = require("../middleware/doctorMiddleware");
const {
  getMyPatients,
  addObservation,
  getPatientObservations
} = require("../controllers/doctorController");

const router = express.Router();

router.use(protect, doctorOnly);

// Doctor can see their assigned patients
router.get("/patients", getMyPatients);

// Doctor can add new observation for a patient
router.post("/patients/:id/observations", addObservation);

// Doctor can view observations of a patient
router.get("/patients/:id/observations", getPatientObservations);

module.exports = router;
