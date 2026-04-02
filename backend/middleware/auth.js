const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Protect routes — verifies JWT from HTTP-only cookie or Authorization header.
 * Attaches `req.user` on success.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Check HTTP-only cookie (preferred — not accessible by JS)
    if (req.cookies && req.cookies.examcrk_token) {
      token = req.cookies.examcrk_token;
    }
    // 2. Fallback: Authorization header (for mobile / API clients)
    else if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authenticated. Please log in." });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user (catches deleted/deactivated accounts)
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "User no longer exists." });
    }

    if (!user.is_verified) {
      return res.status(403).json({ success: false, message: "Please verify your account first." });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token." });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired. Please log in again." });
    }
    next(err);
  }
};

/**
 * Require premium subscription.
 * Use after `protect`.
 */
const requirePremium = (req, res, next) => {
  if (!req.user.is_premium) {
    return res.status(403).json({
      success: false,
      message: "This feature requires a premium subscription.",
      upgrade_required: true,
    });
  }
  next();
};

module.exports = { protect, requirePremium };
