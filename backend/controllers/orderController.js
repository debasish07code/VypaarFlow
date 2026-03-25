import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";

// Create Order with Inventory Update
export const createOrder = async (req, res) => {
  try {
    const { products } = req.body;

    let totalAmount = 0;

    const updatedProducts = await Promise.all(
      products.map(async (item) => {
        const product = await Product.findById(item.product);

        // ❌ Product not found
        if (!product) {
          throw new Error("Product not found");
        }

        // ❌ Not enough quantity (stock check)
        if (product.quantity < item.quantity) {
          throw new Error(`Not enough stock for ${product.name}`);
        }

        // ✅ Reduce stock
        product.quantity -= item.quantity;
        await product.save();

        // ✅ Calculate total
        totalAmount += product.price * item.quantity;

        return {
          product: product._id,
          quantity: item.quantity,
          price: product.price,
        };
      })
    );

    // ✅ Create order
    const order = await Order.create({
      user: req.user._id,
      products: updatedProducts,
      totalAmount,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Orders
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

// Update Order Status
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Not authorized" });

    order.status = req.body.status;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};