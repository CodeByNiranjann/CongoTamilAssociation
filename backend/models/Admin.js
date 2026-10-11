// backend/models/Admin.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    // Admin can log in with either the username or the email
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 40,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Enter a valid email address"],
    },
    // Stored as a bcrypt hash only. Never returned in API responses.
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Hash the password before saving, but only when it was set or changed
adminSchema.pre("save", async function () {
  if (this.isModified("password") === false) {
    return;
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compares a typed password with the stored hash
adminSchema.methods.matchPassword = async function (typedPassword) {
  return bcrypt.compare(typedPassword, this.password);
};

// Makes sure the password never leaks if an admin is converted to JSON
adminSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;