// backend/models/Banner.js
import mongoose from "mongoose";

// Accepts a full link (https://...) or a site path (/join-cta)
const linkPattern = /^(https?:\/\/|\/)/;

const bannerSchema = new mongoose.Schema(
  {
    
  title: {
  type: String,
  required: false,
  trim: true,
  maxlength: [120, "Title must be 120 characters or fewer"],
  default: "",
  },
    description: {
      type: String,
      trim: true,
      maxlength: [300, "Description must be 300 characters or fewer"],
      default: "",
    },
    // Image link. When Cloudinary upload is added, this holds the Cloudinary URL.
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
    // Used later to delete the image from Cloudinary when the banner is removed
    imagePublicId: {
      type: String,
      trim: true,
      default: "",
    },
    buttonText: {
      type: String,
      trim: true,
      maxlength: [40, "Button text must be 40 characters or fewer"],
      default: "",
    },
    buttonLink: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: function (value) {
          return value === "" || linkPattern.test(value);
        },
        message: "Button link must be a full link (https://...) or a path starting with /",
      },
    },
    // Only published banners appear on the public Home page
    isPublished: {
      type: Boolean,
      default: true,
    },
    // Lower numbers appear first. Changed by the admin up/down arrows.
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Speeds up the public query: published banners in order
bannerSchema.index({ isPublished: 1, order: 1 });

const Banner = mongoose.model("Banner", bannerSchema);

export default Banner;