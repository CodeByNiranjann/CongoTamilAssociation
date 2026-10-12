// backend/routes/byLawsRoutes.js
import express from "express";

import { getByLaws, saveByLaws } from "../controllers/byLawsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: the single by-laws record
router.get("/", getByLaws);

// Admin only: create or update the by-laws
router.put("/", protect, saveByLaws);

export default router;