import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import Layout from "../components/Layout";

const STATS_CONFIG = [
  { label: "Total Sales",   key: "totalSales",    prefix: "₹", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", from: "#059669", to: "#047857" },
  { label: "Total Orders",  key: "totalOrders",   prefix: "",  icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", from: "#2563eb", to: "#1d4ed8" },
  { label: "Products",      key: "totalProducts", prefix: "",  icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", from: "#7c3aed", to: "#6d28d9" },
  { label: "Balance",       key: "balance",       prefix: "₹", icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3", from: "#d97706", to: "#b45309" },
];

const Card = ({ children, className = "" }) => (
  <div className={`relative rounded-2xl overflow-hidden ${className}`}
    style={{ background: "rgba(255,255,255,0.75)", border: "1px solid rgba(0,0,0,0.06)" }}>
    <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
      style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.04) 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
    <div className="relative z-10">{children}</div>
  </div>
);

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

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/login", { replace: true }); return; }
    API.get("/dashboard")
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [navigate]);

  const stats = STATS_CONFIG.map((s) => ({
    ...s,
    value: data ? `${s.prefix}${Number(data[s.key]).toLocaleString()}` : `${s.prefix}0`,
  }));

  return (
    <Layout title="Dashboard" subtitle={`Welcome back, ${userName}!`}>
      {loading ? <Spinner /> : (
        <div className="space-y-5">

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                <p className="text-xs font-medium mb-1" style={{ color: "rgba(71,85,105,0.6)" }}>{s.label}</p>
                <p className="text-2xl font-bold text-gray-900 tracking-tight">{s.value}</p>
              </Card>
            ))}
          </div>

          {/* Low Stock Alert */}
          {data?.lowStockProducts?.length > 0 && (
            <div className="rounded-2xl p-4" style={{ background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.2)" }}>
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

          {/* Middle row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "Top Selling", items: data?.topSellingProducts, color: "#059669", emptyText: "No sales data yet" },
              { title: "Least Selling", items: data?.leastSellingProducts, color: "#dc2626", emptyText: "No sales data yet" },
            ].map(({ title, items, color, emptyText }) => (
              <Card key={title} className="p-6">
                <p className="text-sm font-semibold text-gray-900 mb-4">{title}</p>
                {items?.length > 0 ? (
                  <div className="space-y-3">
                    {items.map((p, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                            style={{ background: `${color}20`, color }}>
                            {i + 1}
                          </span>
                          <span className="text-gray-600 text-sm truncate">{p.name}</span>
                        </div>
                        <span className="text-xs font-semibold shrink-0 ml-2" style={{ color }}>{p.quantity} sold</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-center py-6" style={{ color: "rgba(107,114,128,0.3)" }}>{emptyText}</p>}
              </Card>
            ))}
          </div>

          {/* Recent Orders */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-semibold text-gray-900">Recent Orders</p>
              <Link to="/orders" className="text-xs transition-colors hover:text-gray-900" style={{ color: "rgba(107,114,128,0.5)" }}>View all →</Link>
            </div>
            {data?.recentOrders?.length > 0 ? (
              <div className="space-y-1">
                {data.recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between py-3 rounded-xl px-3 transition-colors hover:bg-gray-50"
                    style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "rgba(107,114,128,0.1)" }}>
                        <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-900 text-xs font-semibold">#{order._id.slice(-6).toUpperCase()}</p>
                        <p className="text-xs mt-0.5" style={{ color: "rgba(107,114,128,0.6)" }}>
                          {order.products.length} item{order.products.length !== 1 ? "s" : ""} · {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded-md text-xs font-medium"
                        style={order.status === "completed"
                          ? { background: "rgba(5,150,105,0.15)", color: "#059669" }
                          : { background: "rgba(217,119,6,0.15)", color: "#d97706" }}>
                        {order.status}
                      </span>
                      <span className="text-gray-900 text-xs font-bold">₹{Number(order.totalAmount).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-center py-8" style={{ color: "rgba(107,114,128,0.3)" }}>
                No orders yet.{" "}
                <Link to="/orders" className="hover:text-gray-900 transition-colors" style={{ color: "rgba(107,114,128,0.5)" }}>Create one →</Link>
              </p>
            )}
          </Card>

        </div>
      )}
    </Layout>
  );
}
