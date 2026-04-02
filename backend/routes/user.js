const express = require("express");
const { body, validationResult } = require("express-validator");
const { protect } = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

// GET /api/user/profile
router.get("/profile", protect, (req, res) => {
  res.json({ success: true, user: req.user.toPublicJSON() });
});

// PUT /api/user/profile
router.put(
  "/profile",
  protect,
  [
    body("name").optional().trim().isLength({ min: 2, max: 60 }),
    body("phone").optional().matches(/^\+?[1-9]\d{9,14}$/),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { name, phone } = req.body;
      const updates = {};
      if (name) updates.name = name;
      if (phone) updates.phone = phone;

      const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
      res.json({ success: true, user: user.toPublicJSON() });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/user/dashboard  — stats for dashboard page
router.get("/dashboard", protect, async (req, res, next) => {
  try {
    const user = req.user;
    const Payment = require("../models/Payment");

    const paymentCount = await Payment.countDocuments({ user_id: user._id, verified: true });

    res.json({
      success: true,
      dashboard: {
        user: user.toPublicJSON(),
        stats: {
          total_payments: paymentCount,
          is_premium: user.is_premium,
          premium_plan: user.premium_plan,
          premium_expires_at: user.premium_expires_at,
          days_until_expiry: user.premium_expires_at
            ? Math.max(0, Math.ceil((user.premium_expires_at - new Date()) / (1000 * 60 * 60 * 24)))
            : null,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
