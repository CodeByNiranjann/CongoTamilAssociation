// backend/routes/contactRoutes.js
import express from "express";
import rateLimit from "express-rate-limit";

import {
  getContactInfo,
  saveContactInfo,
  sendMessage,
} from "../controllers/contactController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Limits spam on the public form: 5 messages per hour per IP
const messageLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many messages from this connection. Please try again later.",
  },
});

// Public: contact details for the Contact page and Footer
router.get("/", getContactInfo);

// Public: contact form message (emailed, not stored)
router.post("/message", messageLimiter, sendMessage);

// Admin only: create or update the contact details
router.put("/", protect, saveContactInfo);

export default router;