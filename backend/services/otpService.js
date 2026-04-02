const crypto = require("crypto");
const nodemailer = require("nodemailer");
const OTP = require("../models/OTP");

/**
 * Generate a cryptographically random 6-digit OTP.
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Send OTP via SMS using Twilio.
 */
const sendSMSOTP = async (phone, otp) => {
  // Twilio is optional — only initialise if credentials exist
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.warn("⚠️  Twilio credentials not set. OTP (dev):", otp);
    return true; // dev mode — skip actual SMS
  }

  const twilio = require("twilio")(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  await twilio.messages.create({
    body: `Your ExamCRK verification code is: ${otp}. Valid for ${process.env.OTP_EXPIRY_MINUTES || 10} minutes. Do not share this.`,
    from: process.env.TWILIO_PHONE,
    to: phone,
  });
  return true;
};

/**
 * Send OTP via Email using Nodemailer.
 */
const sendEmailOTP = async (email, otp, name = "Student") => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("⚠️  SMTP credentials not set. OTP (dev):", otp);
    return true;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"/></head>
    <body style="margin:0;padding:0;background:#0a0a09;font-family:'Segoe UI',sans-serif;">
      <div style="max-width:480px;margin:40px auto;background:#1a1a18;border:1px solid #272724;border-radius:16px;padding:40px;">
        <div style="font-size:24px;font-weight:800;color:#e8c84a;margin-bottom:24px;">ExamCRK Pro</div>
        <div style="font-size:16px;color:#f0ede4;margin-bottom:8px;">Hello ${name},</div>
        <div style="font-size:14px;color:#a8a49a;margin-bottom:32px;line-height:1.7;">
          Your verification code is below. It expires in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.
        </div>
        <div style="background:#0a0a09;border:1px solid #272724;border-radius:12px;padding:24px;text-align:center;margin-bottom:32px;">
          <div style="font-size:40px;font-weight:800;color:#e8c84a;letter-spacing:12px;">${otp}</div>
        </div>
        <div style="font-size:12px;color:#5e5c57;line-height:1.6;">
          Never share this code with anyone. ExamCRK will never ask for your OTP.
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"ExamCRK Pro" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `${otp} — Your ExamCRK verification code`,
    html,
  });
  return true;
};

/**
 * Create and store an OTP record, then send it.
 * @param {string} userId  - MongoDB user ID
 * @param {string} identifier - email or phone
 * @param {string} purpose - 'registration' | 'login' | 'password_reset'
 * @param {string} channel - 'email' | 'sms'
 * @param {string} [name] - user name for email template
 */
const createAndSendOTP = async (userId, identifier, purpose, channel = "email", name = "") => {
  // Invalidate any existing unused OTPs for this identifier + purpose
  await OTP.updateMany(
    { identifier: identifier.toLowerCase(), purpose, used: false },
    { $set: { used: true } }
  );

  const otp = generateOTP();
  const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;

  await OTP.create({
    user_id: userId,
    identifier: identifier.toLowerCase(),
    otp_code: otp,
    purpose,
    expires_at: new Date(Date.now() + expiryMinutes * 60 * 1000),
  });

  if (channel === "sms") {
    await sendSMSOTP(identifier, otp);
  } else {
    await sendEmailOTP(identifier, otp, name);
  }

  return true;
};

/**
 * Verify an OTP. Returns { valid: bool, message: string }.
 * Increments attempt counter and marks as used on success.
 */
const verifyOTP = async (identifier, otpCode, purpose) => {
  const record = await OTP.findOne({
    identifier: identifier.toLowerCase(),
    purpose,
    used: false,
    expires_at: { $gt: new Date() },
  }).select("+otp_code");

  if (!record) {
    return { valid: false, message: "OTP not found or expired. Request a new one." };
  }

  // Increment attempts
  record.attempts += 1;
  await record.save();

  const maxAttempts = parseInt(process.env.OTP_MAX_ATTEMPTS) || 5;
  if (record.attempts > maxAttempts) {
    record.used = true;
    await record.save();
    return { valid: false, message: "Too many failed attempts. Request a new OTP." };
  }

  if (record.otp_code !== otpCode.trim()) {
    return { valid: false, message: `Incorrect OTP. ${maxAttempts - record.attempts} attempt(s) remaining.` };
  }

  // Mark as used
  record.used = true;
  await record.save();

  return { valid: true, userId: record.user_id };
};

module.exports = { createAndSendOTP, verifyOTP };
