const jwt = require("jsonwebtoken");

const COOKIE_NAME = "examcrk_token";
const IS_PROD = process.env.NODE_ENV === "production";

const signToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const sendTokenCookie = (res, userId) => {
  const token = signToken(userId);

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? "None" : "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    // ✅ domain line REMOVED — fixes cross-domain cookie rejection
  });

  return token;
};

const clearTokenCookie = (res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? "None" : "Lax",
    // ✅ domain line REMOVED here too
  });
};

module.exports = { signToken, sendTokenCookie, clearTokenCookie };
