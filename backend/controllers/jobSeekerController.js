// backend/controllers/jobSeekerController.js
import JobSeeker from "../models/JobSeeker.js";
import {
  uploadPrivateDocument,
  getPrivateDownloadUrl,
  deleteFile,
} from "../utils/cloudinary.js";
import { getFileExtension } from "../middleware/uploadMiddleware.js";

const allowedStatuses = ["New", "Contacted", "Completed"];

// Builds an error with a status code, to pass to next()
function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

// Reads one required or optional text field from the form body
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

// POST /api/v1/job-seekers   (public, multipart form with a "cv" file)
export async function submitApplication(req, res, next) {
  let uploadedPublicId = "";

  try {
    if (!req.file) {
      return next(createError("Please upload your CV (PDF, DOC or DOCX).", 400));
    }

    const experience = Number(readText(req.body, "experience"));

    if (Number.isNaN(experience)) {
      return next(createError("Years of experience must be a number.", 400));
    }

    const data = {
      name: readText(req.body, "name"),
      phone: readText(req.body, "phone"),
      email: readText(req.body, "email"),
      company: readText(req.body, "company"),
      jobTitle: readText(req.body, "jobTitle"),
      skills: readText(req.body, "skills"),
      experience: experience,
      location: readText(req.body, "location"),
    };

    // Validate the text fields BEFORE uploading the CV, so no file is stored
    // for an application that would be rejected.
    const draft = new JobSeeker(data);
    await draft.validate();

    // Store the CV privately (no public link)
    const extension = getFileExtension(req.file);
    const stored = await uploadPrivateDocument(req.file.buffer, "cvs", extension);
    uploadedPublicId = stored.publicId;

    draft.cvPublicId = stored.publicId;
    draft.cvOriginalName = req.file.originalname.slice(0, 150);
    draft.cvMimeType = req.file.mimetype;
    draft.hasCv = true;

    await draft.save();

    // Nothing private is sent back to the visitor
    res.status(201).json({
      success: true,
      message: "Your application was received. Thank you!",
    });
  } catch (error) {
    // If saving failed after the CV was uploaded, remove the orphan file
    if (uploadedPublicId) {
      try {
        await deleteFile(uploadedPublicId, "raw", "authenticated");
      } catch (cleanupError) {
        console.error("Could not remove the uploaded CV:", cleanupError.message);
      }
    }
    next(error);
  }
}

// GET /api/v1/job-seekers   (admin only)
// Query: ?status=New|Contacted|Completed  &page=1  &limit=20
export async function getApplications(req, res, next) {
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

    const total = await JobSeeker.countDocuments(filter);

    const applications = await JobSeeker.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-__v");

    res.status(200).json({
      success: true,
      data: applications,
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

// GET /api/v1/job-seekers/new-count   (admin only)
// Number of applications still marked "New", for the dashboard badge
export async function getNewCount(req, res, next) {
  try {
    const count = await JobSeeker.countDocuments({ status: "New" });

    res.status(200).json({ success: true, count: count });
  } catch (error) {
    next(error);
  }
}

// PUT /api/v1/job-seekers/:id/status   (admin only)
// Body: { status: "Contacted" }
export async function updateStatus(req, res, next) {
  try {
    const status = req.body.status;

    if (typeof status !== "string" || allowedStatuses.includes(status) === false) {
      return next(createError("Status must be New, Contacted or Completed.", 400));
    }

    const application = await JobSeeker.findByIdAndUpdate(
      req.params.id,
      { status: status },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!application) {
      return next(createError("Application not found.", 404));
    }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/job-seekers/:id/cv   (admin only)
// Returns a short-lived download link (valid about 5 minutes).
// The login is checked by the protect middleware before this runs.
export async function getCvLink(req, res, next) {
  try {
    const application = await JobSeeker.findById(req.params.id).select(
      "+cvPublicId hasCv cvOriginalName"
    );

    if (!application || application.hasCv === false || !application.cvPublicId) {
      return next(createError("No CV found for this application.", 404));
    }

    const url = getPrivateDownloadUrl(application.cvPublicId, 5);

    res.status(200).json({
      success: true,
      url: url,
      fileName: application.cvOriginalName,
      expiresInMinutes: 5,
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/v1/job-seekers/:id   (admin only)
// Removes the application and its stored CV
export async function deleteApplication(req, res, next) {
  try {
    const application = await JobSeeker.findById(req.params.id).select(
      "+cvPublicId"
    );

    if (!application) {
      return next(createError("Application not found.", 404));
    }

    if (application.cvPublicId) {
      await deleteFile(application.cvPublicId, "raw", "authenticated");
    }

    await application.deleteOne();

    res.status(200).json({ success: true, message: "Application deleted." });
  } catch (error) {
    next(error);
  }
}