const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Never returned by default — must use .select('+password') explicitly
    },
    avatar: {
      type: String,
      default: "",
    },
    dietaryPreferences: {
      type: [String],
      enum: ["veg", "non-veg", "vegan", "gluten-free", "dairy-free"],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// ─── Hash password before save ────────────────────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ─── Instance methods ─────────────────────────────────────────────────────────

/**
 * Compare a plain-text candidate with the stored hash.
 * Requires password to have been selected: User.findOne().select('+password')
 */
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

/**
 * Return a safe user object — password is never included.
 * _id is converted to string for consistent serialisation across
 * Mongoose versions (avoids ObjectId appearing as { $oid: "..." } in some clients).
 */
userSchema.methods.toPublicJSON = function () {
  return {
    _id: this._id.toString(),
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    dietaryPreferences: this.dietaryPreferences,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("User", userSchema);
