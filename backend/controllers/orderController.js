import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import Customer from "../models/customerModel.js";

// Create Order — also upserts the Customer record
export const createOrder = async (req, res) => {
  try {
    const { products, customerName, customerMobile } = req.body;

    let totalAmount = 0;

    const updatedProducts = await Promise.all(
      products.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) throw new Error("Product not found");
        if (product.quantity < item.quantity)
          throw new Error(`Not enough stock for ${product.name}`);

        product.quantity -= item.quantity;
        await product.save();

        totalAmount += product.price * item.quantity;
        return { product: product._id, quantity: item.quantity, price: product.price };
      })
    );

    const order = await Order.create({
      user: req.user._id,
      customer: {
        name: customerName || "Walk-in Customer",
        mobile: customerMobile || "",
      },
      products: updatedProducts,
      totalAmount,
      statusHistory: [{ status: "pending", timestamp: new Date() }],
    });

    // Upsert Customer record — create if new, update if existing
    if (customerMobile) {
      await Customer.findOneAndUpdate(
        { user: req.user._id, mobile: customerMobile },
        {
          $set: { name: customerName || "Customer" },
          $push: { orders: order._id },
          $inc: { totalSpent: totalAmount, totalOrders: 1 },
        },
        { upsert: true, new: true }
      );
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Orders — sorted newest first
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("products.product")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Order Status — only pending ↔ approved
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Not authorized" });

    const { status, note } = req.body;
    // Guard: only allow valid statuses
    if (!["pending", "approved"].includes(status))
      return res.status(400).json({ message: "Invalid status" });

    order.status = status;
    order.statusHistory.push({ status, timestamp: new Date(), note: note || "" });
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};