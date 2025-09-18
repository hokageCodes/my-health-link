require("dotenv").config();
const express = require("express");
const session = require("express-session");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const rateLimit = require("./src/middleware/rateLimiter");
const connectDB = require("./src/config/db");

// Import routes
const routes = require("./src/routes");
const authRoutes = require("./src/routes/authRoutes");
const profileRoutes = require("./src/routes/profileRoutes");
const documentRoutes = require("./src/routes/documentRoutes");
const observationRoutes = require("./src/routes/observationRoutes");
const doctorRoutes = require("./src/routes/doctorRoutes");
const caregiverRoutes = require("./src/routes/caregiverRoutes");
const adminRoutes = require("./src/routes/adminRoutes");

const app = express();
const PORT = process.env.PORT || 4000;

// Connect DB
connectDB();

// Middlewares
app.use(helmet());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(rateLimit);

// ✅ Fix CORS
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
];

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use(session({
  secret: process.env.SESSION_SECRET || "fallback_secret_key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api", routes);
app.use("/api/auth", authRoutes); // <-- Google OAuth lives here
app.use("/api/documents", documentRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/observations", observationRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/caregiver", caregiverRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/health", (req, res) =>
  res.json({ status: "ok", ts: new Date() })
);

// Error handler
const errorHandler = require("./src/middleware/errorHandling");
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
