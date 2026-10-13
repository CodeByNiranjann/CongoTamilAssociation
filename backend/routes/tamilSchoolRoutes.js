
import express from "express";
import {
  getTamilSchool,
  saveTamilSchool,
  deleteTamilSchool,
} from "../controllers/tamilSchoolController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getTamilSchool);
router.put("/", protect, saveTamilSchool);
router.delete("/", protect, deleteTamilSchool);

export default router;
