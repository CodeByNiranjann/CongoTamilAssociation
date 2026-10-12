// backend/controllers/joinEnquiryController.js
import JoinEnquiry from "../models/JoinEnquiry.js";
import { sendNotification } from "../utils/email.js";

const allowedStatuses = ["New", "Contacted", "Completed"];

// Builds an error with a status code, to pass to next()
function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

// Reads one text field from the request body
function readText(body, field) {
  const value = body[field];

  if (value === undefined) {
    return "";
  }

  // Only plain strings are accepted (blocks NoSQL injection objects)
  if (typeof value !== "string") {
    throw createError(field + " must be text.", 400);
  }

  return value.trim();
}

// POST /api/v1/join-enquiries   (public)
// Body: { name, phone, email, company }
// The enquiry is saved FIRST. The email is sent afterwards, and its real
// result (Sent or Failed) is stored, so a mail problem never loses an enquiry.
export async function submitEnquiry(req, res, next) {
  try {
    const enquiry = await JoinEnquiry.create({
      name: readText(req.body, "name"),
      phone: readText(req.body, "phone"),
      email: readText(req.body, "email"),
      company: readText(req.body, "company"),
    });

    const sent = await sendNotification({
      subject: "New Join CTA enquiry from " + enquiry.name,
      replyTo: enquiry.email,
      lines: [
        ["Name", enquiry.name],
        ["Phone", enquiry.phone],
        ["Email", enquiry.email],
        ["Company", enquiry.company],
      ],
    });

    if (sent) {
      enquiry.emailStatus = "Sent";
    } else {
      enquiry.emailStatus = "Failed";
    }
    await enquiry.save();

    // Only a plain message goes back to the visitor
    res.status(201).json({
      success: true,
      message: "Thank you! Your enquiry was received. We will get in touch with you.",
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/join-enquiries   (admin only)
// Query: ?status=New|Contacted|Completed  &page=1  &limit=20
export async function getEnquiries(req, res, next) {
  try {
    const filter = {};

    if (req.query.status !== undefined) {
      if (
        typeof req.query.status !== "string" ||
        allowedStatuses.includes(req.query.status) === false
      ) {
        return next(createError("Invalid status.", 400));
      }
      filter.status = req.query.status;
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

    const total = await JoinEnquiry.countDocuments(filter);

    const enquiries = await JoinEnquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-__v");

    res.status(200).json({
      success: true,
      data: enquiries,
      pagination: {
        page: page,
        limit: limit,
        total: total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/join-enquiries/new-count   (admin only)
// Number of enquiries still marked "New", for the dashboard badge
export async function getNewCount(req, res, next) {
  try {
    const count = await JoinEnquiry.countDocuments({ status: "New" });

    res.status(200).json({ success: true, count: count });
  } catch (error) {
    next(error);
  }
}

// PUT /api/v1/join-enquiries/:id/status   (admin only)
// Body: { status: "Contacted" }
export async function updateStatus(req, res, next) {
  try {
    const status = req.body.status;

    if (typeof status !== "string" || allowedStatuses.includes(status) === false) {
      return next(createError("Status must be New, Contacted or Completed.", 400));
    }

    const enquiry = await JoinEnquiry.findByIdAndUpdate(
      req.params.id,
      { status: status },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!enquiry) {
      return next(createError("Enquiry not found.", 404));
    }

    res.status(200).json({ success: true, data: enquiry });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/v1/join-enquiries/:id   (admin only)
export async function deleteEnquiry(req, res, next) {
  try {
    const enquiry = await JoinEnquiry.findByIdAndDelete(req.params.id);

    if (!enquiry) {
      return next(createError("Enquiry not found.", 404));
    }

    res.status(200).json({ success: true, message: "Enquiry deleted." });
  } catch (error) {
    next(error);
  }
}