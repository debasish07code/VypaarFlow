import Transaction from "../models/Transaction.js";

// ADD TRANSACTION
export const addTransaction = async (req, res) => {
  try {
    const { amount, type, category } = req.body;

    const newTx = await Transaction.create({
      userId: req.user.id,
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
    const data = await Transaction.find({ userId: req.user.id });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE TRANSACTION
export const deleteTransaction = async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};