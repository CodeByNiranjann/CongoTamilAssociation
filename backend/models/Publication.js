// backend/models/Publication.js
import mongoose from "mongoose";

// Accepts a full link (https://...) or a site path (/images/cover.jpg)
const linkPattern = /^(https?:\/\/|\/)/;

// Accepts a full link only (https://...)
const webLinkPattern = /^https?:\/\//;

const publicationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [150, "Title must be 150 characters or fewer"],
    },
    // 1 to 12
    month: {
      type: Number,
      required: [true, "Month is required"],
      min: [1, "Month must be between 1 and 12"],
      max: [12, "Month must be between 1 and 12"],
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
      min: [1900, "Enter a valid year"],
      max: [2100, "Enter a valid year"],
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
    // Used later to delete the cover image from Cloudinary when the publication is removed
    coverImagePublicId: {
      type: String,
      trim: true,
      default: "",
    },
    // PDF or Google Drive link
    pdfLink: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: function (value) {
          return value === "" || webLinkPattern.test(value);
        },
        message: "PDF link must be a full link starting with https://",
      },
    },
    // Which part of the website shows it. "general" is the Publications page,
    // "africa-tamil-charal" is the Africa Tamil Charal page.
    section: {
      type: String,
      enum: {
        values: ["general", "africa-tamil-charal"],
        message: "Invalid section",
      },
      default: "general",
    },
    // Only published items appear on the public website
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Speeds up the public query: published items for a section, newest first
publicationSchema.index({ section: 1, isPublished: 1, year: -1, month: -1 });

const Publication = mongoose.model("Publication", publicationSchema);

export default Publication;