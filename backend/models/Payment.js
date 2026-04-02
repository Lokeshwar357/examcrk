const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Razorpay order ID (created on backend before checkout)
    order_id: {
      type: String,
      required: true,
      unique: true,
    },
    // Razorpay payment ID (returned after successful payment)
    payment_id: {
      type: String,
      default: null,
    },
    // Razorpay signature (for verification)
    signature: {
      type: String,
      default: null,
      select: false,
    },
    plan_name: {
      type: String,
      enum: ["monthly", "quarterly", "annual"],
      required: true,
    },
    amount: {
      type: Number, // in paise (INR × 100)
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["created", "paid", "failed", "refunded"],
      default: "created",
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

paymentSchema.index({ user_id: 1, status: 1 });

module.exports = mongoose.model("Payment", paymentSchema);
