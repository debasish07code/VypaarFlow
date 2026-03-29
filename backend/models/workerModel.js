import mongoose from "mongoose";

/**
 * Worker Model
 * Tracks worker profiles, attendance, and salary calculation
 */
const attendanceSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  status: { type: String, enum: ["present", "absent"], required: true },
}, { _id: false });

const workerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: { type: String, required: true, trim: true },
  position: { type: String, required: true, trim: true },
  base_salary: { type: Number, required: true },
  phone: { type: String, default: "" },
  attendance: [attendanceSchema],
}, { timestamps: true });

workerSchema.index({ user: 1 });

export default mongoose.model("Worker", workerSchema);
