// backend/routes/authRoutes.js
import express from "express";
import rateLimit from "express-rate-limit";

import { login, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Slows down password guessing: 10 login attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again in 15 minutes.",
  },
});

// POST /api/v1/auth/login   (public, rate limited)
router.post("/login", loginLimiter, login);

// GET /api/v1/auth/me   (admin only)
router.get("/me", protect, getMe);

export default router;