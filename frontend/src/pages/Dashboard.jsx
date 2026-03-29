import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import Layout from "../components/Layout";
import { useTheme } from "../hooks/useTheme";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Legend } from "recharts";

const STATS_CONFIG = [
  { label: "Total Sales", key: "totalSales", prefix: "₹", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", from: "#059669", to: "#047857" },
  { label: "Total Orders", key: "totalOrders", prefix: "", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", from: "#2563eb", to: "#1d4ed8" },
  { label: "Products", key: "totalProducts", prefix: "", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", from: "#7c3aed", to: "#6d28d9" },
  { label: "Balance", key: "balance", prefix: "₹", icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3", from: "#d97706", to: "#b45309" },
  // { label: "Global Rank", key: "globalRank", prefix: "#", icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z", from: "#ec4899", to: "#be185d" },
];

const COLORS = ['#059669', '#2563eb', '#7c3aed', '#d97706', '#ec4899'];

const Card = ({ children, className = "" }) => {
  const isDark = useTheme() === 'dark';
  return (
    <div className={`relative rounded-2xl overflow-hidden ${className} dark:bg-slate-900 border dark:border-slate-800`}
      style={!isDark ? { background: "rgba(255,255,255,0.75)", border: "1px solid rgba(0,0,0,0.06)" } : undefined}>
      <div className={`absolute inset-0 pointer-events-none ${isDark ? "opacity-10 dark:bg-[size:32px_32px]" : "opacity-[0.02]"}`}
        style={!isDark ? { backgroundImage: "linear-gradient(rgba(0,0,0,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.04) 1px,transparent 1px)", backgroundSize: "32px 32px" } : { backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};

const Spinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="relative">
      <div className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
        style={{ borderTopColor: "rgba(71,85,105,0.8)", borderRightColor: "rgba(71,85,105,0.3)" }} />
      <div className="absolute inset-2 rounded-full blur-sm opacity-40"
        style={{ background: "radial-gradient(circle,rgba(71,85,105,0.4),transparent)" }} />
    </div>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const userName = localStorage.getItem("userName") || "User";
  const isDark = useTheme() === 'dark';

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/login", { replace: true }); return; }
    API.get("/dashboard")
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error("Dashboard error:", err);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const stats = STATS_CONFIG.map((s) => ({
    ...s,
    value: s.key === "globalRank"
      ? (data ? `${s.prefix}${data.globalRank} / ${data.totalPlatformUsers}` : `${s.prefix}-`)
      : (data ? `${s.prefix}${Number(data[s.key]).toLocaleString()}` : `${s.prefix}0`),
  }));

  const pieData = data?.pieChartData || [];
  const barData = data?.barChartData || [];
  const lineData = data?.lineChartData || [];

  return (
    <Layout title="Dashboard" subtitle={`Welcome back, ${userName}!`}>
      {loading ? <Spinner /> : (
        <div className="space-y-5 pb-10">

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">

            {stats.map((s) => (
              <Card key={s.label} className="p-5 group hover:scale-[1.02] transition-transform duration-200">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ background: `linear-gradient(135deg,${s.from}08,${s.to}05)` }} />
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4 shadow-lg"
                  style={{ background: `linear-gradient(135deg,${s.from},${s.to})` }}>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon} />
                  </svg>
                </div>
                <p className="text-xs font-medium mb-1 text-slate-500 dark:text-slate-400" style={!isDark ? { color: "rgba(71,85,105,0.6)" } : undefined}>{s.label}</p>
                <p className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200">{s.value}</p>
              </Card>
            ))}
          </div>

          {/* Low Stock Alert */}
          {data?.lowStockProducts?.length > 0 && (
            <div className="rounded-2xl p-4 shadow-sm" style={{ background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.2)" }}>
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-amber-700 font-semibold text-xs tracking-wide uppercase">Low Stock Alert</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.lowStockProducts.map((p) => (
                  <Link key={p._id} to="/inventory"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-700 transition-all duration-200 hover:scale-105"
                    style={{ background: "rgba(217,119,6,0.1)", border: "1px solid rgba(217,119,6,0.2)" }}>
                    <span>{p.name}</span>
                    <span className="text-amber-800 font-bold">{p.quantity}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Charts Row 1: Daily Shoppers & Top Products Pie */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Card className="p-6 lg:col-span-2">
              <p className="text-sm font-semibold mb-6 text-slate-800 dark:text-slate-200">Daily Orders (Last 30 Days)</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#e5e7eb"} />
                    <XAxis dataKey="date"
                      tick={{ fontSize: 12, fill: isDark ? "#94a3b8" : "#6b7280" }}
                      tickLine={false}
                      axisLine={false}
                      minTickGap={20}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: isDark ? "#94a3b8" : "#6b7280" }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <RechartsTooltip
                      contentStyle={{ borderRadius: "12px", border: isDark ? "1px solid #334155" : "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", background: isDark ? "#1e293b" : "#fff", color: isDark ? "#f8fafc" : "#000" }}
                      itemStyle={{ color: isDark ? "#f8fafc" : "#000" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      name="Orders"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ r: 3, fill: "#2563eb", strokeWidth: 2, stroke: isDark ? "#1e293b" : "#fff" }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6 lg:col-span-1">
              <p className="text-sm font-semibold mb-2 text-slate-800 dark:text-slate-200">Top Selling Products</p>
              {pieData.length > 0 ? (
                <div className="h-[280px] w-full flex flex-col items-center justify-center">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{ borderRadius: "12px", border: isDark ? "1px solid #334155" : "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", background: isDark ? "#1e293b" : "#fff", color: isDark ? "#f8fafc" : "#000" }}
                        itemStyle={{ color: isDark ? "#f8fafc" : "#000" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="w-full mt-2 space-y-2">
                    {pieData.map((entry, index) => (
                      <div key={entry.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="truncate max-w-[120px] text-slate-500 dark:text-slate-400">{entry.name}</span>
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-center py-12" style={{ color: "rgba(107,114,128,0.3)" }}>No product data yet</p>
              )}
            </Card>
          </div>

          {/* Charts Row 2: Quarterly Profit/Loss & Recent Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Card className="p-6 lg:col-span-2">
              <p className="text-sm font-semibold mb-6 text-slate-800 dark:text-slate-200">Quarterly Profit & Loss</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }} barGap={6}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#e5e7eb"} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: isDark ? "#94a3b8" : "#6b7280" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: isDark ? "#94a3b8" : "#6b7280" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <RechartsTooltip
                      contentStyle={{ borderRadius: "12px", border: isDark ? "1px solid #334155" : "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", background: isDark ? "#1e293b" : "#fff", color: isDark ? "#f8fafc" : "#000" }}
                      itemStyle={{ color: isDark ? "#f8fafc" : "#000" }}
                      formatter={(value) => [`₹${value.toLocaleString()}`]}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "10px", color: isDark ? "#94a3b8" : "#475569" }} />
                    <Bar dataKey="profit" name="Income" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="loss" name="Expense" fill="#dc2626" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6 lg:col-span-1">
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Recent Orders</p>
                <Link to="/orders" className="text-xs transition-colors hover:text-slate-800 dark:hover:text-slate-200 text-slate-500 dark:text-slate-400" style={!isDark ? { color: "rgba(107,114,128,0.5)" } : undefined}>View all →</Link>
              </div>
              {data?.recentOrders?.length > 0 ? (
                <div className="space-y-1">
                  {data.recentOrders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between py-3 rounded-xl px-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-transparent dark:border-slate-800"
                      style={!isDark ? { borderBottom: "1px solid rgba(0,0,0,0.08)" } : undefined}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-slate-100 dark:bg-slate-800"
                          style={!isDark ? { background: "rgba(107,114,128,0.1)" } : undefined}>
                          <svg className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">#{order._id.slice(-6).toUpperCase()}</p>
                          <p className="text-xs mt-0.5 text-slate-500 dark:text-slate-400" style={!isDark ? { color: "rgba(107,114,128,0.6)" } : undefined}>
                            {order.products.length} item{order.products.length !== 1 ? "s" : ""} · {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded-md text-xs font-medium"
                          style={order.status === "completed"
                            ? (isDark ? { background: "rgba(16,185,129,0.1)", color: "#10b981" } : { background: "rgba(5,150,105,0.15)", color: "#059669" })
                            : (isDark ? { background: "rgba(245,158,11,0.1)", color: "#f59e0b" } : { background: "rgba(217,119,6,0.15)", color: "#d97706" })}>
                          {order.status}
                        </span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">₹{Number(order.totalAmount).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-center py-10" style={{ color: "rgba(107,114,128,0.3)" }}>
                  No orders yet.
                </p>
              )}
            </Card>
          </div>

          {/* Charts Row 3: Peak Sales Hours & Top Customers */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
            <Card className="p-6 lg:col-span-2">
              <p className="text-sm font-semibold mb-6 text-slate-800 dark:text-slate-200">Peak Sales Hours</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.peakSalesHours || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }} barGap={6}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#e5e7eb"} />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 12, fill: isDark ? "#94a3b8" : "#6b7280" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: isDark ? "#94a3b8" : "#6b7280" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <RechartsTooltip
                      contentStyle={{ borderRadius: "12px", border: isDark ? "1px solid #334155" : "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", background: isDark ? "#1e293b" : "#fff", color: isDark ? "#f8fafc" : "#000" }}
                      itemStyle={{ color: isDark ? "#f8fafc" : "#000" }}
                      cursor={{ fill: isDark ? "rgba(37, 99, 235, 0.15)" : "rgba(37, 99, 235, 0.05)" }}
                    />
                    <Bar dataKey="sales" name="Sales Vol." fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6 lg:col-span-1">
              <p className="text-sm font-semibold mb-5 text-slate-800 dark:text-slate-200">Top Customers</p>
              {data?.topCustomers?.length > 0 ? (
                <div className="space-y-1">
                  {data.topCustomers.map((c, i) => (
                    <div key={i} className="flex items-center justify-between py-3 rounded-xl px-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-transparent dark:border-slate-800"
                      style={!isDark ? { borderBottom: "1px solid rgba(0,0,0,0.08)" } : undefined}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs"
                          style={{ background: COLORS[i % COLORS.length] + (isDark ? "30" : "20"), color: COLORS[i % COLORS.length] }}>
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{c.name}</p>
                          <p className="text-xs mt-0.5 text-slate-500 dark:text-slate-400" style={!isDark ? { color: "rgba(107,114,128,0.6)" } : undefined}>
                            Rank #{i + 1}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">₹{Number(c.spent).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-center py-10" style={{ color: "rgba(107,114,128,0.3)" }}>
                  No customer data yet.
                </p>
              )}
            </Card>
          </div>

        </div>
      )}
    </Layout>
  );
}
