// backend/controllers/bannerController.js
import Banner from "../models/Banner.js";

// Builds an error with a status code, to pass to next()
function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

// Picks only the fields an admin is allowed to set.
// Anything else in the request body is ignored.
function pickBannerFields(body) {
  const data = {};

  const textFields = [
    "title",
    "description",
    "imageUrl",
    "imagePublicId",
    "buttonText",
    "buttonLink",
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

  if (body.isPublished !== undefined) {
    if (typeof body.isPublished !== "boolean") {
      throw createError("isPublished must be true or false.", 400);
    }
    data.isPublished = body.isPublished;
  }

  return data;
}

// GET /api/v1/banners   (public)
// Published banners only, in order. Used by the Home page.
export async function getPublicBanners(req, res, next) {
  try {
    const banners = await Banner.find({ isPublished: true })
      .sort({ order: 1, createdAt: 1 })
      .select("-imagePublicId -__v");

    res.status(200).json({ success: true, data: banners });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/banners/admin   (admin only)
// All banners, including drafts
export async function getAllBanners(req, res, next) {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: 1 });

    res.status(200).json({ success: true, data: banners });
  } catch (error) {
    next(error);
  }
}

// POST /api/v1/banners   (admin only)
export async function createBanner(req, res, next) {
  try {
    const data = pickBannerFields(req.body);

    // New banners go to the end of the list
    const last = await Banner.findOne().sort({ order: -1 }).select("order");
    data.order = last ? last.order + 1 : 0;

    const banner = await Banner.create(data);

    res.status(201).json({ success: true, data: banner });
  } catch (error) {
    next(error);
  }
}

// PUT /api/v1/banners/:id   (admin only)
export async function updateBanner(req, res, next) {
  try {
    const data = pickBannerFields(req.body);

    const banner = await Banner.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });

    if (!banner) {
      return next(createError("Banner not found.", 404));
    }

    res.status(200).json({ success: true, data: banner });
  } catch (error) {
    next(error);
  }
}

// PUT /api/v1/banners/reorder   (admin only)
// Body: { ids: ["id1", "id2", ...] }  in the new order
export async function reorderBanners(req, res, next) {
  try {
    const ids = req.body.ids;

    if (Array.isArray(ids) === false) {
      return next(createError("ids must be a list.", 400));
    }

    for (const id of ids) {
      if (typeof id !== "string") {
        return next(createError("Each id must be text.", 400));
      }
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
      await Banner.bulkWrite(operations);
    }

    const banners = await Banner.find().sort({ order: 1, createdAt: 1 });

    res.status(200).json({ success: true, data: banners });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/v1/banners/:id   (admin only)
export async function deleteBanner(req, res, next) {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);

    if (!banner) {
      return next(createError("Banner not found.", 404));
    }

    res.status(200).json({ success: true, message: "Banner deleted." });
  } catch (error) {
    next(error);
  }
}