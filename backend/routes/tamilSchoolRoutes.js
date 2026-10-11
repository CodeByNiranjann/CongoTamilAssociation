// backend/routes/tamilSchoolRoutes.js
import express from "express";

import {
  getTamilSchool,
  saveTamilSchool,
} from "../controllers/tamilSchoolController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: the single Tamil School record
router.get("/", getTamilSchool);

// Admin only: create or update the Tamil School information
router.put("/", protect, saveTamilSchool);

export default router;