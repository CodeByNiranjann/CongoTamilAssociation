// backend/models/AfricaTamilCharal.js
import mongoose from "mongoose";

// Accepts a full link (https://...) or a site path (/images/photo.jpg)
const linkPattern = /^(https?:\/\/|\/)/;

// Accepts a full link only (https://...)
const webLinkPattern = /^https?:\/\//;

// Only ONE information record exists (introduction and images).
// The controller creates it on first save and updates it afterwards.
const infoSchema = new mongoose.Schema(
  {
    introduction: {
      type: String,
      trim: true,
      maxlength: [3000, "Information must be 3000 characters or fewer"],
      default: "",
    },
    // Image links. When Cloudinary upload is added, these hold Cloudinary URLs.
    images: {
      type: [
        {
          type: String,
          trim: true,
          validate: {
            validator: function (value) {
              return linkPattern.test(value);
            },
            message: "Each image must be a full link (https://...) or a path starting with /",
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

// Documents are separate records (many of them), shown as links on the public page.
const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [150, "Title must be 150 characters or fewer"],
    },
    // PDF or Google Drive link
    link: {
      type: String,
      required: [true, "A PDF or Google Drive link is required"],
      trim: true,
      validate: {
        validator: function (value) {
          return webLinkPattern.test(value);
        },
        message: "Link must be a full link starting with https://",
      },
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

documentSchema.index({ isPublished: 1, createdAt: -1 });

export const AfricaTamilCharalInfo = mongoose.model(
  "AfricaTamilCharalInfo",
  infoSchema
);

export const AfricaTamilCharalDocument = mongoose.model(
  "AfricaTamilCharalDocument",
  documentSchema
);