import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Layout from "../components/Layout";
import Toast from "../components/Toast";

const empty = { name: "", price: "", quantity: "", category: "" };

export default function Inventory() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const notify = (message, type = "success") => setToast({ message, type });

  const fetchProducts = () => {
    API.get("/products")
      .then((res) => setProducts(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/login", { replace: true }); return; }
    fetchProducts();
  }, [navigate]);

  const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (p) => { setForm({ name: p.name, price: p.price, quantity: p.quantity, category: p.category }); setEditId(p._id); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await API.put(`/products/${editId}`, form);
      } else {
        await API.post("/products", form);
      }
      setShowModal(false);
      notify(editId ? "Product updated" : "Product added");
      fetchProducts();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to save product", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await API.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      notify("Product deleted");
    } catch (err) {
      notify(err.response?.data?.message || "Failed to delete", "error");
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="Inventory" subtitle="Manage your products and stock">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "rgba(120,113,108,0.6)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text" placeholder="Search products..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
            style={{ background: "rgba(0,0,0,0.04)", borderColor: "rgba(0,0,0,0.1)", color: "#78716c", border: "1px solid rgba(0,0,0,0.1)", placeholder: "rgba(120,113,108,0.5)" }}
          />
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 text-white rounded-xl text-sm font-medium transition-colors shrink-0"
          style={{ background: "linear-gradient(135deg,#78716c,#6b7280)" }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Table */}
      <div className="border rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.7)", borderColor: "rgba(0,0,0,0.08)" }}>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <svg className="animate-spin w-6 h-6 text-slate-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16" style={{ color: "rgba(120,113,108,0.6)" }}>
            <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-sm">{search ? "No products match your search" : "No products yet. Add your first product!"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                  <th className="text-left px-6 py-4 font-medium" style={{ color: "rgba(120,113,108,0.6)" }}>Name</th>
                  <th className="text-left px-6 py-4 font-medium" style={{ color: "rgba(120,113,108,0.6)" }}>Category</th>
                  <th className="text-left px-6 py-4 font-medium" style={{ color: "rgba(120,113,108,0.6)" }}>Price</th>
                  <th className="text-left px-6 py-4 font-medium" style={{ color: "rgba(120,113,108,0.6)" }}>Stock</th>
                  <th className="text-right px-6 py-4 font-medium" style={{ color: "rgba(120,113,108,0.6)" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p._id} className="transition-colors" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                    <td className="px-6 py-4 font-medium" style={{ color: "#78716c" }}>{p.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs" style={{ background: "rgba(0,0,0,0.08)", color: "rgba(120,113,108,0.7)" }}>{p.category}</span>
                    </td>
                    <td className="px-6 py-4" style={{ color: "rgba(120,113,108,0.7)" }}>₹{Number(p.price).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-medium"
                        style={p.quantity <= 5 
                          ? { background: "rgba(220,38,38,0.15)", color: "#dc2626" }
                          : p.quantity <= 20 
                          ? { background: "rgba(217,119,6,0.15)", color: "#d97706" }
                          : { background: "rgba(5,150,105,0.15)", color: "#059669" }}>
                        {p.quantity} units
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(p)}
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: "rgba(120,113,108,0.6)" }}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(p._id)}
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: "rgba(120,113,108,0.6)" }}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="border rounded-2xl w-full max-w-md p-6" style={{ background: "rgba(254,253,251,0.95)", borderColor: "rgba(0,0,0,0.08)" }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={{ color: "#78716c" }}>{editId ? "Edit Product" : "Add Product"}</h3>
              <button onClick={() => setShowModal(false)} className="transition-colors" style={{ color: "rgba(120,113,108,0.6)" }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: "Product Name", key: "name", type: "text", placeholder: "e.g. Rice 5kg" },
                { label: "Category", key: "category", type: "text", placeholder: "e.g. Groceries" },
                { label: "Price (₹)", key: "price", type: "number", placeholder: "0" },
                { label: "Quantity", key: "quantity", type: "number", placeholder: "0" },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm mb-1.5" style={{ color: "rgba(120,113,108,0.7)" }}>{label}</label>
                  <input type={type} placeholder={placeholder} required
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                    style={{ background: "rgba(0,0,0,0.04)", borderColor: "rgba(0,0,0,0.1)", color: "#78716c", border: "1px solid rgba(0,0,0,0.1)" }}
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors"
                  style={{ border: "1px solid rgba(0,0,0,0.1)", color: "#78716c" }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 rounded-xl text-white text-sm font-medium transition-colors disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#78716c,#6b7280)" }}>
                  {saving ? "Saving..." : editId ? "Update" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Layout>
  );
}
