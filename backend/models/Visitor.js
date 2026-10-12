// backend/models/Visitor.js
import mongoose from "mongoose";

// Counting method (kept simple and honest):
// One record per DAY, holding how many "visits" were recorded that day.
// A visit is counted once per browser session, when the visitor first opens
// the website. The same person returning in a new browser session, or using
// another device, is counted again. So these numbers are VISITS, not a
// perfect count of unique people.
//
// No IP addresses, names or other personal data are stored.
const visitorSchema = new mongoose.Schema(
  {
    // Day in the form "2026-10-12" (year-month-day)
    day: {
      type: String,
      required: [true, "Day is required"],
      unique: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, "Day must look like 2026-10-12"],
    },
    // Number of visits recorded on that day
    count: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Count cannot be negative"],
    },
  },
  { timestamps: true }
);

const Visitor = mongoose.model("Visitor", visitorSchema);

export default Visitor;