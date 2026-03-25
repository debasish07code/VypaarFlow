import Transaction from "../models/Transaction.js";

// ADD TRANSACTION
export const addTransaction = async (req, res) => {
  try {
    const { amount, type, category } = req.body;

    const newTx = await Transaction.create({
      userId: req.user._id,
      amount,
      type,
      category,
    });

    res.json(newTx);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET TRANSACTIONS
export const getTransactions = async (req, res) => {
  try {
    const data = await Transaction.find({ userId: req.user._id }).sort({ date: -1 }).lean();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE TRANSACTION
export const deleteTransaction = async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.status(404).json({ message: "Transaction not found" });
    if (tx.userId.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Not authorized" });
    await tx.deleteOne();
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};