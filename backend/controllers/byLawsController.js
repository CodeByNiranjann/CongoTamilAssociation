// backend/controllers/byLawsController.js
import ByLaws from "../models/ByLaws.js";

// Builds an error with a status code, to pass to next()
function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

// Checks the list of rule sections and returns a clean copy.
// Each section needs a heading and text, both plain strings.
function cleanSections(value) {
  if (Array.isArray(value) === false) {
    throw createError("sections must be a list.", 400);
  }

  if (value.length > 100) {
    throw createError("Too many sections.", 400);
  }

  const result = [];

  for (const item of value) {
    if (item === null || typeof item !== "object") {
      throw createError("Each section must have a heading and text.", 400);
    }

    // Only plain strings are accepted (blocks NoSQL injection objects)
    if (typeof item.heading !== "string" || typeof item.text !== "string") {
      throw createError("Each section must have a heading and text.", 400);
    }

    // Only heading and text are kept. Any other field is ignored.
    result.push({
      heading: item.heading.trim(),
      text: item.text.trim(),
    });
  }

  return result;
}

// Picks only the fields an admin is allowed to set.
// Anything else in the request body is ignored.
function pickByLawsFields(body) {
  const data = {};

  const textFields = ["intro", "pdfUrl", "pdfPublicId"];

  for (const field of textFields) {
    if (body[field] !== undefined) {
      if (typeof body[field] !== "string") {
        throw createError(field + " must be text.", 400);
      }
      data[field] = body[field].trim();
    }
  }

  if (body.sections !== undefined) {
    data.sections = cleanSections(body.sections);
  }

  return data;
}

// GET /api/v1/by-laws   (public)
// Returns the single by-laws record. If none is saved yet, returns empty
// defaults without writing anything to the database.
export async function getByLaws(req, res, next) {
  try {
    const byLaws = await ByLaws.findOne().select("-pdfPublicId -__v");

    if (!byLaws) {
      return res.status(200).json({
        success: true,
        data: { intro: "", sections: [], pdfUrl: "" },
      });
    }

    res.status(200).json({ success: true, data: byLaws });
  } catch (error) {
    next(error);
  }
}

// PUT /api/v1/by-laws   (admin only)
// Creates the record on first save, then updates the same record.
// Send the full "sections" list in the order it should be shown.
export async function saveByLaws(req, res, next) {
  try {
    const data = pickByLawsFields(req.body);

    let byLaws = await ByLaws.findOne();

    if (!byLaws) {
      byLaws = await ByLaws.create(data);
    } else {
      byLaws.set(data);
      await byLaws.save();
    }

    res.status(200).json({ success: true, data: byLaws });
  } catch (error) {
    next(error);
  }
}