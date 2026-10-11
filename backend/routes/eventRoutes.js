// backend/routes/eventRoutes.js
import express from "express";

import {
  getPublicEvents,
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: published events for the Home and Festivals pages
router.get("/", getPublicEvents);

// Admin only. The fixed path "/admin" must come before "/:id".
router.get("/admin", protect, getAllEvents);

router.post("/", protect, createEvent);
router.put("/:id", protect, updateEvent);
router.delete("/:id", protect, deleteEvent);

export default router;