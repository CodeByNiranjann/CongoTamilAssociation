// backend/models/Announcement.js
import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [120, "Title must be 120 characters or fewer"],
    },
    message: {
      type: String,
      trim: true,
      maxlength: [1000, "Message must be 1000 characters or fewer"],
      default: "",
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    // Which part of the website the announcement belongs to.
    // "home" shows on the Home page, the others show on their own pages.
    section: {
      type: String,
      enum: {
        values: ["home", "tamil-school", "africa-tamil-charal"],
        message: "Invalid section",
      },
      default: "home",
    },
    // Only published announcements appear on the public website
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Speeds up the public query: published announcements for a section, newest first
announcementSchema.index({ section: 1, isPublished: 1, date: -1 });

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement;