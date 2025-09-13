const mongoose = require("mongoose");

const VersionSchema = new mongoose.Schema({
  fileUrl: String,
  fileType: String,
  uploadedAt: { type: Date, default: Date.now }
});

const DocumentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String },
    category: {
      type: String,
      enum: [
        "Lab Results",
        "Prescriptions",
        "Medical Images",
        "Doctor Notes",
        "Insurance Documents",
        "Vaccination Records",
        "Other"
      ],
      required: true,
    },
    fileUrl: { type: String, required: true },
    fileType: { type: String },
    extractedText: { type: String }, // OCR text
    tags: [{ type: String }], // auto/manual tags
    versions: [VersionSchema], // version history
    shareToken: { type: String }, // secure link token
    shareTokenExpires: { type: Date },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", DocumentSchema);
