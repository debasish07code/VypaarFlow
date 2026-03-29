import mongoose from "mongoose";

/**
 * Customer Model
 * Tracks B2B customer profiles and links their orders.
 * New customers are auto-created on first order.
 */
const customerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, trim: true },
  // All orders placed by this customer
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  totalSpent: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
}, { timestamps: true });

// Composite unique index: one entry per mobile per business
customerSchema.index({ user: 1, mobile: 1 }, { unique: true });

export default mongoose.model("Customer", customerSchema);
