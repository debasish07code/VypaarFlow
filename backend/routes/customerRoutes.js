import express from "express";
import Customer from "../models/customerModel.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();
router.use(authMiddleware);

// GET /api/customers — all customers for this business
router.get("/", async (req, res) => {
  try {
    const customers = await Customer.find({ user: req.user._id })
      .sort({ totalSpent: -1 })
      .lean();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/customers/:id — customer detail with populated orders
router.get("/:id", async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, user: req.user._id })
      .populate({ path: "orders", select: "totalAmount status createdAt" })
      .lean();
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
