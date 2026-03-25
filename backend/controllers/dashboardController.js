import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import Transaction from "../models/Transaction.js";

export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;

    const [totalOrders, orders, totalProducts, transactions, lowStockProducts, recentOrders] = await Promise.all([
      Order.countDocuments({ user: userId }),
      Order.find({ user: userId }).lean(),
      Product.countDocuments({ user: userId }),
      Transaction.find({ userId }).lean(),
      Product.find({ user: userId, quantity: { $lte: 10 } }).select("name quantity category").limit(5).lean(),
      Order.find({ user: userId }).populate("products.product", "name").sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    const totalSales = orders.reduce((acc, o) => acc + o.totalAmount, 0);
    const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

    // Aggregate product sales from all orders
    const productSales = {};
    orders.forEach((order) => {
      order.products.forEach((item) => {
        if (!item.product) return;
        const id = item.product.toString();
        productSales[id] = (productSales[id] || 0) + item.quantity;
      });
    });

    const salesArray = Object.entries(productSales).map(([productId, quantity]) => ({ productId, quantity }));

    // Single DB call to get all product names at once (fixes N+1)
    const allProductIds = salesArray.map((s) => s.productId);
    const productDocs = allProductIds.length
      ? await Product.find({ _id: { $in: allProductIds } }).select("name").lean()
      : [];
    const productMap = Object.fromEntries(productDocs.map((p) => [p._id.toString(), p.name]));

    const toNamedList = (arr) =>
      arr
        .filter((item) => productMap[item.productId])
        .map((item) => ({ name: productMap[item.productId], quantity: item.quantity }));

    const topSellingProducts = toNamedList([...salesArray].sort((a, b) => b.quantity - a.quantity).slice(0, 3));
    const leastSellingProducts = toNamedList([...salesArray].sort((a, b) => a.quantity - b.quantity).slice(0, 3));

    res.json({
      totalSales,
      totalOrders,
      totalProducts,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      topSellingProducts,
      leastSellingProducts,
      lowStockProducts,
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
