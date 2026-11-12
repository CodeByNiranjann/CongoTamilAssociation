// backend/controllers/fileController.js
import File from "../models/File.js";
import { deleteCloudinaryAsset } from "../utils/cloudinary.js";

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function pickFileFields(body) {
  const data = {};

  if (body.title !== undefined) {
    if (typeof body.title !== "string") {
      throw createError("title must be text.", 400);
    }
    data.title = body.title.trim();
  }

  if (body.fileUrl !== undefined) {
    if (typeof body.fileUrl !== "string") {
      throw createError("fileUrl must be text.", 400);
    }
    data.fileUrl = body.fileUrl.trim();
  }

  if (body.fileType !== undefined) {
    const allowed = ["image", "pdf", "audio", "document"];
    if (!allowed.includes(body.fileType)) {
      throw createError("fileType must be one of: image, pdf, audio, document.", 400);
    }
    data.fileType = body.fileType;
  }

  if (body.publicId !== undefined) {
    if (typeof body.publicId !== "string") {
      throw createError("publicId must be text.", 400);
    }
    data.publicId = body.publicId.trim();
  }

  if (body.isPublished !== undefined) {
    if (typeof body.isPublished !== "boolean") {
      throw createError("isPublished must be true or false.", 400);
    }
    data.isPublished = body.isPublished;
  }

  return data;
}

// GET /api/v1/files (public)
// Returns published files. Supports optional ?type=image query.
export async function getPublicFiles(req, res, next) {
  try {
    const filter = { isPublished: true };

    if (req.query.type) {
      filter.fileType = req.query.type;
    }

    const files = await File.find(filter)
      .sort({ order: 1, createdAt: 1 })
      .select("-publicId -__v");

    res.status(200).json({ success: true, data: files });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/files/admin (admin only)
// Returns all files (including drafts).
export async function getAllFiles(req, res, next) {
  try {
    const filter = {};

    if (req.query.type) {
      filter.fileType = req.query.type;
    }

    const files = await File.find(filter).sort({ order: 1, createdAt: 1 });

    res.status(200).json({ success: true, data: files });
  } catch (error) {
    next(error);
  }
}

// POST /api/v1/files (admin only)
export async function createFile(req, res, next) {
  try {
    const data = pickFileFields(req.body);

    if (!data.title) {
      return next(createError("Title is required.", 400));
    }
    if (!data.fileUrl) {
      return next(createError("File URL is required.", 400));
    }

    const last = await File.findOne().sort({ order: -1 }).select("order");
    data.order = last && typeof last.order === "number" ? last.order + 1 : 0;

    const file = await File.create(data);

    res.status(201).json({ success: true, data: file });
  } catch (error) {
    next(error);
  }
}

// PUT /api/v1/files/:id (admin only)
export async function updateFile(req, res, next) {
  try {
    const data = pickFileFields(req.body);

    const existing = await File.findById(req.params.id);
    if (!existing) {
      return next(createError("File record not found.", 404));
    }

    const fileChanged =
      (data.publicId && existing.publicId && data.publicId !== existing.publicId) ||
      (data.fileUrl && data.fileUrl !== existing.fileUrl);

    if (fileChanged) {
      const resourceType =
        existing.fileType === "audio"
          ? "video"
          : existing.fileType === "image"
          ? "image"
          : "raw";
      await deleteCloudinaryAsset(
        existing.publicId || existing.fileUrl,
        resourceType,
        "upload"
      );
    }

    const updated = await File.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

// PUT /api/v1/files/reorder (admin only)
export async function reorderFiles(req, res, next) {
  try {
    const ids = req.body.ids;

    if (!Array.isArray(ids)) {
      return next(createError("ids must be an array of IDs.", 400));
    }

    const operations = ids.map(function (id, index) {
      return {
        updateOne: {
          filter: { _id: id },
          update: { $set: { order: index } },
        },
      };
    });

    if (operations.length > 0) {
      await File.bulkWrite(operations);
    }

    const files = await File.find().sort({ order: 1, createdAt: 1 });

    res.status(200).json({ success: true, data: files });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/v1/files/:id (admin only)
export async function deleteFileRecord(req, res, next) {
  try {
    const file = await File.findByIdAndDelete(req.params.id);

    if (!file) {
      return next(createError("File record not found.", 404));
    }

    const resourceType =
      file.fileType === "audio"
        ? "video"
        : file.fileType === "image"
        ? "image"
        : "raw";

    await deleteCloudinaryAsset(
      file.publicId || file.fileUrl,
      resourceType,
      "upload"
    );

    res.status(200).json({ success: true, message: "File deleted." });
  } catch (error) {
    next(error);
  }
}
