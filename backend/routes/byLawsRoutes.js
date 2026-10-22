// backend/routes/byLawsRoutes.js
import express from "express";

import { getByLaws, saveByLaws, deleteByLaws } from "../controllers/byLawsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: the single by-laws record
router.get("/", getByLaws);

// Admin only: create or update the by-laws
router.put("/", protect, saveByLaws);

// Admin only: permanently delete the entire by-laws record
router.delete("/", protect, deleteByLaws);

export default router;