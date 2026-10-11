// backend/controllers/announcementController.js
import Announcement from "../models/Announcement.js";

const allowedSections = ["home", "tamil-school", "africa-tamil-charal"];

// Builds an error with a status code, to pass to next()
function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

// Picks only the fields an admin is allowed to set.
// Anything else in the request body is ignored.
function pickAnnouncementFields(body) {
  const data = {};

  const textFields = ["title", "message", "date", "section"];

  for (const field of textFields) {
    if (body[field] !== undefined) {
      // Only plain strings are accepted (blocks NoSQL injection objects)
      if (typeof body[field] !== "string") {
        throw createError(field + " must be text.", 400);
      }
      data[field] = body[field].trim();
    }
  }

  if (data.section !== undefined && allowedSections.includes(data.section) === false) {
    throw createError("Invalid section.", 400);
  }

  if (data.date !== undefined && isNaN(new Date(data.date).getTime())) {
    throw createError("Enter a valid date.", 400);
  }

  if (body.isPublished !== undefined) {
    if (typeof body.isPublished !== "boolean") {
      throw createError("isPublished must be true or false.", 400);
    }
    data.isPublished = body.isPublished;
  }

  return data;
}

// Reads ?section=... from the URL and checks it is allowed (default "home")
function readSection(req) {
  let section = "home";

  if (req.query.section !== undefined) {
    if (typeof req.query.section !== "string") {
      throw createError("Invalid section.", 400);
    }
    section = req.query.section;
  }

  if (allowedSections.includes(section) === false) {
    throw createError("Invalid section.", 400);
  }

  return section;
}

// GET /api/v1/announcements?section=home   (public)
// Published announcements for one section, newest first
export async function getPublicAnnouncements(req, res, next) {
  try {
    const section = readSection(req);

    const announcements = await Announcement.find({
      section: section,
      isPublished: true,
    })
      .sort({ date: -1 })
      .select("-__v");

    res.status(200).json({ success: true, data: announcements });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/announcements/admin?section=home   (admin only)
// All announcements for one section, including drafts
export async function getAllAnnouncements(req, res, next) {
  try {
    const section = readSection(req);

    const announcements = await Announcement.find({ section: section }).sort({
      date: -1,
    });

    res.status(200).json({ success: true, data: announcements });
  } catch (error) {
    next(error);
  }
}

// POST /api/v1/announcements   (admin only)
export async function createAnnouncement(req, res, next) {
  try {
    const data = pickAnnouncementFields(req.body);

    const announcement = await Announcement.create(data);

    res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    next(error);
  }
}

// PUT /api/v1/announcements/:id   (admin only)
export async function updateAnnouncement(req, res, next) {
  try {
    const data = pickAnnouncementFields(req.body);

    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true, runValidators: true }
    );

    if (!announcement) {
      return next(createError("Announcement not found.", 404));
    }

    res.status(200).json({ success: true, data: announcement });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/v1/announcements/:id   (admin only)
export async function deleteAnnouncement(req, res, next) {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
      return next(createError("Announcement not found.", 404));
    }

    res.status(200).json({ success: true, message: "Announcement deleted." });
  } catch (error) {
    next(error);
  }
}