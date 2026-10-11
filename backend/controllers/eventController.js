// backend/controllers/eventController.js
import Event from "../models/Event.js";

// Builds an error with a status code, to pass to next()
function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

// Picks only the fields an admin is allowed to set.
// Anything else in the request body is ignored.
function pickEventFields(body) {
  const data = {};

  const textFields = [
    "title",
    "date",
    "location",
    "description",
    "imageUrl",
    "imagePublicId",
    "galleryLink",
  ];

  for (const field of textFields) {
    if (body[field] !== undefined) {
      // Only plain strings are accepted (blocks NoSQL injection objects)
      if (typeof body[field] !== "string") {
        throw createError(field + " must be text.", 400);
      }
      data[field] = body[field].trim();
    }
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

// GET /api/v1/events   (public)
// Published events, soonest first. Used by the Home and Festivals pages.
export async function getPublicEvents(req, res, next) {
  try {
    const events = await Event.find({ isPublished: true })
      .sort({ date: 1 })
      .select("-imagePublicId -__v");

    res.status(200).json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/events/admin   (admin only)
// All events, including drafts, newest first
export async function getAllEvents(req, res, next) {
  try {
    const events = await Event.find().sort({ date: -1 });

    res.status(200).json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
}

// POST /api/v1/events   (admin only)
export async function createEvent(req, res, next) {
  try {
    const data = pickEventFields(req.body);

    const event = await Event.create(data);

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
}

// PUT /api/v1/events/:id   (admin only)
export async function updateEvent(req, res, next) {
  try {
    const data = pickEventFields(req.body);

    const event = await Event.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      return next(createError("Event not found.", 404));
    }

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/v1/events/:id   (admin only)
export async function deleteEvent(req, res, next) {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return next(createError("Event not found.", 404));
    }

    res.status(200).json({ success: true, message: "Event deleted." });
  } catch (error) {
    next(error);
  }
}