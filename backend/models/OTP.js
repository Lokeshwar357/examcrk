const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // Identifier used to look up — email or phone
  identifier: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otp_code: {
    type: String,
    required: true,
    select: false, // never returned unless explicitly selected
  },
  purpose: {
    type: String,
    enum: ["registration", "login", "password_reset"],
    required: true,
  },
  expires_at: {
    type: Date,
    required: true,
  },
  used: {
    type: Boolean,
    default: false,
  },
  attempts: {
    type: Number,
    default: 0,
    max: [5, "Max attempts exceeded"],
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// ── Auto-expire documents via TTL index ──────────────────────
otpSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

// ── Compound index for efficient lookups ─────────────────────
otpSchema.index({ identifier: 1, purpose: 1, used: 1 });

module.exports = mongoose.model("OTP", otpSchema);
