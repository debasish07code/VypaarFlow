import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Customer info captured at order creation
    customer: {
      name: { type: String, default: "Walk-in Customer" },
      mobile: { type: String, default: "" },
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: Number,
        price: Number,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    // Only two lifecycle stages
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
    },
    // Timeline: each status change is recorded with a timestamp
    statusHistory: [
      {
        status: { type: String },
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
);

orderSchema.index({ user: 1 });
orderSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Order", orderSchema);