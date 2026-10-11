// backend/routes/committeeRoutes.js
import express from "express";

import {
  getPublicCommittee,
  createMember,
  updateMember,
  deleteMember,
} from "../controllers/committeeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: all committee members (the admin page uses this list too)
router.get("/", getPublicCommittee);

// Admin only
router.post("/", protect, createMember);
router.put("/:id", protect, updateMember);
router.delete("/:id", protect, deleteMember);

export default router;