import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";

export const getDashboardData = async (req, res) => {
  try {
    // 🔢 Total Orders
    const totalOrders = await Order.countDocuments({
      user: req.user._id,
    });

    // 💰 Total Sales
    const orders = await Order.find({ user: req.user._id });
    const totalSales = orders.reduce(
      (acc, order) => acc + order.totalAmount,
      0
    );

    // 🛒 Total Products
    const totalProducts = await Product.countDocuments({
      user: req.user._id,
    });

    // 🔥 PRODUCT SALES ANALYSIS
    const productSales = {};

    orders.forEach((order) => {
      order.products.forEach((item) => {
        const productId = item.product.toString();

        if (!productSales[productId]) {
          productSales[productId] = 0;
        }

        productSales[productId] += item.quantity;
      });
    });

    // Convert to array
    const salesArray = Object.entries(productSales).map(
      ([productId, quantity]) => ({
        productId,
        quantity,
      })
    );

    // Sort descending → Top selling
    const topSelling = [...salesArray]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 3);

    // Sort ascending → Least selling
    const leastSelling = [...salesArray]
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, 3);

    // Optional: populate product details
    const topProducts = await Promise.all(
      topSelling.map(async (item) => {
        const product = await Product.findById(item.productId);
        return {
          name: product.name,
          quantity: item.quantity,
        };
      })
    );

    const leastProducts = await Promise.all(
      leastSelling.map(async (item) => {
        const product = await Product.findById(item.productId);
        return {
          name: product.name,
          quantity: item.quantity,
        };
      })
    );

    res.json({
      totalSales,
      totalOrders,
      totalProducts,
      topSellingProducts: topProducts,
      leastSellingProducts: leastProducts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};