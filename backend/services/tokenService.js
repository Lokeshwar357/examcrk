const jwt = require("jsonwebtoken");

const COOKIE_NAME = "examcrk_token";
const IS_PROD = process.env.NODE_ENV === "production";

/**
 * Sign a JWT for a given userId.
 */
const signToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

/**
 * Send JWT as an HTTP-only, Secure, SameSite cookie.
 * HTTP-only = JavaScript cannot read it → prevents XSS token theft.
 */
const sendTokenCookie = (res, userId) => {
  const token = signToken(userId);

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,               // JS cannot access
    secure: IS_PROD,              // HTTPS only in production
    sameSite: IS_PROD ? "None" : "Lax", // cross-site in prod (Vercel→Render)
    maxAge: 7 * 24 * 60 * 60 * 1000,   // 7 days in ms
    domain: IS_PROD ? process.env.COOKIE_DOMAIN : undefined,
  });

  return token;
};

/**
 * Clear the auth cookie (logout).
 */
const clearTokenCookie = (res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? "None" : "Lax",
  });
};

module.exports = { signToken, sendTokenCookie, clearTokenCookie };
