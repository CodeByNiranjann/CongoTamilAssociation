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
    // Role or designation, for example the position held on the committee
    role: {
      type: String,
      required: [true, "Role or designation is required"],
      trim: true,
      maxlength: [100, "Role must be 100 characters or fewer"],
    },
    // Committee year, stored as a 4-digit text value such as "2026".
    // The public page groups members by this value.
    year: {
      type: String,
      required: [true, "Committee year is required"],
      trim: true,
      match: [/^\d{4}$/, "Enter a 4-digit year, for example 2026"],
    },
    // Optional short biography. There are no individual photos by design.
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio must be 500 characters or fewer"],
      default: "",
    },
  },
  { timestamps: true }
);

// Speeds up the public query: members grouped and sorted by year
committeeSchema.index({ year: -1, createdAt: 1 });

const Committee = mongoose.model("Committee", committeeSchema);

export default Committee;