// backend/models/TamilSchool.js
import mongoose from "mongoose";

// Accepts a full link (https://...) or a site path (/images/school.jpg)
const linkPattern = /^(https?:\/\/|\/)/;

// There is only ONE Tamil School record. The controller creates it on first
// save and updates the same record afterwards.
// School announcements are stored in the Announcement collection with
// section "tamil-school", so they are not repeated here.
const tamilSchoolSchema = new mongoose.Schema(
  {
    // "About the school" text
    introduction: {
      type: String,
      trim: true,
      maxlength: [3000, "Information must be 3000 characters or fewer"],
      default: "",
    },
    // List of activities, one text item each
    activities: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: [300, "Each activity must be 300 characters or fewer"],
        },
      ],
      default: [],
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

const TamilSchool = mongoose.model("TamilSchool", tamilSchoolSchema);

export default TamilSchool;