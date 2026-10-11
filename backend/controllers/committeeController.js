// backend/controllers/committeeController.js
import Committee from "../models/Committee.js";

// Builds an error with a status code, to pass to next()
function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

// Picks only the fields an admin is allowed to set.
// Anything else in the request body is ignored.
function pickCommitteeFields(body) {
  const data = {};

  const textFields = ["name", "role", "year", "bio"];

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

// GET /api/v1/committee   (public)
// All members, newest year first. The Committee page groups them by year.
export async function getPublicCommittee(req, res, next) {
  try {
    const members = await Committee.find()
      .sort({ year: -1, createdAt: 1 })
      .select("-__v");

    res.status(200).json({ success: true, data: members });
  } catch (error) {
    next(error);
  }
}

// POST /api/v1/committee   (admin only)
export async function createMember(req, res, next) {
  try {
    const data = pickCommitteeFields(req.body);

    const member = await Committee.create(data);

    res.status(201).json({ success: true, data: member });
  } catch (error) {
    next(error);
  }
}

// PUT /api/v1/committee/:id   (admin only)
export async function updateMember(req, res, next) {
  try {
    const data = pickCommitteeFields(req.body);

    const member = await Committee.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });

    if (!member) {
      return next(createError("Committee member not found.", 404));
    }

    res.status(200).json({ success: true, data: member });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/v1/committee/:id   (admin only)
export async function deleteMember(req, res, next) {
  try {
    const member = await Committee.findByIdAndDelete(req.params.id);

    if (!member) {
      return next(createError("Committee member not found.", 404));
    }

    res.status(200).json({ success: true, message: "Committee member deleted." });
  } catch (error) {
    next(error);
  }
}