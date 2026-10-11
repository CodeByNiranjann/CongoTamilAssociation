// backend/models/Anthem.js
import mongoose from "mongoose";

// Accepts a full link (https://...) or a site path (/audio/anthem.mp3)
const linkPattern = /^(https?:\/\/|\/)/;

// There is only ONE anthem record. The controller creates it on first save
// and updates the same record afterwards.
const anthemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Anthem title is required"],
      trim: true,
      maxlength: [120, "Title must be 120 characters or fewer"],
      default: "CTA Anthem",
    },
    description: {
      type: String,
      trim: true,
      maxlength: [3000, "Description must be 3000 characters or fewer"],
      default: "",
    },
    // Audio link. When Cloudinary upload is added, this holds the Cloudinary URL.
    audioUrl: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: function (value) {
          return value === "" || linkPattern.test(value);
        },
        message: "Audio must be a full link (https://...) or a path starting with /",
      },
    },
    // Used later to delete the audio from Cloudinary when it is replaced
    audioPublicId: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

const Anthem = mongoose.model("Anthem", anthemSchema);

export default Anthem;