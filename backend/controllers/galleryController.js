// backend/controllers/galleryController.js
import Gallery from "../models/Gallery.js";

// Builds an error with a status code, to pass to next()
function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

// Picks only the fields an admin is allowed to set.
// Anything else in the request body is ignored.
function pickGalleryFields(body) {
  const data = {};

  const textFields = [
    "title",
    "date",
    "description",
    "coverImageUrl",
    "coverImagePublicId",
    "albumLink",
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

// GET /api/v1/gallery   (public)
// Published albums, newest first. Used by the Gallery page.
export async function getPublicGalleries(req, res, next) {
  try {
    const galleries = await Gallery.find({ isPublished: true })
      .sort({ date: -1 })
      .select("-coverImagePublicId -__v");

    res.status(200).json({ success: true, data: galleries });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/gallery/admin   (admin only)
// All albums, including drafts, newest first
export async function getAllGalleries(req, res, next) {
  try {
    const galleries = await Gallery.find().sort({ date: -1 });

    res.status(200).json({ success: true, data: galleries });
  } catch (error) {
    next(error);
  }
}

// POST /api/v1/gallery   (admin only)
export async function createGallery(req, res, next) {
  try {
    const data = pickGalleryFields(req.body);

    const gallery = await Gallery.create(data);

    res.status(201).json({ success: true, data: gallery });
  } catch (error) {
    next(error);
  }
}

// PUT /api/v1/gallery/:id   (admin only)
export async function updateGallery(req, res, next) {
  try {
    const data = pickGalleryFields(req.body);

    const gallery = await Gallery.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });

    if (!gallery) {
      return next(createError("Album not found.", 404));
    }

    res.status(200).json({ success: true, data: gallery });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/v1/gallery/:id   (admin only)
export async function deleteGallery(req, res, next) {
  try {
    const gallery = await Gallery.findByIdAndDelete(req.params.id);

    if (!gallery) {
      return next(createError("Album not found.", 404));
    }

    res.status(200).json({ success: true, message: "Album deleted." });
  } catch (error) {
    next(error);
  }
}