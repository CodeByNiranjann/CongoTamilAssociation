// backend/routes/galleryRoutes.js
import express from "express";

import {
  getPublicGalleries,
  getAllGalleries,
  createGallery,
  updateGallery,
  deleteGallery,
} from "../controllers/galleryController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: published albums for the Gallery page
router.get("/", getPublicGalleries);

// Admin only. The fixed path "/admin" must come before "/:id".
router.get("/admin", protect, getAllGalleries);

router.post("/", protect, createGallery);
router.put("/:id", protect, updateGallery);
router.delete("/:id", protect, deleteGallery);

export default router;