// backend/routes/africaTamilCharalRoutes.js
import express from "express";

import {
  getInfo,
  saveInfo,
  deleteInfo,
  getPublicDocuments,
  getAllDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
} from "../controllers/africaTamilCharalController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Information (single record)
router.get("/", getInfo);
router.put("/", protect, saveInfo);
router.delete("/", protect, deleteInfo);

// Documents. The fixed path "/documents/admin" must come before "/documents/:id".
router.get("/documents", getPublicDocuments);
router.get("/documents/admin", protect, getAllDocuments);

router.post("/documents", protect, createDocument);
router.put("/documents/:id", protect, updateDocument);
router.delete("/documents/:id", protect, deleteDocument);

export default router;