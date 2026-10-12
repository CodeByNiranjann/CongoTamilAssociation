// backend/models/JoinEnquiry.js
import mongoose from "mongoose";

const joinEnquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name must be 100 characters or fewer"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^\+?[0-9\s-]{7,15}$/, "Enter a valid phone number"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Enter a valid email address"],
    },
    company: {
      type: String,
      required: [true, "Company is required"],
      trim: true,
      maxlength: [120, "Company must be 120 characters or fewer"],
    },

    // Same statuses as job applications. "New" drives the dashboard badge.
    status: {
      type: String,
      enum: {
        values: ["New", "Contacted", "Completed"],
        message: "Invalid status",
      },
      default: "New",
    },

    // Result of the notification email to the CTA address.
    // The enquiry is always saved first, so a failed email never loses it.
    emailStatus: {
      type: String,
      enum: {
        values: ["Not sent yet", "Sent", "Failed"],
        message: "Invalid email status",
      },
      default: "Not sent yet",
    },
  },
  { timestamps: true }
);

// Speeds up the admin list: newest first, filtered by status
joinEnquirySchema.index({ status: 1, createdAt: -1 });

const JoinEnquiry = mongoose.model("JoinEnquiry", joinEnquirySchema);

export default JoinEnquiry;