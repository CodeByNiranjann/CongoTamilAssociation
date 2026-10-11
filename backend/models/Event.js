// backend/models/Event.js
import mongoose from "mongoose";

// Accepts a full link (https://...) or a site path (/images/event.jpg)
const linkPattern = /^(https?:\/\/|\/)/;

// Accepts a full link only (https://...)
const webLinkPattern = /^https?:\/\//;

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event name is required"],
      trim: true,
      maxlength: [120, "Event name must be 120 characters or fewer"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [200, "Location must be 200 characters or fewer"],
      default: "",
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description must be 1000 characters or fewer"],
      default: "",
    },
    // Poster or cover image. When Cloudinary upload is added, this holds the Cloudinary URL.
    imageUrl: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: function (value) {
          return value === "" || linkPattern.test(value);
        },
        message: "Image must be a full link (https://...) or a path starting with /",
      },
    },
    // Used later to delete the image from Cloudinary when the event is removed
    imagePublicId: {
      type: String,
      trim: true,
      default: "",
    },
    // Optional Google Drive album link
    galleryLink: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: function (value) {
          return value === "" || webLinkPattern.test(value);
        },
        message: "Gallery link must be a full link starting with https://",
      },
    },
    // Only published events appear on the public website
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Speeds up the public query: published events by date
eventSchema.index({ isPublished: 1, date: 1 });

const Event = mongoose.model("Event", eventSchema);

export default Event;