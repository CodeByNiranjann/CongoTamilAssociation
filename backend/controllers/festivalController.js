// backend/controllers/festivalController.js
import Festival from "../models/Festival.js";

// Builds an error with a status code, to pass to next()
function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

// Picks only the fields an admin is allowed to set.
// Anything else in the request body is ignored.
function pickFestivalFields(body) {
  const data = {};

  const textFields = [
    "title",
    "date",
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

// GET /api/v1/festivals   (public)
// Published festivals, soonest first. Used by the Home and Festivals pages.
export async function getPublicFestivals(req, res, next) {
  try {
    const festivals = await Festival.find({ isPublished: true })
      .sort({ date: 1 })
      .select("-imagePublicId -__v");

    res.status(200).json({ success: true, data: festivals });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/festivals/admin   (admin only)
// All festivals, including drafts, newest first
export async function getAllFestivals(req, res, next) {
  try {
    const festivals = await Festival.find().sort({ date: -1 });

    res.status(200).json({ success: true, data: festivals });
  } catch (error) {
    next(error);
  }
}

// POST /api/v1/festivals   (admin only)
export async function createFestival(req, res, next) {
  try {
    const data = pickFestivalFields(req.body);

    const festival = await Festival.create(data);

    res.status(201).json({ success: true, data: festival });
  } catch (error) {
    next(error);
  }
}

// PUT /api/v1/festivals/:id   (admin only)
export async function updateFestival(req, res, next) {
  try {
    const data = pickFestivalFields(req.body);

    const festival = await Festival.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });

    if (!festival) {
      return next(createError("Festival not found.", 404));
    }

    res.status(200).json({ success: true, data: festival });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/v1/festivals/:id   (admin only)
export async function deleteFestival(req, res, next) {
  try {
    const festival = await Festival.findByIdAndDelete(req.params.id);

    if (!festival) {
      return next(createError("Festival not found.", 404));
    }

    res.status(200).json({ success: true, message: "Festival deleted." });
  } catch (error) {
    next(error);
  }
}