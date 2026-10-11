// backend/controllers/africaTamilCharalController.js
import {
  AfricaTamilCharalInfo,
  AfricaTamilCharalDocument,
} from "../models/AfricaTamilCharal.js";

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

// Picks only the information fields an admin is allowed to set
function pickInfoFields(body) {
  const data = {};

  if (body.introduction !== undefined) {
    if (typeof body.introduction !== "string") {
      throw createError("introduction must be text.", 400);
    }
    data.introduction = body.introduction.trim();
  }

  if (body.images !== undefined) {
    data.images = cleanList(body.images, "images");
  }

  return data;
}

// Picks only the document fields an admin is allowed to set
function pickDocumentFields(body) {
  const data = {};

  const textFields = ["title", "link"];

  for (const field of textFields) {
    if (body[field] !== undefined) {
      if (typeof body[field] !== "string") {
        throw createError(field + " must be text.", 400);
      }
      data[field] = body[field].trim();
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

// ---------- Information (single record) ----------

// GET /api/v1/africa-tamil-charal   (public)
export async function getInfo(req, res, next) {
  try {
    const info = await AfricaTamilCharalInfo.findOne().select("-__v");

    if (!info) {
      return res.status(200).json({
        success: true,
        data: { introduction: "", images: [] },
      });
    }

    res.status(200).json({ success: true, data: info });
  } catch (error) {
    next(error);
  }
}

// PUT /api/v1/africa-tamil-charal   (admin only)
export async function saveInfo(req, res, next) {
  try {
    const data = pickInfoFields(req.body);

    let info = await AfricaTamilCharalInfo.findOne();

    if (!info) {
      info = await AfricaTamilCharalInfo.create(data);
    } else {
      info.set(data);
      await info.save();
    }

    res.status(200).json({ success: true, data: info });
  } catch (error) {
    next(error);
  }
}

// ---------- Documents (many records) ----------

// GET /api/v1/africa-tamil-charal/documents   (public)
export async function getPublicDocuments(req, res, next) {
  try {
    const documents = await AfricaTamilCharalDocument.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .select("-__v");

    res.status(200).json({ success: true, data: documents });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/africa-tamil-charal/documents/admin   (admin only)
export async function getAllDocuments(req, res, next) {
  try {
    const documents = await AfricaTamilCharalDocument.find().sort({
      createdAt: -1,
    });

    res.status(200).json({ success: true, data: documents });
  } catch (error) {
    next(error);
  }
}

// POST /api/v1/africa-tamil-charal/documents   (admin only)
export async function createDocument(req, res, next) {
  try {
    const data = pickDocumentFields(req.body);

    const document = await AfricaTamilCharalDocument.create(data);

    res.status(201).json({ success: true, data: document });
  } catch (error) {
    next(error);
  }
}

// PUT /api/v1/africa-tamil-charal/documents/:id   (admin only)
export async function updateDocument(req, res, next) {
  try {
    const data = pickDocumentFields(req.body);

    const document = await AfricaTamilCharalDocument.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true, runValidators: true }
    );

    if (!document) {
      return next(createError("Document not found.", 404));
    }

    res.status(200).json({ success: true, data: document });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/v1/africa-tamil-charal/documents/:id   (admin only)
export async function deleteDocument(req, res, next) {
  try {
    const document = await AfricaTamilCharalDocument.findByIdAndDelete(
      req.params.id
    );

    if (!document) {
      return next(createError("Document not found.", 404));
    }

    res.status(200).json({ success: true, message: "Document deleted." });
  } catch (error) {
    next(error);
  }
}