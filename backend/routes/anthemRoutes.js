// backend/routes/anthemRoutes.js
import express from "express";

import { getAnthem, saveAnthem } from "../controllers/anthemController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: the single anthem record
router.get("/", getAnthem);

// Admin only: create or update the anthem
router.put("/", protect, saveAnthem);

export default router;