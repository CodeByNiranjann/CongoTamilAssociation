// backend/models/Festival.js
import mongoose from "mongoose";

// Accepts a full link (https://...) or a site path (/images/festival.jpg)
const linkPattern = /^(https?:\/\/|\/)/;

// Accepts a full link only (https://...)
const webLinkPattern = /^https?:\/\//;

const festivalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Festival name is required"],
      trim: true,
      maxlength: [120, "Festival name must be 120 characters or fewer"],
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
    // Used later to delete the image from Cloudinary when the festival is removed
    imagePublicId: {
      type: String,
      trim: true,
      default: "",
    },
    // Optional Google Drive photo album link
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
    // Only published festivals appear on the public website
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Speeds up the public query: published festivals by date
festivalSchema.index({ isPublished: 1, date: 1 });

const Festival = mongoose.model("Festival", festivalSchema);

export default Festival;