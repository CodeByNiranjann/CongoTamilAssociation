// backend/controllers/publicationController.js
import Publication from "../models/Publication.js";

const allowedSections = ["general", "africa-tamil-charal"];

// Builds an error with a status code, to pass to next()
function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

// Picks only the fields an admin is allowed to set.
// Anything else in the request body is ignored.
function pickPublicationFields(body) {
  const data = {};

  const textFields = [
    "title",
    "description",
    "coverImageUrl",
    "coverImagePublicId",
    "pdfLink",
    "section",
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

  if (data.section !== undefined && allowedSections.includes(data.section) === false) {
    throw createError("Invalid section.", 400);
  }

  // Month and year may arrive as text ("3") from the form or as numbers
  const numberFields = ["month", "year"];

  for (const field of numberFields) {
    if (body[field] !== undefined) {
      if (typeof body[field] !== "string" && typeof body[field] !== "number") {
        throw createError(field + " must be a number.", 400);
      }

      const value = Number(body[field]);

      if (Number.isInteger(value) === false) {
        throw createError(field + " must be a whole number.", 400);
      }

      data[field] = value;
    }
  }

  if (body.isPublished !== undefined) {
    if (typeof body.isPublished !== "boolean") {
      throw createError("isPublished must be true or false.", 400);
    }
    data.isPublished = body.isPublished;
  }

  return data;
}

// Reads ?section=... from the URL and checks it is allowed (default "general")
function readSection(req) {
  let section = "general";

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

// GET /api/v1/publications?section=general   (public)
// Published items for one section, newest first
export async function getPublicPublications(req, res, next) {
  try {
    const section = readSection(req);

    const publications = await Publication.find({
      section: section,
      isPublished: true,
    })
      .sort({ year: -1, month: -1 })
      .select("-coverImagePublicId -__v");

    res.status(200).json({ success: true, data: publications });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/publications/admin?section=general   (admin only)
// All items for one section, including drafts
export async function getAllPublications(req, res, next) {
  try {
    const section = readSection(req);

    const publications = await Publication.find({ section: section }).sort({
      year: -1,
      month: -1,
    });

    res.status(200).json({ success: true, data: publications });
  } catch (error) {
    next(error);
  }
}

// POST /api/v1/publications   (admin only)
export async function createPublication(req, res, next) {
  try {
    const data = pickPublicationFields(req.body);

    const publication = await Publication.create(data);

    res.status(201).json({ success: true, data: publication });
  } catch (error) {
    next(error);
  }
}

// PUT /api/v1/publications/:id   (admin only)
export async function updatePublication(req, res, next) {
  try {
    const data = pickPublicationFields(req.body);

    const publication = await Publication.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true, runValidators: true }
    );

    if (!publication) {
      return next(createError("Publication not found.", 404));
    }

    res.status(200).json({ success: true, data: publication });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/v1/publications/:id   (admin only)
export async function deletePublication(req, res, next) {
  try {
    const publication = await Publication.findByIdAndDelete(req.params.id);

    if (!publication) {
      return next(createError("Publication not found.", 404));
    }

    res.status(200).json({ success: true, message: "Publication deleted." });
  } catch (error) {
    next(error);
  }
}