// backend/routes/festivalRoutes.js
import express from "express";

import {
  getPublicFestivals,
  getAllFestivals,
  createFestival,
  updateFestival,
  deleteFestival,
} from "../controllers/festivalController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: published festivals for the Home and Festivals pages
router.get("/", getPublicFestivals);

// Admin only. The fixed path "/admin" must come before "/:id".
router.get("/admin", protect, getAllFestivals);

router.post("/", protect, createFestival);
router.put("/:id", protect, updateFestival);
router.delete("/:id", protect, deleteFestival);

export default router;