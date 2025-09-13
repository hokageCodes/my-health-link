// src/routes/caregiverRoutes.js
const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const caregiverOnly = require("../middleware/caregiverMiddleware");
const { enrollPatient, getAssignedPatients, addCareNote } = require("../controllers/caregiverController");

const router = express.Router();
router.use(protect, caregiverOnly);

router.post("/patients/enroll", enrollPatient);
router.get("/patients", getAssignedPatients);
router.post("/patients/:id/notes", addCareNote);

module.exports = router;
