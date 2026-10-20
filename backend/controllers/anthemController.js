// backend/controllers/anthemController.js
import Anthem from "../models/Anthem.js";
import { deleteFile } from "../utils/cloudinary.js";

// Builds an error with a status code, to pass to next()
function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

// Picks only the fields an admin is allowed to set.
// Anything else in the request body is ignored.
function pickAnthemFields(body) {
  const data = {};

  const textFields = ["title", "description", "audioUrl", "audioPublicId"];

  for (const field of textFields) {
    if (body[field] !== undefined) {
      // Only plain strings are accepted (blocks NoSQL injection objects)
      if (typeof body[field] !== "string") {
        throw createError(field + " must be text.", 400);
      }
      data[field] = body[field].trim();
    }
  }

  return data;
}

// GET /api/v1/anthem   (public)
// Returns the single anthem record. If none is saved yet, returns defaults
// without writing anything to the database.
export async function getAnthem(req, res, next) {
  try {
    const anthem = await Anthem.findOne().select("-audioPublicId -__v");

    if (!anthem) {
      return res.status(200).json({
        success: true,
        data: { title: "CTA Anthem", description: "", audioUrl: "" },
      });
    }

    res.status(200).json({ success: true, data: anthem });
  } catch (error) {
    next(error);
  }
}

// PUT /api/v1/anthem   (admin only)
// Creates the anthem record on first save, then updates the same record.
export async function saveAnthem(req, res, next) {
  try {
    const data = pickAnthemFields(req.body);

    let anthem = await Anthem.findOne();

    if (!anthem) {
      anthem = await Anthem.create(data);
    } else {
      if (
        anthem.audioPublicId &&
        data.audioPublicId &&
        anthem.audioPublicId !== data.audioPublicId
      ) {
        try {
          await deleteFile(anthem.audioPublicId, "video", "upload");
        } catch (cleanupError) {
          console.error("Could not remove previous anthem audio:", cleanupError.message);
        }
      }
      anthem.set(data);
      await anthem.save();
    }

    res.status(200).json({ success: true, data: anthem });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/v1/anthem   (admin only)
// Removes the anthem record and deletes any uploaded audio from Cloudinary
export async function deleteAnthem(req, res, next) {
  try {
    const anthem = await Anthem.findOne();

    if (!anthem) {
      return res.status(200).json({
        success: true,
        message: "No anthem record to delete.",
      });
    }

    if (anthem.audioPublicId) {
      try {
        await deleteFile(anthem.audioPublicId, "video", "upload");
      } catch (cleanupError) {
        console.error("Could not remove anthem audio from Cloudinary:", cleanupError.message);
      }
    }

    await Anthem.deleteMany({});

    res.status(200).json({
      success: true,
      message: "CTA Anthem deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}