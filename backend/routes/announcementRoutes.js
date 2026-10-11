// backend/routes/announcementRoutes.js
import express from "express";

import {
  getPublicAnnouncements,
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcementController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: published announcements (use ?section=home, tamil-school or africa-tamil-charal)
router.get("/", getPublicAnnouncements);

// Admin only. The fixed path "/admin" must come before "/:id".
router.get("/admin", protect, getAllAnnouncements);

router.post("/", protect, createAnnouncement);
router.put("/:id", protect, updateAnnouncement);
router.delete("/:id", protect, deleteAnnouncement);

export default router;