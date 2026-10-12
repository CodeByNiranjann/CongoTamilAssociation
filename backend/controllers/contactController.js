// backend/controllers/contactController.js
import Contact from "../models/Contact.js";
import { sendNotification } from "../utils/email.js";

// Builds an error with a status code, to pass to next()
function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

// Checks the social links list and returns a clean copy
function cleanSocialLinks(value) {
  if (Array.isArray(value) === false) {
    throw createError("socialLinks must be a list.", 400);
  }

  if (value.length > 20) {
    throw createError("Too many social links.", 400);
  }

  const result = [];

  for (const item of value) {
    if (item === null || typeof item !== "object") {
      throw createError("Each social link needs a name and a link.", 400);
    }

    // Only plain strings are accepted (blocks NoSQL injection objects)
    if (typeof item.name !== "string" || typeof item.url !== "string") {
      throw createError("Each social link needs a name and a link.", 400);
    }

    result.push({ name: item.name.trim(), url: item.url.trim() });
  }

  return result;
}

// Picks only the fields an admin is allowed to set
function pickContactFields(body) {
  const data = {};

  const textFields = ["email", "phone", "address", "youtubeUrl"];

  for (const field of textFields) {
    if (body[field] !== undefined) {
      if (typeof body[field] !== "string") {
        throw createError(field + " must be text.", 400);
      }
      data[field] = body[field].trim();
    }
  }

  if (body.socialLinks !== undefined) {
    data.socialLinks = cleanSocialLinks(body.socialLinks);
  }

  return data;
}

// Reads one text field from the contact form body
function readText(body, field) {
  const value = body[field];

  if (value === undefined) {
    return "";
  }

  if (typeof value !== "string") {
    throw createError(field + " must be text.", 400);
  }

  return value.trim();
}

// GET /api/v1/contact   (public)
// Returns the single contact record, or empty defaults if none is saved yet
export async function getContactInfo(req, res, next) {
  try {
    const contact = await Contact.findOne().select("-__v");

    if (!contact) {
      return res.status(200).json({
        success: true,
        data: {
          email: "",
          phone: "",
          address: "",
          youtubeUrl: "",
          socialLinks: [],
        },
      });
    }

    res.status(200).json({ success: true, data: contact });
  } catch (error) {
    next(error);
  }
}

// PUT /api/v1/contact   (admin only)
// Creates the record on first save, then updates the same record
export async function saveContactInfo(req, res, next) {
  try {
    const data = pickContactFields(req.body);

    let contact = await Contact.findOne();

    if (!contact) {
      contact = await Contact.create(data);
    } else {
      contact.set(data);
      await contact.save();
    }

    res.status(200).json({ success: true, data: contact });
  } catch (error) {
    next(error);
  }
}

// POST /api/v1/contact/message   (public)
// Body: { name, email, subject, message }
// Messages are not stored. They are emailed to the CTA address, and the
// visitor is told the truth if the email could not be sent.
export async function sendMessage(req, res, next) {
  try {
    const name = readText(req.body, "name");
    const email = readText(req.body, "email");
    const subject = readText(req.body, "subject");
    const message = readText(req.body, "message");

    if (name === "" || name.length > 100) {
      return next(createError("Enter your name (up to 100 characters).", 400));
    }

    if (/^\S+@\S+\.\S+$/.test(email) === false || email.length > 150) {
      return next(createError("Enter a valid email address.", 400));
    }

    if (subject === "" || subject.length > 150) {
      return next(createError("Enter a subject (up to 150 characters).", 400));
    }

    if (message.length < 10 || message.length > 2000) {
      return next(createError("Message must be 10 to 2000 characters.", 400));
    }

    const sent = await sendNotification({
      subject: "CTA website message: " + subject,
      replyTo: email,
      lines: [
        ["Name", name],
        ["Email", email],
        ["Subject", subject],
        ["Message", message],
      ],
    });

    if (sent === false) {
      return next(
        createError(
          "Your message could not be sent right now. Please try again later.",
          502
        )
      );
    }

    res.status(200).json({
      success: true,
      message: "Thank you! Your message was sent.",
    });
  } catch (error) {
    next(error);
  }
}