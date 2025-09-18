const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const slugify = require("slugify");

const UserSchema = new mongoose.Schema(
  {
    // ========== Auth & Base ==========
    name: { type: String, required: true },
    username: { type: String, unique: true, lowercase: true, sparse: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String },
    passwordHash: { 
      type: String,
      required: function() {
        // Password is only required if not using OAuth
        return !this.googleId;
      }
    },
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
    refreshTokenHash: { type: String, select: false }, // Hide by default
    
    // OAuth fields
    googleId: { type: String, sparse: true }, // Allow null values and create sparse index
    
    // Password reset
    resetToken: {
      token: { type: String },
      expiresAt: { type: Date }
    },

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
    
    // Timestamps for tracking
    lastLoginAt: { type: Date },
    lastLogoutAt: { type: Date },
    verifiedAt: { type: Date },
  },
  { 
    timestamps: true,
    // Ensure indexes are created properly
    index: { googleId: 1 }
  }
);

// ========== Indexes ==========
// Compound index for OAuth users
UserSchema.index({ email: 1, googleId: 1 });

// ========== Methods ==========

// Compare password - handle OAuth users
UserSchema.methods.comparePassword = function (password) {
  if (!this.passwordHash) {
    return false; // OAuth users don't have passwords to compare
  }
  return bcrypt.compare(password, this.passwordHash);
};

// Hash password
UserSchema.statics.hashPassword = function (password) {
  const salt = bcrypt.genSaltSync(12); // Increased salt rounds for better security
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

// Check if user is OAuth user
UserSchema.methods.isOAuthUser = function () {
  return !!this.googleId;
};

// Pre-save hook to generate username if not set
UserSchema.pre("save", async function (next) {
  if (!this.username && this.name) {
    let base = slugify(this.name, { lower: true, strict: true });
    let username = base;
    let count = 1;
    
    // Check for existing usernames
    while (await mongoose.models.User.findOne({ username })) {
      username = `${base}${count++}`;
    }
    this.username = username;
  }
  next();
});

// Pre-save hook for password hashing
UserSchema.pre('save', async function(next) {
  // Only hash password if it's new or modified and exists
  if (!this.isModified('passwordHash') || !this.passwordHash) {
    return next();
  }
  
  // Hash the password
  try {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("User", UserSchema);