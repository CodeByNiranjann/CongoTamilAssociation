// backend/controllers/visitorController.js
import Visitor from "../models/Visitor.js";

// "Today" is worked out in one fixed time zone, so the day does not change
// at the wrong hour. Set VISITOR_TIMEZONE in .env to change it.
// Africa/Lubumbashi is used by default (Congo, UTC+2).
const TIMEZONE = process.env.VISITOR_TIMEZONE || "Africa/Lubumbashi";

// Returns today's date as "YYYY-MM-DD" in the chosen time zone
function getToday() {
  // The "en-CA" format is year-month-day
  return new Date().toLocaleDateString("en-CA", { timeZone: TIMEZONE });
}

// POST /api/v1/visitors/hit   (public)
// The website calls this once per browser session.
// One atomic update per visit, so two visitors at the same moment
// can never overwrite each other's count.
export async function recordVisit(req, res, next) {
  try {
    await Visitor.updateOne(
      { day: getToday() },
      { $inc: { count: 1 } },
      { upsert: true }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/visitors/total   (public)
// Only the total number, for the small counter at the bottom of the Home page
export async function getPublicTotal(req, res, next) {
  try {
    const result = await Visitor.aggregate([
      { $group: { _id: null, total: { $sum: "$count" } } },
    ]);

    let total = 0;
    if (result.length > 0) {
      total = result[0].total;
    }

    res.status(200).json({ success: true, total: total });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/visitors/stats   (admin only)
// Today, this month and total recorded visits
export async function getStats(req, res, next) {
  try {
    const today = getToday();
    const monthPrefix = today.slice(0, 7); // "YYYY-MM"

    const todayRecord = await Visitor.findOne({ day: today });

    const monthResult = await Visitor.aggregate([
      { $match: { day: { $regex: "^" + monthPrefix } } },
      { $group: { _id: null, total: { $sum: "$count" } } },
    ]);

    const totalResult = await Visitor.aggregate([
      { $group: { _id: null, total: { $sum: "$count" } } },
    ]);

    let todayCount = 0;
    if (todayRecord) {
      todayCount = todayRecord.count;
    }

    let monthCount = 0;
    if (monthResult.length > 0) {
      monthCount = monthResult[0].total;
    }

    let totalCount = 0;
    if (totalResult.length > 0) {
      totalCount = totalResult[0].total;
    }

    res.status(200).json({
      success: true,
      today: todayCount,
      month: monthCount,
      total: totalCount,
      note: "Counts are visits (one per browser session), not unique people.",
    });
  } catch (error) {
    next(error);
  }
}