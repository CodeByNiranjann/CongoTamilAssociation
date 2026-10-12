// backend/models/Contact.js
import mongoose from "mongoose";

// Accepts a full link only (https://...)
const webLinkPattern = /^https?:\/\//;

// One social media link, for example { name: "Facebook", url: "https://..." }
const socialLinkSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    maxlength: [50, "Name must be 50 characters or fewer"],
  },
  url: {
    type: String,
    required: [true, "Link is required"],
    trim: true,
    validate: {
      validator: function (value) {
        return webLinkPattern.test(value);
      },
      message: "Link must be a full link starting with https://",
    },
  },
});

// There is only ONE contact information record (shown on the Contact page
// and the Footer). The controller creates it on first save and updates it
// afterwards. Every field is optional, so nothing is invented.
const contactSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      validate: {
        validator: function (value) {
          return value === "" || /^\S+@\S+\.\S+$/.test(value);
        },
        message: "Enter a valid email address",
      },
    },
    phone: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: function (value) {
          return value === "" || /^\+?[0-9\s-]{7,20}$/.test(value);
        },
        message: "Enter a valid phone number",
      },
    },
    address: {
      type: String,
      trim: true,
      maxlength: [300, "Address must be 300 characters or fewer"],
      default: "",
    },
    // Official CTA YouTube link (shown on the Home page and Footer)
    youtubeUrl: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: function (value) {
          return value === "" || webLinkPattern.test(value);
        },
        message: "YouTube link must be a full link starting with https://",
      },
    },
    socialLinks: {
      type: [socialLinkSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const Contact = mongoose.model("Contact", contactSchema);

export default Contact;