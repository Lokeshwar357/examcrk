const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const { protect } = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

// ── Razorpay Init ───────────────────────────────────────────
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── Plans ───────────────────────────────────────────────────
const PLANS = {
  monthly: {
    name: "Monthly",
    amount: 6000, // ₹60
    duration_days: 30,
  },
  quarterly: {
    name: "3 Months",
    amount: 14000, // ₹140
    duration_days: 90,
  },
  annual: {
    name: "Annual",
    amount: 20000, // ₹200
    duration_days: 365,
  },
};

// ── Normalize plan names from frontend ──────────────────────
const normalizePlan = (plan) => {
  if (!plan) return null;

  const map = {
    monthly: "monthly",
    month: "monthly",
    "1month": "monthly",

    quarterly: "quarterly",
    quarter: "quarterly",
    "3months": "quarterly",
    "3month": "quarterly",

    annual: "annual",
    yearly: "annual",
    year: "annual",
    "12months": "annual",
  };

  return map[String(plan).toLowerCase()] || null;
};

// ── Get plans ───────────────────────────────────────────────
router.get("/plans", (req, res) => {
  const plans = Object.entries(PLANS).map(([key, val]) => ({
    id: key,
    name: val.name,
    amount_inr: val.amount / 100,
    amount_paise: val.amount,
    duration_days: val.duration_days,
  }));

  return res.json({
    success: true,
    plans,
  });
});

// ── Create Razorpay order ───────────────────────────────────
router.post("/create-order", protect, async (req, res) => {
  try {
    const normalizedPlan = normalizePlan(req.body.plan);
    const planData = PLANS[normalizedPlan];

    if (!planData) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan selected",
      });
    }

    const order = await razorpay.orders.create({
      amount: planData.amount,
      currency: "INR",
      receipt: `order_${Date.now()}`,
      notes: {
        user_id: String(req.user._id),
        plan: normalizedPlan,
      },
    });

    return res.json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      plan: {
        id: normalizedPlan,
        name: planData.name,
        amount_inr: planData.amount / 100,
      },
      user: {
        name: req.user?.name || "",
        email: req.user?.email || "",
        phone: req.user?.phone || "",
      },
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    return res.status(500).json({
      success: false,
      message:
        error?.error?.description ||
        error.message ||
        "Failed to create payment order",
    });
  }
});

// ── Verify payment and activate premium ─────────────────────
router.post("/verify", protect, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification fields",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    const normalizedPlan = normalizePlan(plan);
    const planData = PLANS[normalizedPlan];

    if (!planData) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan for activation",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const now = new Date();

    // If premium already active, extend from current expiry
    let premiumStartDate = now;
    if (user.premium_expires_at && new Date(user.premium_expires_at) > now) {
      premiumStartDate = new Date(user.premium_expires_at);
    }

    const premiumExpiresAt = new Date(premiumStartDate);
    premiumExpiresAt.setDate(
      premiumExpiresAt.getDate() + planData.duration_days
    );

    // Save premium fields exactly as in User schema
    user.is_premium = true;
    user.premium_plan = normalizedPlan;
    user.premium_expires_at = premiumExpiresAt;

    await user.save();

    return res.json({
      success: true,
      message: "Payment verified and premium activated successfully",
      user: user.toPublicJSON(),
    });
  } catch (error) {
    console.error("VERIFY ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Verification failed",
    });
  }
});

// ── Payment history placeholder ─────────────────────────────
router.get("/history", protect, async (req, res) => {
  try {
    return res.json({
      success: true,
      payments: [],
    });
  } catch (error) {
    console.error("PAYMENT HISTORY ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load payment history",
    });
  }
});

module.exports = router;