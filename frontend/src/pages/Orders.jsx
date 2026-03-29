import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Layout from "../components/Layout";
import Toast from "../components/Toast";
import { useTheme } from "../hooks/useTheme";

// Two status stages only
const STATUS_COLORS = {
  pending: { bg: "rgba(217,119,6,0.15)", color: "#d97706" },
  approved: { bg: "rgba(5,150,105,0.15)", color: "#059669" },
};

function OrderTimeline({ history = [] }) {
  return (
    <div className="mt-3 pl-2 border-l-2 border-slate-200 dark:border-slate-700">
      {history.map((h, i) => (
        <div key={i} className="relative pl-4 pb-2 last:pb-0">
          <div className="absolute -left-[9px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900"
            style={{ background: STATUS_COLORS[h.status]?.color || "#94a3b8" }} />
          <p className="text-xs font-medium capitalize text-slate-800 dark:text-slate-200">{h.status}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {new Date(h.timestamp).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            {h.note ? ` — ${h.note}` : ""}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [orderItems, setOrderItems] = useState([{ product: "", quantity: 1 }]);
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [generatingInvoice, setGeneratingInvoice] = useState(null);
  const [invoicePreview, setInvoicePreview] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [whatsappLink, setWhatsappLink] = useState(null);
  const [pdfLink, setPdfLink] = useState(null);
  const isDark = useTheme() === 'dark';

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
      await API.post("/orders", {
        products: orderItems.map((i) => ({ product: i.product, quantity: parseInt(i.quantity) })),
        customerName,
        customerMobile,
      });
      setShowModal(false);
      setOrderItems([{ product: "", quantity: 1 }]);
      setCustomerName("");
      setCustomerMobile("");
      notify("Order created successfully");
      fetchOrders();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to create order", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (order, newStatus) => {
    setStatusUpdating(order._id);
    try {
      const res = await API.put(`/orders/${order._id}/status`, { status: newStatus });
      setOrders((prev) => prev.map((o) => (o._id === order._id ? res.data : o)));
      notify(`Order marked as ${newStatus}`);
    } catch (err) {
      notify(err.response?.data?.message || "Failed to update status", "error");
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleGenerateInvoice = async (orderId) => {
    setGeneratingInvoice(orderId);
    setWhatsappLink(null);
    setPdfLink(null);
    try {
      const res = await API.post("/invoice/generate", { orderId });
      setInvoicePreview(res.data.invoice);
      setWhatsappLink(res.data.whatsappLink);

      // Compute full URL for PDF file
      const baseUrl = API.defaults.baseURL.replace("/api", "");
      if (res.data.pdfUrl) {
        setPdfLink(`${baseUrl}${res.data.pdfUrl}`);
      }

      notify("Invoice generated ✓");
    } catch (err) {
      notify(err.response?.data?.message || "Failed to generate invoice", "error");
    } finally {
      setGeneratingInvoice(null);
    }
  };

  const filteredOrders = statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter);

  return (
    <Layout title="Orders" subtitle="Manage and track your orders">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between mb-6">
        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "approved"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                statusFilter === s 
                ? "bg-slate-700 text-white dark:bg-slate-600" 
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
              style={!isDark ? (statusFilter === s ? { background: "linear-gradient(135deg,#78716c,#6b7280)", color: "white" } : { color: "#78716c" }) : undefined}>
              {s}
            </button>
          ))}
        </div>
        <button onClick={() => { setOrderItems([{ product: "", quantity: 1 }]); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 text-white rounded-xl text-sm font-medium shrink-0 bg-gradient-to-br from-slate-700 to-slate-600 dark:from-slate-600 dark:to-slate-500 hover:shadow-lg transition-all"
          style={!isDark ? { background: "linear-gradient(135deg,#78716c,#6b7280)" } : undefined}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Order
        </button>
      </div>

      {/* Orders list */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl"
        style={!isDark ? { background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.06)" } : undefined}>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin border-t-slate-600 dark:border-t-slate-400" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500 dark:text-slate-400">
            <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p className="text-sm">No orders yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredOrders.map((order) => {
              const isExpanded = expandedOrder === order._id;
              const statusStyle = STATUS_COLORS[order.status] || STATUS_COLORS.pending;

              return (
                <div key={order._id} className="p-5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                          #{order._id.slice(-6).toUpperCase()}
                        </p>
                        <span className="px-2 py-0.5 rounded-md text-xs font-medium capitalize"
                          style={{ background: statusStyle.bg, color: statusStyle.color }}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs mt-0.5 text-slate-500 dark:text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      {/* Customer info */}
                      {order.customer?.name && (
                        <p className="text-xs mt-1 flex items-center gap-1 text-slate-600 dark:text-slate-400">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {order.customer.name}
                          {order.customer.mobile ? ` · ${order.customer.mobile}` : ""}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                        ₹{Number(order.totalAmount).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Toggle pending ↔ approved */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      onClick={() => handleStatusUpdate(order, order.status === "pending" ? "approved" : "pending")}
                      disabled={statusUpdating === order._id}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      style={!isDark ? { background: "rgba(0,0,0,0.04)", color: "#78716c", border: "1px solid rgba(0,0,0,0.1)" } : undefined}>
                      {statusUpdating === order._id
                        ? "Updating..."
                        : order.status === "pending" ? "✓ Mark as Approved" : "↩ Mark as Pending"}
                    </button>
                    {order.status === "approved" && (
                      <button
                        onClick={() => handleGenerateInvoice(order._id)}
                        disabled={generatingInvoice === order._id}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                        style={!isDark ? { background: "rgba(5,150,105,0.1)", color: "#059669", border: "1px solid rgba(5,150,105,0.25)" } : { background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
                        {generatingInvoice === order._id ? "Sending..." : "📄 Generate & Send Invoice"}
                      </button>
                    )}
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="mt-3">
                      <div className="space-y-1.5">
                        {order.products.map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-xs rounded-lg px-3 py-2 bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400">
                            <span>{item.product?.name || "Product"} × {item.quantity}</span>
                            <span>₹{Number(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                      {/* Timeline */}
                      {order.statusHistory?.length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs font-medium mb-2 text-slate-500 dark:text-slate-500">ORDER TIMELINE</p>
                          <OrderTimeline history={order.statusHistory} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto shadow-xl"
            style={!isDark ? { background: "rgba(254,253,251,0.97)", border: "1px solid rgba(0,0,0,0.08)" } : undefined}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-slate-800 dark:text-white">Create New Order</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {products.length === 0 ? (
              <p className="text-sm text-center py-8 text-slate-500 dark:text-slate-400">No products in inventory.</p>
            ) : (
              <form onSubmit={handleCreateOrder} className="space-y-4">
                {/* Customer Info */}
                <div className="p-4 rounded-xl space-y-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Customer Details</p>
                  <div>
                    <label className="block text-xs mb-1.5 text-slate-500 dark:text-slate-400">Customer Name</label>
                    <input type="text" placeholder="e.g. Rahul Kumar"
                      value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 placeholder-slate-400 dark:placeholder-slate-500" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1.5 text-slate-500 dark:text-slate-400">Mobile Number</label>
                    <input type="tel" placeholder="10-digit number"
                      value={customerMobile} onChange={(e) => setCustomerMobile(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 placeholder-slate-400 dark:placeholder-slate-500" />
                  </div>
                </div>

                {/* Products */}
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Products</p>
                <div className="space-y-2.5">
                  {orderItems.map((item, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <div className="flex-1">
                        <select required value={item.product}
                          onChange={(e) => updateItem(i, "product", e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          <option value="">Select product</option>
                          {products.map((p) => (
                            <option key={p._id} value={p._id} disabled={p.quantity === 0}>
                              {p.name} — ₹{p.price} ({p.quantity} in stock)
                            </option>
                          ))}
                        </select>
                      </div>
                      <input type="number" min="1" max={getProduct(item.product)?.quantity || 9999}
                        value={item.quantity} onChange={(e) => updateItem(i, "quantity", e.target.value)}
                        className="w-20 px-3 py-2.5 rounded-xl text-sm focus:outline-none bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700" />
                      {orderItems.length > 1 && (
                        <button type="button" onClick={() => removeItem(i)}
                          className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button type="button" onClick={addItem} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add another item
                </button>

                {estimatedTotal > 0 && (
                  <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Estimated Total</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">₹{estimatedTotal.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-3 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 py-3 rounded-xl text-white text-sm font-medium disabled:opacity-50 bg-gradient-to-r from-slate-700 to-slate-600 dark:from-slate-600 dark:to-slate-500 transition-all hover:shadow-lg"
                    style={!isDark ? { background: "linear-gradient(135deg,#78716c,#6b7280)" } : undefined}>
                    {saving ? "Creating..." : "Create Order"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Invoice Preview Modal */}
      {invoicePreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-xl"
            style={!isDark ? { background: "rgba(255,255,255,0.95)", border: "1px solid rgba(0,0,0,0.08)" } : undefined}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-slate-800 dark:text-white">🧾 Invoice Preview</h3>
              <button onClick={() => setInvoicePreview(null)} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-1 text-xs mb-4 text-slate-600 dark:text-slate-400">
              <p><span className="font-semibold text-slate-700 dark:text-slate-300">Invoice #:</span> {invoicePreview.invoiceNumber}</p>
              <p><span className="font-semibold text-slate-700 dark:text-slate-300">Customer:</span> {invoicePreview.customer?.name}</p>
              <p><span className="font-semibold text-slate-700 dark:text-slate-300">Mobile:</span> {invoicePreview.customer?.mobile || "N/A"}</p>
              <p><span className="font-semibold text-slate-700 dark:text-slate-300">Date:</span> {new Date(invoicePreview.createdAt).toLocaleDateString("en-IN")}</p>
            </div>
            <table className="w-full text-xs mb-4">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-2 text-slate-500 dark:text-slate-400">Item</th>
                  <th className="text-right py-2 text-slate-500 dark:text-slate-400">Qty</th>
                  <th className="text-right py-2 text-slate-500 dark:text-slate-400">Price</th>
                  <th className="text-right py-2 text-slate-500 dark:text-slate-400">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoicePreview.items?.map((item, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-1.5 text-slate-800 dark:text-slate-300">{item.name}</td>
                    <td className="text-right py-1.5 text-slate-600 dark:text-slate-400">{item.quantity}</td>
                    <td className="text-right py-1.5 text-slate-600 dark:text-slate-400">₹{item.price}</td>
                    <td className="text-right py-1.5 font-semibold text-slate-800 dark:text-slate-200">₹{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between font-bold text-sm border-t border-slate-200 dark:border-slate-700 pt-3 text-slate-800 dark:text-white">
              <span>Total</span>
              <span>₹{Number(invoicePreview.totalAmount).toLocaleString()}</span>
            </div>

            <div className="mt-5 space-y-2.5">
              {whatsappLink && (
                <a href={whatsappLink} target="_blank" rel="noreferrer"
                  className="flex items-center justify-center w-full py-2.5 rounded-xl text-white text-sm font-medium transition-transform hover:scale-[1.02] bg-[#25D366] shadow-[0_4px_14px_0_rgba(37,211,102,0.39)]">
                  💬 Send via WhatsApp
                </a>
              )}
            </div>

            <p className="text-xs mt-4 text-center text-slate-400 dark:text-slate-500">
              {whatsappLink ? "SMS simulated (Fast2SMS balance low). Use WhatsApp above." : `SMS sent to ${invoicePreview.customer?.mobile} (simulated)`}
            </p>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Layout>
  );
}
