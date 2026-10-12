// backend/models/ByLaws.js
import mongoose from "mongoose";

// Accepts a full link (https://...) or a site path (/documents/cta-by-laws.pdf)
const linkPattern = /^(https?:\/\/|\/)/;

// One rule section, kept in the order the admin arranges them.
const sectionSchema = new mongoose.Schema({
  heading: {
    type: String,
    required: [true, "Heading is required"],
    trim: true,
    maxlength: [150, "Heading must be 150 characters or fewer"],
  },
  text: {
    type: String,
    required: [true, "Rule text is required"],
    trim: true,
    maxlength: [5000, "Rule text must be 5000 characters or fewer"],
  },
});

// There is only ONE by-laws record. The controller creates it on first save
// and updates the same record afterwards. The order of the "sections" list
// is the order shown (and numbered) on the public page.
const byLawsSchema = new mongoose.Schema(
  {
    intro: {
      type: String,
      trim: true,
      maxlength: [2000, "Introduction must be 2000 characters or fewer"],
      default: "",
    },
    sections: {
      type: [sectionSchema],
      default: [],
    },
    // PDF link. When Cloudinary upload is added, this holds the Cloudinary URL.
    pdfUrl: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: function (value) {
          return value === "" || linkPattern.test(value);
        },
        message: "PDF must be a full link (https://...) or a path starting with /",
      },
    },
    // Used later to delete the PDF from Cloudinary when it is replaced
    pdfPublicId: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

const ByLaws = mongoose.model("ByLaws", byLawsSchema);

export default ByLaws;