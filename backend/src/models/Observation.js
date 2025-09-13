const mongoose = require("mongoose");

const ObservationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { 
      type: String, 
      enum: ["health", "environment", "safety", "other"], 
      default: "other" 
    },
    date: { type: Date, default: Date.now },
    attachments: [
      {
        url: String,
        public_id: String,
        type: String, // image/pdf/etc
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Observation", ObservationSchema);
