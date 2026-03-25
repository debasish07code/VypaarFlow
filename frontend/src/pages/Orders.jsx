import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Layout from "../components/Layout";
import Toast from "../components/Toast";

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [orderItems, setOrderItems] = useState([{ product: "", quantity: 1 }]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(null);

  const notify = (message, type = "success") => setToast({ message, type });

  const fetchOrders = () =>
    API.get("/orders").then((res) => setOrders(res.data)).finally(() => setLoading(false));

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/login", { replace: true }); return; }
    Promise.all([API.get("/orders"), API.get("/products")])
      .then(([ordersRes, productsRes]) => {
        setOrders(ordersRes.data);
        setProducts(productsRes.data);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const addItem = () => setOrderItems([...orderItems, { product: "", quantity: 1 }]);
  const removeItem = (i) => setOrderItems(orderItems.filter((_, idx) => idx !== i));
  const updateItem = (i, field, value) => {
    const updated = [...orderItems];
    updated[i] = { ...updated[i], [field]: value };
    setOrderItems(updated);
  };

  const getProduct = (id) => products.find((p) => p._id === id);

  const estimatedTotal = orderItems.reduce((sum, item) => {
    const p = getProduct(item.product);
    return sum + (p ? p.price * (parseInt(item.quantity) || 0) : 0);
  }, 0);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (orderItems.some((i) => !i.product)) return notify("Please select a product for each item", "error");
    setSaving(true);
    try {
      await API.post("/orders", { products: orderItems.map((i) => ({ product: i.product, quantity: parseInt(i.quantity) })) });
      setShowModal(false);
      setOrderItems([{ product: "", quantity: 1 }]);
      notify("Order created successfully");
      fetchOrders();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to create order", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusToggle = async (order) => {
    const newStatus = order.status === "pending" ? "completed" : "pending";
    setStatusUpdating(order._id);
    try {
      const res = await API.put(`/orders/${order._id}/status`, { status: newStatus });
      setOrders((prev) => prev.map((o) => (o._id === order._id ? { ...o, status: res.data.status } : o)));
      notify(`Order marked as ${newStatus}`);
    } catch (err) {
      notify(err.response?.data?.message || "Failed to update status", "error");
    } finally {
      setStatusUpdating(null);
    }
  };

  return (
    <Layout title="Orders" subtitle="Manage and track your orders">
      {/* Toolbar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3 text-sm" style={{ color: "rgba(120,113,108,0.7)" }}>
          <span>{orders.length} total</span>
          <span>·</span>
          <span style={{ color: "#d97706" }}>{orders.filter((o) => o.status === "pending").length} pending</span>
          <span>·</span>
          <span style={{ color: "#059669" }}>{orders.filter((o) => o.status === "completed").length} completed</span>
        </div>
        <button onClick={() => { setOrderItems([{ product: "", quantity: 1 }]); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 text-white rounded-xl text-sm font-medium transition-colors"
          style={{ background: "linear-gradient(135deg,#78716c,#6b7280)" }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Order
        </button>
      </div>

      {/* Orders list */}
      <div className="border rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.7)", borderColor: "rgba(0,0,0,0.08)" }}>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <svg className="animate-spin w-6 h-6 text-slate-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16" style={{ color: "rgba(120,113,108,0.6)" }}>
            <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p className="text-sm">No orders yet. Create your first order!</p>
          </div>
        ) : (
          <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
            {orders.map((order) => (
              <div key={order._id} className="p-6 transition-colors" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)", background: "hover:rgba(0,0,0,0.02)" }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "#78716c" }}>#{order._id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(120,113,108,0.6)" }}>
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleStatusToggle(order)}
                      disabled={statusUpdating === order._id}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${statusUpdating === order._id ? "opacity-50 cursor-not-allowed" : ""}`}
                      style={order.status === "completed"
                        ? { background: "rgba(5,150,105,0.15)", color: "#059669" }
                        : { background: "rgba(217,119,6,0.15)", color: "#d97706" }}>
                      {statusUpdating === order._id ? "..." : order.status}
                    </button>
                    <span className="font-bold" style={{ color: "#78716c" }}>₹{Number(order.totalAmount).toLocaleString()}</span>
                  </div>
                </div>
                <div className="space-y-1.5 mt-3">
                  {order.products.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs rounded-lg px-3 py-2" style={{ color: "rgba(120,113,108,0.7)", background: "rgba(0,0,0,0.04)" }}>
                      <span>{item.product?.name || "Product"} × {item.quantity}</span>
                      <span>₹{Number(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="border rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" style={{ background: "rgba(254,253,251,0.95)", borderColor: "rgba(0,0,0,0.08)" }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={{ color: "#78716c" }}>Create New Order</h3>
              <button onClick={() => setShowModal(false)} className="transition-colors" style={{ color: "rgba(120,113,108,0.6)" }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {products.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "rgba(120,113,108,0.6)" }}>No products in inventory. Add products first.</p>
            ) : (
              <form onSubmit={handleCreateOrder} className="space-y-4">
                <div className="space-y-3">
                  {orderItems.map((item, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <div className="flex-1">
                        <select
                          required value={item.product}
                          onChange={(e) => updateItem(i, "product", e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                          style={{ background: "rgba(0,0,0,0.04)", borderColor: "rgba(0,0,0,0.1)", color: "#78716c", border: "1px solid rgba(0,0,0,0.1)" }}>
                          <option value="">Select product</option>
                          {products.map((p) => (
                            <option key={p._id} value={p._id} disabled={p.quantity === 0}>
                              {p.name} — ₹{p.price} ({p.quantity} in stock)
                            </option>
                          ))}
                        </select>
                      </div>
                      <input
                        type="number" min="1"
                        max={getProduct(item.product)?.quantity || 9999}
                        value={item.quantity}
                        onChange={(e) => updateItem(i, "quantity", e.target.value)}
                        className="w-20 px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                        style={{ background: "rgba(0,0,0,0.04)", borderColor: "rgba(0,0,0,0.1)", color: "#78716c", border: "1px solid rgba(0,0,0,0.1)" }}
                      />
                      {orderItems.length > 1 && (
                        <button type="button" onClick={() => removeItem(i)}
                          className="p-2.5 rounded-xl transition-colors"
                          style={{ color: "rgba(120,113,108,0.6)" }}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button type="button" onClick={addItem}
                  className="flex items-center gap-2 text-sm transition-colors"
                  style={{ color: "rgba(120,113,108,0.6)" }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add another item
                </button>

                {estimatedTotal > 0 && (
                  <div className="flex items-center justify-between py-3 px-4 rounded-xl" style={{ background: "rgba(0,0,0,0.05)" }}>
                    <span className="text-sm" style={{ color: "rgba(120,113,108,0.7)" }}>Estimated Total</span>
                    <span className="font-bold" style={{ color: "#78716c" }}>₹{estimatedTotal.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors"
                    style={{ border: "1px solid rgba(0,0,0,0.1)", color: "#78716c" }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 py-3 rounded-xl text-white text-sm font-medium transition-colors disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg,#78716c,#6b7280)" }}>
                    {saving ? "Creating..." : "Create Order"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Layout>
  );
}
