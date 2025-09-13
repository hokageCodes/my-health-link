const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  createObservation,
  deleteObservation,
  getObservations,
  getObservation,
  updateObservation,
} = require("../controllers/observationController");

const router = express.Router();

// All observation routes require login
router.use(protect);

// 📝 CRUD operations for observations
router.post("/", upload.array("attachments", 5), createObservation);
router.get("/", getObservations);
router.get("/:id", getObservation);
router.put("/:id", upload.array("attachments", 5), updateObservation);
router.delete("/:id", deleteObservation);

module.exports = router;
