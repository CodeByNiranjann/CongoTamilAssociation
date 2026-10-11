// backend/models/JobSeeker.js
import mongoose from "mongoose";

const jobSeekerSchema = new mongoose.Schema(
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
      trim: true,
      maxlength: [120, "Company must be 120 characters or fewer"],
      default: "",
    },
    jobTitle: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: [120, "Job title must be 120 characters or fewer"],
    },
    skills: {
      type: String,
      required: [true, "Skills are required"],
      trim: true,
      maxlength: [1000, "Skills must be 1000 characters or fewer"],
    },
    experience: {
      type: Number,
      required: [true, "Years of experience is required"],
      min: [0, "Experience cannot be negative"],
      max: [60, "Enter a valid number of years"],
    },
    location: {
      type: String,
      required: [true, "Preferred location is required"],
      trim: true,
      maxlength: [120, "Location must be 120 characters or fewer"],
    },

    // CV file. It is stored as a PRIVATE file (not a public link).
    // The admin downloads it through a protected backend route, so these
    // fields are never sent to the public.
    cvPublicId: {
      type: String,
      default: "",
      select: false,
    },
    cvOriginalName: {
      type: String,
      trim: true,
      default: "",
    },
    cvMimeType: {
      type: String,
      default: "",
    },
    hasCv: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: {
        values: ["New", "Contacted", "Completed"],
        message: "Invalid status",
      },
      default: "New",
    },
  },
  { timestamps: true }
);

// Speeds up the admin list: newest first, filtered by status
jobSeekerSchema.index({ status: 1, createdAt: -1 });

const JobSeeker = mongoose.model("JobSeeker", jobSeekerSchema);

export default JobSeeker;