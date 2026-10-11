// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

// Protects admin-only routes.
// The frontend sends the token in the header:  Authorization: Bearer <token>
// The backend always verifies it, no matter what the frontend shows.
export async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || authHeader.startsWith("Bearer ") === false) {
      const error = new Error("Not authorized. Please log in.");
      error.statusCode = 401;
      return next(error);
    }

    const token = authHeader.split(" ")[1];

    if (!process.env.JWT_SECRET) {
      const error = new Error("Server is not configured correctly.");
      error.statusCode = 500;
      return next(error);
    }

    // Throws JsonWebTokenError or TokenExpiredError if the token is bad.
    // errorMiddleware turns those into clear 401 messages.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Make sure the admin still exists and is still active
    const admin = await Admin.findById(decoded.id);

    if (!admin || admin.isActive === false) {
      const error = new Error("Not authorized. Please log in.");
      error.statusCode = 401;
      return next(error);
    }

    req.admin = admin;
    next();
  } catch (error) {
    next(error);
  }
}