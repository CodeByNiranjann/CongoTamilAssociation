// backend/routes/fileRoutes.js
import express from "express";

import {
  getPublicFiles,
  getAllFiles,
  createFile,
  updateFile,
  reorderFiles,
  deleteFileRecord,
} from "../controllers/fileController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: published files
router.get("/", getPublicFiles);

// Admin only routes
router.get("/admin", protect, getAllFiles);
router.post("/", protect, createFile);
router.put("/reorder", protect, reorderFiles);
router.put("/:id", protect, updateFile);
router.delete("/:id", protect, deleteFileRecord);

export default router;
