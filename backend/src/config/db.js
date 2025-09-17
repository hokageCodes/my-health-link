const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGODB_URI; // 👈 make sure .env uses this exact key
  if (!uri) {
    throw new Error("❌ MONGODB_URI not set in environment variables");
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
