import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String, // income or expense
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

transactionSchema.index({ userId: 1 });
transactionSchema.index({ userId: 1, date: -1 });

export default mongoose.model("Transaction", transactionSchema);