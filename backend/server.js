require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('./src/middleware/rateLimiter');
const connectDB = require('./src/config/db');
const routes = require('./src/routes');
const errorHandler = require('./src/middleware/errorHandling');
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
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(rateLimit);


// CORS - tighten in production
const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:3000'];
app.use(cors({ origin: allowedOrigins, credentials: true }));


// Routes
app.use('/api', routes);
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/observations", observationRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/caregiver", caregiverRoutes);
app.use("/api/admin", adminRoutes);




// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', ts: new Date() }));


// Error handler
app.use(errorHandler);


app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});

