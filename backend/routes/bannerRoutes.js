// backend/routes/bannerRoutes.js
import express from "express";

import {
  getPublicBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  reorderBanners,
  deleteBanner,
} from "../controllers/bannerController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: published banners for the Home page
router.get("/", getPublicBanners);

// Admin only. Fixed paths ("/admin", "/reorder") must come before "/:id".
router.get("/admin", protect, getAllBanners);
router.put("/reorder", protect, reorderBanners);

router.post("/", protect, createBanner);
router.put("/:id", protect, updateBanner);
router.delete("/:id", protect, deleteBanner);

export default router;