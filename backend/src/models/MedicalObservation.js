const mongoose = require("mongoose");

const MedicalObservationSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    note: { type: String, required: true },
    vitals: {
      bloodPressure: String,
      heartRate: String,
      temperature: String,
      respirationRate: String,
      oxygenSaturation: String,
    },
    attachments: [
      {
        url: String,
        public_id: String,
        type: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("MedicalObservation", MedicalObservationSchema);
