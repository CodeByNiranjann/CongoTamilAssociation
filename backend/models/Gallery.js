// backend/models/Gallery.js
import mongoose from "mongoose";

// Accepts a full link (https://...) or a site path (/images/cover.jpg)
const linkPattern = /^(https?:\/\/|\/)/;

// Accepts a full link only (https://...)
const webLinkPattern = /^https?:\/\//;

const gallerySchema = new mongoose.Schema(
  {
    // Event name
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
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description must be 1000 characters or fewer"],
      default: "",
    },
    // Cover image. When Cloudinary upload is added, this holds the Cloudinary URL.
    coverImageUrl: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: function (value) {
          return value === "" || linkPattern.test(value);
        },
        message: "Cover image must be a full link (https://...) or a path starting with /",
      },
    },
    // Used later to delete the cover image from Cloudinary when the album is removed
    coverImagePublicId: {
      type: String,
      trim: true,
      default: "",
    },
    // Google Drive album link (required, the public page shows it as "View Album")
    albumLink: {
      type: String,
      required: [true, "Google Drive album link is required"],
      trim: true,
      validate: {
        validator: function (value) {
          return webLinkPattern.test(value);
        },
        message: "Album link must be a full link starting with https://",
      },
    },
    // Only published albums appear on the public website
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Speeds up the public query: published albums, newest first
gallerySchema.index({ isPublished: 1, date: -1 });

const Gallery = mongoose.model("Gallery", gallerySchema);

export default Gallery;