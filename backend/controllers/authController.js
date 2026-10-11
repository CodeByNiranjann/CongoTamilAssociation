// backend/controllers/authController.js
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

// Creates a signed login token for an admin
function createToken(adminId) {
  return jwt.sign({ id: adminId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "8h",
  });
}

// POST /api/v1/auth/login
// Body: { email, password }  ("email" can be the email OR the username)
export async function login(req, res, next) {
  try {
    if (!process.env.JWT_SECRET) {
      const error = new Error("Server is not configured correctly.");
      error.statusCode = 500;
      return next(error);
    }

    const loginName = req.body.email;
    const password = req.body.password;

    // Only plain strings are accepted (blocks NoSQL injection like {"$ne": ""})
    if (typeof loginName !== "string" || typeof password !== "string") {
      const error = new Error("Email or username and password are required.");
      error.statusCode = 400;
      return next(error);
    }

    const cleanName = loginName.trim().toLowerCase();

    if (cleanName === "" || password === "") {
      const error = new Error("Email or username and password are required.");
      error.statusCode = 400;
      return next(error);
    }

    // Find by email or username. The password hash is hidden by default,
    // so it is asked for here on purpose.
    const admin = await Admin.findOne({
      $or: [{ email: cleanName }, { username: cleanName }],
    }).select("+password");

    // Same message for "no such admin" and "wrong password"
    // so nobody can discover which usernames exist.
    let passwordIsCorrect = false;
    if (admin && admin.isActive) {
      passwordIsCorrect = await admin.matchPassword(password);
    }

    if (passwordIsCorrect === false) {
      const error = new Error("Invalid email/username or password.");
      error.statusCode = 401;
      return next(error);
    }

    admin.lastLoginAt = new Date();
    await admin.save();

    const token = createToken(admin._id);

    res.status(200).json({
      success: true,
      token: token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
      },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/auth/me  (protected)
// Lets the frontend check that the saved token is still valid
export async function getMe(req, res) {
  res.status(200).json({
    success: true,
    admin: {
      id: req.admin._id,
      username: req.admin.username,
      email: req.admin.email,
    },
  });
}