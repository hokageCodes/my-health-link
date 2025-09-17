const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const slugify = require("slugify");

const UserSchema = new mongoose.Schema(
  {
    // ========== Auth & Base ==========
    name: { type: String, required: true },
    username: { type: String, unique: true, lowercase: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String },
    passwordHash: { type: String },
    role: {
      type: String,
      enum: ["patient", "caregiver", "doctor", "admin"],
      default: "patient",
    },

    // relationships
    caregivers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    patients: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // notes
    careNotes: [
      {
        caregiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        note: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // ========== Verification ==========
    isVerified: { type: Boolean, default: false },
    otp: {
      code: { type: String },
      expiresAt: { type: Date },
    },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    refreshTokenHash: { type: String },
    googleId: { type: String },

    // ========== Profile ==========
    profile: {
      dateOfBirth: { type: Date },
      gender: { type: String, enum: ["male", "female", "other"] },
      bloodType: {
        type: String,
        enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      },
      genotype: {
        type: String,
        enum: ["AA", "AS", "SS", "AC", "SC"],
        default: "AA",
      },
      allergies: [{ type: String }],
      chronicConditions: [{ type: String }],
      medications: [
        {
          name: String,
          dosage: String,
          frequency: String,
        },
      ],
      emergencyContact: { name: String, phone: String },
    },

    verifiedFields: [{ type: String }],
  },
  { timestamps: true }
);

// ========== Methods ==========

// Compare password
UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

// Hash password
UserSchema.statics.hashPassword = function (password) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

// Profile completion calculation
UserSchema.methods.getProfileCompletion = function () {
  let completed = 0;
  const requiredFields = [
    "name",
    "email",
    "phone",
    "profile.dateOfBirth",
    "profile.gender",
    "profile.bloodType",
    "profile.genotype",
    "profile.allergies",
    "profile.chronicConditions",
    "profile.emergencyContact.phone",
  ];

  requiredFields.forEach((field) => {
    const parts = field.split(".");
    let value = this;
    for (const part of parts) value = value?.[part];
    if (value && (Array.isArray(value) ? value.length > 0 : true)) completed++;
  });

  return Math.round((completed / requiredFields.length) * 100);
};

// Pre-save hook to generate username if not set
UserSchema.pre("save", async function (next) {
  if (!this.username) {
    let base = slugify(this.name, { lower: true, strict: true });
    let username = base;
    let count = 1;
    while (await mongoose.models.User.findOne({ username })) {
      username = `${base}${count++}`;
    }
    this.username = username;
  }
  next();
});

module.exports = mongoose.model("User", UserSchema);
