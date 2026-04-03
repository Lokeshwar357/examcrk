// trigger redeploy
require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const paymentRoutes = require("./routes/payment");
const userRoutes = require("./routes/user");

const app = express();

// ── Connect Database ────────────────────────────────────────
connectDB();

// ── Security Middleware ─────────────────────────────────────
app.use(helmet());

// ✅ FIXED CORS — allows Vercel frontend cross-domain
app.use(
  cors({
    origin: function (origin, callback) {
      const allowed = [
        "https://examcrk.vercel.app",
        process.env.FRONTEND_URL,
      ].filter(Boolean);
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Body Parsers ────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Logger ──────────────────────────────────────────────────
app.use(morgan("dev"));

// ── General Rate Limit ──────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
  max: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

app.use(generalLimiter);

// ── Auth Rate Limit ─────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many auth attempts. Please try again after 15 minutes.",
  },
});

// ── Health Route ────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ success: true, message: "ExamCRK backend running" });
});

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "ExamCRK API running", timestamp: new Date() });
});

// ── API Routes ──────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/user", userRoutes);

// ── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Global Error Handler ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Global error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
});

// ── Start Server ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 ExamCRK backend running on port ${PORT}`);
});
require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const paymentRoutes = require("./routes/payment");
const userRoutes = require("./routes/user");

const app = express();

// ── Connect Database ────────────────────────────────────────
connectDB();

// ── Security Middleware ─────────────────────────────────────
app.use(helmet());

// ✅ FIXED CORS — allows Vercel frontend cross-domain
app.use(
  cors({
    origin: function (origin, callback) {
      const allowed = [
        "https://examcrk.vercel.app",
        process.env.FRONTEND_URL,
      ].filter(Boolean);
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Body Parsers ────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Logger ──────────────────────────────────────────────────
app.use(morgan("dev"));

// ── General Rate Limit ──────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
  max: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

app.use(generalLimiter);

// ── Auth Rate Limit ─────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many auth attempts. Please try again after 15 minutes.",
  },
});

// ── Health Route ────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ success: true, message: "ExamCRK backend running" });
});

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "ExamCRK API running", timestamp: new Date() });
});

// ── API Routes ──────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/user", userRoutes);

// ── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Global Error Handler ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Global error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
});

// ── Start Server ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 ExamCRK backend running on port ${PORT}`);
});
require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const paymentRoutes = require("./routes/payment");
const userRoutes = require("./routes/user");

const app = express();

// ── Connect Database ────────────────────────────────────────
connectDB();

// ── Security Middleware ─────────────────────────────────────
app.use(helmet());

// ✅ FIXED CORS — allows Vercel frontend cross-domain
app.use(
  cors({
    origin: function (origin, callback) {
      const allowed = [
        "https://examcrk.vercel.app",
        process.env.FRONTEND_URL,
      ].filter(Boolean);
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Body Parsers ────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Logger ──────────────────────────────────────────────────
app.use(morgan("dev"));

// ── General Rate Limit ──────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
  max: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

app.use(generalLimiter);

// ── Auth Rate Limit ─────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many auth attempts. Please try again after 15 minutes.",
  },
});

// ── Health Route ────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ success: true, message: "ExamCRK backend running" });
});

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "ExamCRK API running", timestamp: new Date() });
});

// ── API Routes ──────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/user", userRoutes);

// ── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Global Error Handler ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Global error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
});

// ── Start Server ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 ExamCRK backend running on port ${PORT}`);
});
