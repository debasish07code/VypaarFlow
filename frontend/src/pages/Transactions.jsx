import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Layout from "../components/Layout";
import Toast from "../components/Toast";

const empty = { amount: "", type: "expense", category: "" }; // default to expense only

export default function Transactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [dashboardTotal, setDashboardTotal] = useState(0);
  const [toast, setToast] = useState(null);
  const notify = (message, type = "success") => setToast({ message, type });

  const fetchData = () => {
    Promise.all([
      API.get("/transactions"),
      API.get("/dashboard") // fetch sales data
    ])
      .then(([resTx, resDash]) => {
        setTransactions(resTx.data);
        setDashboardTotal(resDash.data.totalSales || 0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/login", { replace: true }); return; }
    fetchData();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post("/transactions", form);
      setShowModal(false);
      setForm(empty);
      notify("Transaction added");
      fetchData();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to add transaction", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await API.delete(`/transactions/${id}`);
      setTransactions((prev) => prev.filter((t) => t._id !== id));
      notify("Transaction deleted");
    } catch (err) {
      notify(err.response?.data?.message || "Failed to delete", "error");
    }
  };

  const expensesOnly = transactions.filter((t) => t.type === "expense");
  const totalIncome = dashboardTotal; // automatically sourced from verified sales
  const totalExpense = expensesOnly.reduce((s, t) => s + t.amount, 0);

  return (
    <Layout title="Transactions" subtitle="Track your income and expenses">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Income", value: `₹${totalIncome.toLocaleString()}`, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Total Expense", value: `₹${totalExpense.toLocaleString()}`, color: "text-rose-400", bg: "bg-rose-500/10" },
          { label: "Balance", value: `₹${(totalIncome - totalExpense).toLocaleString()}`, color: totalIncome - totalExpense >= 0 ? "text-blue-400" : "text-rose-400", bg: "bg-blue-500/10" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} border border-slate-800 rounded-2xl p-5`}>
            <p className="text-slate-500 text-sm mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-2 text-slate-500 dark:text-slate-400 font-medium text-sm items-center">
          Overview of Sales vs Expenses
        </div>
        <button onClick={() => { setForm(empty); setShowModal(true); }}
          className="sm:ml-auto flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-sm font-medium transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Expense
        </button>
      </div>

      {/* List */}
      <div className="bg-white/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden backdrop-blur-xl">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <svg className="animate-spin w-6 h-6 text-slate-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : expensesOnly.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500 dark:text-slate-600">
            <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <p className="text-sm">No expenses logged yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {expensesOnly.map((t) => (
              <div key={t._id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-rose-500/20">
                    <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-slate-900 dark:text-white text-sm font-medium">{t.category}</p>
                    <p className="text-slate-500 text-xs">{new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-base font-semibold text-rose-400">
                    -₹{Number(t.amount).toLocaleString()}
                  </span>
                  <button onClick={() => handleDelete(t._id)}
                    className="p-2 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Add Expense</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-400 mb-1.5">Category</label>
                <input type="text" placeholder="e.g. Sales, Rent, Salary" required
                  value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-400 mb-1.5">Amount (₹)</label>
                <input type="number" placeholder="0" required min="1"
                  value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 text-sm"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 text-sm font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-sm font-medium transition-colors disabled:opacity-50">
                  {saving ? "Saving..." : "Add"}
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
