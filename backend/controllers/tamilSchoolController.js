// backend/controllers/tamilSchoolController.js
import TamilSchool from "../models/TamilSchool.js";
import { deleteCloudinaryAsset } from "../utils/cloudinary.js";

// Builds an error with a status code, to pass to next()
function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

// Checks that a value is a list of plain strings and returns a clean copy
function cleanList(value, fieldName) {
  if (Array.isArray(value) === false) {
    throw createError(fieldName + " must be a list.", 400);
  }

  const result = [];

  for (const item of value) {
    // Only plain strings are accepted (blocks NoSQL injection objects)
    if (typeof item !== "string") {
      throw createError("Each item in " + fieldName + " must be text.", 400);
    }

    const trimmed = item.trim();

    if (trimmed !== "") {
      result.push(trimmed);
    }
  }

  return result;
}

// Picks only the fields an admin is allowed to set.
// Anything else in the request body is ignored.
function pickSchoolFields(body) {
  const data = {};

  if (body.introduction !== undefined) {
    if (typeof body.introduction !== "string") {
      throw createError("introduction must be text.", 400);
    }
    data.introduction = body.introduction.trim();
  }

  if (body.activities !== undefined) {
    data.activities = cleanList(body.activities, "activities");
  }

  if (body.images !== undefined) {
    data.images = cleanList(body.images, "images");
  }

  return data;
}

// GET /api/v1/tamil-school   (public)
// Returns the single Tamil School record. If none is saved yet, returns
// empty defaults without writing anything to the database.
export async function getTamilSchool(req, res, next) {
  try {
    const school = await TamilSchool.findOne().select("-__v");

    if (!school) {
      return res.status(200).json({
        success: true,
        data: { introduction: "", activities: [], images: [] },
      });
    }

    res.status(200).json({ success: true, data: school });
  } catch (error) {
    next(error);
  }
}

// PUT /api/v1/tamil-school   (admin only)
// Creates the record on first save, then updates the same record.
// Also deletes any removed images from Cloudinary.
export async function saveTamilSchool(req, res, next) {
  try {
    const data = pickSchoolFields(req.body);

    let school = await TamilSchool.findOne();

    if (!school) {
      school = await TamilSchool.create(data);
    } else {
      if (Array.isArray(data.images) && Array.isArray(school.images)) {
        const removedImages = school.images.filter(
          (oldUrl) => !data.images.includes(oldUrl)
        );
        for (const oldUrl of removedImages) {
          await deleteCloudinaryAsset(oldUrl, "image", "upload");
        }
      }

      school.set(data);
      await school.save();
    }

    res.status(200).json({ success: true, data: school });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/v1/tamil-school   (admin only)
// Deletes Tamil School record and removes all associated images from Cloudinary.
export async function deleteTamilSchool(req, res, next) {
  try {
    const schools = await TamilSchool.find();
    for (const school of schools) {
      if (Array.isArray(school.images)) {
        for (const imageUrl of school.images) {
          await deleteCloudinaryAsset(imageUrl, "image", "upload");
        }
      }
    }

    await TamilSchool.deleteMany({});

    return res.status(200).json({
      success: true,
      message: "Tamil School information deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}
