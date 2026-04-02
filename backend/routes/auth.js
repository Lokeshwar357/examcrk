const express = require("express");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const User = require("../models/User");
const { createAndSendOTP, verifyOTP } = require("../services/otpService");
const { sendTokenCookie, clearTokenCookie } = require("../services/tokenService");
const { protect } = require("../middleware/auth");

const router = express.Router();

// ── OTP-specific strict rate limiter ─────────────────────────
const otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { success: false, message: "Too many OTP requests. Wait 1 minute." },
});

// ── Validation helpers ────────────────────────────────────────
const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  return null;
};

// ────────────────────────────────────────────────────────────
// POST /api/auth/register
// ────────────────────────────────────────────────────────────
router.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2, max: 60 }).withMessage("Name must be 2–60 chars"),
    body("email").isEmail().normalizeEmail().withMessage("Invalid email"),
    body("phone").matches(/^\+?[1-9]\d{9,14}$/).withMessage("Invalid phone number"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage("Password must have uppercase, lowercase, and a number"),
  ],
  async (req, res, next) => {
    try {
      const validErr = handleValidation(req, res);
      if (validErr) return;

      const { name, email, phone, password } = req.body;

      // Check for existing account
      const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { phone }] });
      if (existing) {
        const field = existing.email === email.toLowerCase() ? "email" : "phone number";
        return res.status(409).json({ success: false, message: `This ${field} is already registered.` });
      }

      // Create user (password_hash pre-save hook will bcrypt it)
      const user = await User.create({
        name,
        email: email.toLowerCase(),
        phone,
        password_hash: password,
      });

      // Send OTP to email
      await createAndSendOTP(user._id, email.toLowerCase(), "registration", "email", name);

      res.status(201).json({
        success: true,
        message: "Account created. Check your email for the OTP.",
        user_id: user._id,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ────────────────────────────────────────────────────────────
// POST /api/auth/verify-otp
// ────────────────────────────────────────────────────────────
router.post(
  "/verify-otp",
  otpLimiter,
  [
    body("identifier").notEmpty().withMessage("Email or phone required"),
    body("otp").isLength({ min: 6, max: 6 }).isNumeric().withMessage("OTP must be 6 digits"),
    body("purpose").isIn(["registration", "login", "password_reset"]).withMessage("Invalid purpose"),
  ],
  async (req, res, next) => {
    try {
      const validErr = handleValidation(req, res);
      if (validErr) return;

      const { identifier, otp, purpose } = req.body;

      const result = await verifyOTP(identifier, otp, purpose);
      if (!result.valid) {
        return res.status(400).json({ success: false, message: result.message });
      }

      const user = await User.findById(result.userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found." });
      }

      // Mark verified (for registration OTP)
      if (purpose === "registration") {
        user.is_verified = true;
        user.last_login = new Date();
        await user.save();
      }

      // Issue JWT cookie
      sendTokenCookie(res, user._id);

      res.json({
        success: true,
        message: purpose === "registration" ? "Account verified!" : "Logged in successfully.",
        user: user.toPublicJSON(),
      });
    } catch (err) {
      next(err);
    }
  }
);

// ────────────────────────────────────────────────────────────
// POST /api/auth/login  (email + password)
// ────────────────────────────────────────────────────────────
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("Invalid email"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  async (req, res, next) => {
    try {
      const validErr = handleValidation(req, res);
      if (validErr) return;

      const { email, password } = req.body;

      // Fetch with password (select: false on model)
      const user = await User.findOne({ email: email.toLowerCase() }).select("+password_hash");
      if (!user) {
        // Generic message — don't reveal whether email exists
        return res.status(401).json({ success: false, message: "Invalid email or password." });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid email or password." });
      }

      if (!user.is_verified) {
        // Re-send OTP so they can verify
        await createAndSendOTP(user._id, user.email, "registration", "email", user.name);
        return res.status(403).json({
          success: false,
          message: "Account not verified. A new OTP has been sent to your email.",
          requires_verification: true,
          user_id: user._id,
        });
      }

      user.last_login = new Date();
      await user.save();

      sendTokenCookie(res, user._id);

      res.json({
        success: true,
        message: "Logged in successfully.",
        user: user.toPublicJSON(),
      });
    } catch (err) {
      next(err);
    }
  }
);

// ────────────────────────────────────────────────────────────
// POST /api/auth/login-otp  (send OTP for passwordless login)
// ────────────────────────────────────────────────────────────
router.post(
  "/login-otp",
  otpLimiter,
  [body("email").isEmail().normalizeEmail().withMessage("Invalid email")],
  async (req, res, next) => {
    try {
      const validErr = handleValidation(req, res);
      if (validErr) return;

      const { email } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });

      // Same response whether user exists or not — prevents user enumeration
      if (user && user.is_verified) {
        await createAndSendOTP(user._id, email.toLowerCase(), "login", "email", user.name);
      }

      res.json({
        success: true,
        message: "If an account exists for this email, an OTP has been sent.",
      });
    } catch (err) {
      next(err);
    }
  }
);

// ────────────────────────────────────────────────────────────
// POST /api/auth/resend-otp
// ────────────────────────────────────────────────────────────
router.post(
  "/resend-otp",
  otpLimiter,
  [
    body("identifier").notEmpty().withMessage("Email or phone required"),
    body("purpose").isIn(["registration", "login", "password_reset"]),
  ],
  async (req, res, next) => {
    try {
      const validErr = handleValidation(req, res);
      if (validErr) return;

      const { identifier, purpose } = req.body;
      const user = await User.findOne({
        $or: [{ email: identifier.toLowerCase() }, { phone: identifier }],
      });

      if (!user) {
        return res.status(404).json({ success: false, message: "No account found." });
      }

      await createAndSendOTP(user._id, identifier.toLowerCase(), purpose, "email", user.name);

      res.json({ success: true, message: "New OTP sent." });
    } catch (err) {
      next(err);
    }
  }
);

// ────────────────────────────────────────────────────────────
// POST /api/auth/logout
// ────────────────────────────────────────────────────────────
router.post("/logout", protect, (req, res) => {
  clearTokenCookie(res);
  res.json({ success: true, message: "Logged out." });
});

// ────────────────────────────────────────────────────────────
// GET /api/auth/me  (get current user from token)
// ────────────────────────────────────────────────────────────
router.get("/me", protect, (req, res) => {
  res.json({ success: true, user: req.user.toPublicJSON() });
});

module.exports = router;
