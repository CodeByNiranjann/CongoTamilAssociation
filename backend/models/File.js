// backend/models/File.js
import mongoose from "mongoose";

const linkPattern = /^(https?:\/\/|\/)/;

const fileSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [120, "Title must be 120 characters or fewer"],
    },
    fileUrl: {
      type: String,
      required: [true, "File URL is required"],
      trim: true,
      validate: {
        validator: function (value) {
          return linkPattern.test(value);
        },
        message: "File URL must be a valid link (https://...) or a path starting with /",
      },
    },
    fileType: {
      type: String,
      enum: ["image", "pdf", "audio", "document"],
      default: "image",
    },
    publicId: {
      type: String,
      trim: true,
      default: "",
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Indexes for fast public query and ordering
fileSchema.index({ isPublished: 1, fileType: 1, order: 1 });

const File = mongoose.model("File", fileSchema);

export default File;
