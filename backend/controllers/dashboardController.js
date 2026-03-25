import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import Transaction from "../models/Transaction.js";

export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;

    const [totalOrders, orders, totalProducts, transactions, lowStockProducts, recentOrders, userRanks] = await Promise.all([
      Order.countDocuments({ user: userId }),
      Order.find({ user: userId }).lean(),
      Product.countDocuments({ user: userId }),
      Transaction.find({ userId }).lean(),
      Product.find({ user: userId, quantity: { $lte: 10 } }).select("name quantity category").limit(5).lean(),
      Order.find({ user: userId }).populate("products.product", "name").sort({ createdAt: -1 }).limit(5).lean(),
      Order.aggregate([
        { $group: { _id: "$user", totalSales: { $sum: "$totalAmount" } } },
        { $sort: { totalSales: -1 } }
      ])
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

    const topSellingProducts = toNamedList([...salesArray].sort((a, b) => b.quantity - a.quantity).slice(0, 5));
    const leastSellingProducts = toNamedList([...salesArray].sort((a, b) => a.quantity - b.quantity).slice(0, 3));

    // Pie Chart Data
    const pieChartData = topSellingProducts.map(p => ({ name: p.name, value: p.quantity }));

    // Calculate Global Rank
    let globalRank = userRanks.findIndex(r => r._id && r._id.toString() === userId.toString()) + 1;
    if (globalRank === 0) globalRank = userRanks.length + 1;
    const totalPlatformUsers = Math.max(userRanks.length, 1);

    // Bar Chart Data (Quarterly Profit/Loss)
    const quarterlyData = {};
    transactions.forEach(t => {
      const date = new Date(t.date);
      const year = date.getFullYear();
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      const key = `${year}-Q${quarter}`;
      
      if (!quarterlyData[key]) quarterlyData[key] = { name: key, profit: 0, loss: 0 };
      if (t.type === "income") quarterlyData[key].profit += t.amount;
      else quarterlyData[key].loss += t.amount;
    });
    
    const barChartData = Object.values(quarterlyData).sort((a, b) => {
      const [yearA, qA] = a.name.split('-Q');
      const [yearB, qB] = b.name.split('-Q');
      if (yearA !== yearB) return yearA - yearB;
      return qA - qB;
    });

    // Line Chart Data (Daily Orders for last 30 days)
    const dailyOrdersData = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    orders.forEach(o => {
      const date = new Date(o.createdAt);
      if (date >= thirtyDaysAgo) {
        const dayKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dailyOrdersData[dayKey] = (dailyOrdersData[dayKey] || 0) + 1;
      }
    });

    const lineChartData = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayKey = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      lineChartData.push({ date: dayKey, orders: dailyOrdersData[dayKey] || 0 });
    }

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
      pieChartData,
      barChartData,
      lineChartData,
      globalRank,
      totalPlatformUsers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
