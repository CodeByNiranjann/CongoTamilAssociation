// backend/models/Committee.js
import mongoose from "mongoose";

const committeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name must be 100 characters or fewer"],
    },
    // Role or designation, for example President, Secretary, Treasurer
    role: {
      type: String,
      required: [true, "Role or designation is required"],
      trim: true,
      maxlength: [100, "Role must be 100 characters or fewer"],
    },
    // Committee year or term, stored as "2026" or "2026 - 2027"
    // The public page groups members by this value.
    year: {
      type: String,
      required: [true, "Committee year is required"],
      trim: true,
      match: [
        /^\d{4}(\s*[-–]\s*\d{4})?$/,
        "Enter a 4-digit year (e.g. 2026) or term (e.g. 2026 - 2027)",
      ],
    },
    // Optional short biography
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio must be 500 characters or fewer"],
      default: "",
    },
    // Member photograph link
    imageUrl: {
      type: String,
      trim: true,
      default: "",
    },
    // Cloudinary public ID for deleting photo
    imagePublicId: {
      type: String,
      trim: true,
      default: "",
    },
    // Custom display order
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Speeds up the public query: members grouped and sorted by year
committeeSchema.index({ year: -1, order: 1, createdAt: 1 });

const Committee = mongoose.model("Committee", committeeSchema);

export default Committee;