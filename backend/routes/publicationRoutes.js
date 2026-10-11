// backend/routes/publicationRoutes.js
import express from "express";

import {
  getPublicPublications,
  getAllPublications,
  createPublication,
  updatePublication,
  deletePublication,
} from "../controllers/publicationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: published items (use ?section=general or ?section=africa-tamil-charal)
router.get("/", getPublicPublications);

// Admin only. The fixed path "/admin" must come before "/:id".
router.get("/admin", protect, getAllPublications);

router.post("/", protect, createPublication);
router.put("/:id", protect, updatePublication);
router.delete("/:id", protect, deletePublication);

export default router;