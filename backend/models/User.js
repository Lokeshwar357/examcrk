const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [60, "Name too long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
      match: [/^\+?[1-9]\d{9,14}$/, "Invalid phone number"],
    },
    password_hash: {
      type: String,
      required: true,
      select: false,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    is_premium: {
      type: Boolean,
      default: false,
    },
    premium_plan: {
      type: String,
      enum: ["free", "monthly", "quarterly", "annual"],
      default: "free",
    },
    premium_expires_at: {
      type: Date,
      default: null,
    },
    avatar_url: {
      type: String,
      default: null,
    },
    last_login: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password_hash")) return next();
  this.password_hash = await bcrypt.hash(this.password_hash, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password_hash);
};

userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    is_verified: this.is_verified,
    is_premium: this.is_premium,
    premium_plan: this.premium_plan,
    premium_expires_at: this.premium_expires_at,
    created_at: this.created_at,
  };
};

module.exports = mongoose.model("User", userSchema);