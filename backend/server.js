// backend/server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import festivalRoutes from "./routes/festivalRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";
import publicationRoutes from "./routes/publicationRoutes.js";
import committeeRoutes from "./routes/committeeRoutes.js";
import anthemRoutes from "./routes/anthemRoutes.js";
import tamilSchoolRoutes from "./routes/tamilSchoolRoutes.js";
import africaTamilCharalRoutes from "./routes/africaTamilCharalRoutes.js";
import jobSeekerRoutes from "./routes/jobSeekerRoutes.js";


const app = express();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const NODE_ENV = process.env.NODE_ENV || "development";

// Render and Vercel sit behind proxies, so this is needed for correct client IPs
app.set("trust proxy", 1);

// CORS: only allow approved frontend origins (comma-separated list supported)
const allowedOrigins = FRONTEND_ORIGIN.split(",").map(function (origin) {
  return origin.trim();
});

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow tools like Postman (no origin) and approved origins
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Request size limits
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Health check
app.get("/api/v1/health", function (req, res) {
  let databaseStatus = "disconnected";
  if (mongoose.connection.readyState === 1) {
    databaseStatus = "connected";
  }

  res.status(200).json({
    success: true,
    message: "CTA API is running",
    environment: NODE_ENV,
    database: databaseStatus,
    timestamp: new Date().toISOString(),
  });
});

// Routes (more are added here as each route file is built)
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/banners", bannerRoutes);
app.use("/api/v1/announcements", announcementRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/festivals", festivalRoutes);
app.use("/api/v1/gallery", galleryRoutes);
app.use("/api/v1/publications", publicationRoutes);
app.use("/api/v1/committee", committeeRoutes);
app.use("/api/v1/anthem", anthemRoutes);
app.use("/api/v1/tamil-school", tamilSchoolRoutes);
app.use("/api/v1/africa-tamil-charal", africaTamilCharalRoutes);
app.use("/api/v1/job-seekers", jobSeekerRoutes);


// 404 handler and central error handler (must stay last)
app.use(notFound);
app.use(errorHandler);

// Connect to MongoDB, then start the server
async function startServer() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is missing. Add it to your .env file.");
    process.exit(1);
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is missing. Add it to your .env file.");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected");

    app.listen(PORT, function () {
      console.log("Server running on port " + PORT + " (" + NODE_ENV + ")");
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();