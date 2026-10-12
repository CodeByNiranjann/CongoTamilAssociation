// backend/routes/visitorRoutes.js
import express from "express";
import rateLimit from "express-rate-limit";

import {
  recordVisit,
  getPublicTotal,
  getStats,
} from "../controllers/visitorController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Stops one connection from inflating the counter: 30 visits per hour per IP
const visitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

// Public: record one visit (the website calls this once per browser session)
router.post("/hit", visitLimiter, recordVisit);

// Public: total number only, for the Home page counter
router.get("/total", getPublicTotal);

// Admin only: today, this month and total
router.get("/stats", protect, getStats);

export default router;