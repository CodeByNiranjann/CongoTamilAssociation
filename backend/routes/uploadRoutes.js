// backend/routes/uploadRoutes.js
import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import { uploadSingle, verifyFileContent } from "../middleware/uploadMiddleware.js";
import {
  uploadImage,
  uploadAudio,
  uploadPublicDocument,
} from "../utils/cloudinary.js";

const router = express.Router();

// Makes sure a file was really sent
function requireFile(req, res, next) {
  if (!req.file) {
    const error = new Error("Please choose a file.");
    error.statusCode = 400;
    return next(error);
  }
  next();
}

// All upload routes are admin only. The form field name is "file".

router.post(
  "/image",
  protect,
  uploadSingle("image", "file"),
  verifyFileContent("image"),
  requireFile,
  async function (req, res, next) {
    try {
      const result = await uploadImage(req.file.buffer, "images");
      res.status(201).json({ success: true, url: result.url, publicId: result.publicId });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/audio",
  protect,
  uploadSingle("audio", "file"),
  verifyFileContent("audio"),
  requireFile,
  async function (req, res, next) {
    try {
      const result = await uploadAudio(req.file.buffer, "audio");
      res.status(201).json({ success: true, url: result.url, publicId: result.publicId });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/pdf",
  protect,
  uploadSingle("pdf", "file"),
  verifyFileContent("pdf"),
  requireFile,
  async function (req, res, next) {
    try {
      const result = await uploadPublicDocument(req.file.buffer, "documents", "pdf");
      res.status(201).json({ success: true, url: result.url, publicId: result.publicId });
    } catch (error) {
      next(error);
    }
  }
);

export default router;