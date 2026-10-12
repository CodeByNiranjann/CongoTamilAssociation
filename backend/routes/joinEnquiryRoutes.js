// backend/routes/joinEnquiryRoutes.js
import express from "express";
import rateLimit from "express-rate-limit";

import {
  submitEnquiry,
  getEnquiries,
  getNewCount,
  updateStatus,
  deleteEnquiry,
} from "../controllers/joinEnquiryController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Limits spam on the public form: 5 enquiries per hour per IP
const enquiryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many enquiries from this connection. Please try again later.",
  },
});

// Public: submit a membership enquiry
router.post("/", enquiryLimiter, submitEnquiry);

// Admin only. The fixed path "/new-count" must come before "/:id" routes.
router.get("/", protect, getEnquiries);
router.get("/new-count", protect, getNewCount);
router.put("/:id/status", protect, updateStatus);
router.delete("/:id", protect, deleteEnquiry);

export default router;