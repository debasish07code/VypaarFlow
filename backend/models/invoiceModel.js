import mongoose from "mongoose";

/**
 * Invoice Model
 * Stores invoice data generated from approved orders
 */
const invoiceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  invoiceNumber: { type: String, unique: true },
  customer: {
    name: { type: String, required: true },
    mobile: { type: String, default: "" },   // optional — walk-in customers may not have one
  },
  items: [{
    name: { type: String },
    quantity: { type: Number },
    price: { type: Number },
    total: { type: Number },
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ["draft", "sent"], default: "draft" },
  sentAt: { type: Date },
}, { timestamps: true });

invoiceSchema.index({ user: 1 });
invoiceSchema.index({ order: 1 });

// Auto-generate sequential invoice number
// NOTE: Use plain async without calling next() — Mongoose resolves pre hooks
// by the returned Promise when the hook is declared async.
invoiceSchema.pre("save", async function () {
  if (!this.invoiceNumber) {
    const count = await mongoose.model("Invoice").countDocuments();
    this.invoiceNumber = `INV-${String(count + 1).padStart(5, "0")}`;
  }
  // No next() — async pre-hooks resolve via the returned Promise
});

export default mongoose.model("Invoice", invoiceSchema);
