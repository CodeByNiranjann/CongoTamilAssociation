// backend/routes/jobSeekerRoutes.js
import express from "express";
import rateLimit from "express-rate-limit";

import {
  submitApplication,
  getApplications,
  getNewCount,
  updateStatus,
  getCvLink,
  deleteApplication,
} from "../controllers/jobSeekerController.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadSingle, verifyFileContent } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Limits spam on the public form: 5 applications per hour per IP
const applicationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many applications from this connection. Please try again later.",
  },
});

// Public: submit an application with a CV file (form field name: "cv")
router.post(
  "/",
  applicationLimiter,
  uploadSingle("cv", "cv"),
  verifyFileContent("cv"),
  submitApplication
);

// Admin only. Fixed paths ("/new-count") must come before "/:id" routes.
router.get("/", protect, getApplications);
router.get("/new-count", protect, getNewCount);
router.put("/:id/status", protect, updateStatus);
router.get("/:id/cv", protect, getCvLink);
router.delete("/:id", protect, deleteApplication);

export default router;