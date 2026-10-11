// backend/createAdmin.js
// One-time setup script that creates an admin account.
// It reads the details from your .env file, so no password is written in code or chat.
//
// Run it with:  npm run create-admin
import "dotenv/config";
import mongoose from "mongoose";
import Admin from "./models/Admin.js";

async function createAdmin() {
  const username = process.env.ADMIN_USERNAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is missing in your .env file.");
    process.exit(1);
  }

  if (!username || !email || !password) {
    console.error(
      "Add ADMIN_USERNAME, ADMIN_EMAIL and ADMIN_PASSWORD to your .env file first."
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("ADMIN_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const existing = await Admin.findOne({
      $or: [
        { username: username.trim().toLowerCase() },
        { email: email.trim().toLowerCase() },
      ],
    });

    if (existing) {
      console.log("An admin with that username or email already exists. Nothing changed.");
      await mongoose.disconnect();
      process.exit(0);
    }

    // The password is hashed automatically by the Admin model
    await Admin.create({
      username: username,
      email: email,
      password: password,
    });

    console.log("Admin created: " + username.trim().toLowerCase());
    console.log("Now remove ADMIN_PASSWORD from your .env file.");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Could not create the admin:", error.message);
    process.exit(1);
  }
}

createAdmin();