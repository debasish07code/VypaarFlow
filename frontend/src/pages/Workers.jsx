import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import Layout from "../components/Layout";
import Toast from "../components/Toast";
import { useTheme } from "../hooks/useTheme";

const empty = { name: "", position: "", base_salary: "", phone: "" };

// Calculate monthly attendance stats for the current month
function calcMonthlyStats(attendance) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const monthlyRecords = attendance.filter((a) => {
    const d = new Date(a.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const presentDays = monthlyRecords.filter((a) => a.status === "present").length;
  const absentDays = monthlyRecords.filter((a) => a.status === "absent").length;
  return { presentDays, absentDays, totalDays };
}

function calcSalary(baseSalary, presentDays, totalDays) {
  if (!totalDays) return 0;
  return Math.round((presentDays / totalDays) * baseSalary);
}

export default function Workers() {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [marking, setMarking] = useState(null); // workerId being marked
  const isDark = useTheme() === 'dark';

  const notify = (msg, type = "success") => setToast({ message: msg, type });

  const fetchWorkers = () =>
    API.get("/workers").then((r) => setWorkers(r.data)).finally(() => setLoading(false));

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/login", { replace: true }); return; }
    fetchWorkers();
  }, [navigate]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post("/workers", form);
      setShowModal(false);
      setForm(empty);
      notify("Worker added successfully");
      fetchWorkers();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to add worker", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAttendance = async (workerId, status) => {
    setMarking(workerId);
    try {
      await API.post(`/workers/${workerId}/attendance`, { status });
      notify(`Marked as ${status}`);
      fetchWorkers();
    } catch (err) {
      notify("Failed to mark attendance", "error");
    } finally {
      setMarking(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this worker?")) return;
    try {
      await API.delete(`/workers/${id}`);
      setWorkers((prev) => prev.filter((w) => w._id !== id));
      notify("Worker removed");
    } catch {
      notify("Failed to remove worker", "error");
    }
  };

  return (
    <Layout title="Workers" subtitle="Manage your team and attendance">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {workers.length} worker{workers.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => { setForm(empty); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 text-white rounded-xl text-sm font-medium bg-gradient-to-br from-slate-700 to-slate-600 dark:from-slate-600 dark:to-slate-500 hover:shadow-lg transition-all"
          style={!isDark ? { background: "linear-gradient(135deg,#78716c,#6b7280)" } : undefined}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Worker
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin border-t-slate-600 dark:border-t-slate-400" />
        </div>
      ) : workers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-xl"
          style={!isDark ? { background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.06)" } : undefined}>
          <svg className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
          </svg>
          <p className="text-sm text-slate-400 dark:text-slate-500">No workers added yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {workers.map((w) => {
            const { presentDays, absentDays, totalDays } = calcMonthlyStats(w.attendance || []);
            const earnedSalary = calcSalary(w.base_salary, presentDays, totalDays);
            const today = new Date().setHours(0, 0, 0, 0);
            const todayRecord = w.attendance?.find(
              (a) => new Date(a.date).setHours(0, 0, 0, 0) === today
            );

            return (
              <div key={w._id} className="rounded-2xl p-5 flex flex-col gap-4 bg-white/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 backdrop-blur-xl transition-shadow hover:shadow-md"
                style={!isDark ? { background: "rgba(255,255,255,0.75)", border: "1px solid rgba(0,0,0,0.06)" } : undefined}>

                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 bg-slate-700 dark:bg-slate-700"
                      style={!isDark ? { background: "linear-gradient(135deg,#78716c,#6b7280)" } : undefined}>
                      {w.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{w.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{w.position}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Link to={`/workers/${w._id}`}
                      className="p-1.5 rounded-lg transition-colors text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                    <button onClick={() => handleDelete(w._id)}
                      className="p-1.5 rounded-lg transition-colors text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Monthly Stats */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Present", value: presentDays, colorClass: "text-emerald-600 dark:text-emerald-500" },
                    { label: "Absent", value: absentDays, colorClass: "text-rose-600 dark:text-rose-500" },
                    { label: "Work Days", value: totalDays, colorClass: "text-blue-600 dark:text-blue-500" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl p-2.5 text-center bg-slate-50 dark:bg-slate-800/80">
                      <p className={`text-lg font-bold ${s.colorClass}`}>{s.value}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Salary Info */}
                <div className="flex items-center justify-between rounded-xl px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20">
                  <span className="text-xs text-emerald-700 dark:text-emerald-400">
                    Earned (Base ₹{Number(w.base_salary).toLocaleString()})
                  </span>
                  <span className="font-bold text-sm text-emerald-700 dark:text-emerald-400">
                    ₹{earnedSalary.toLocaleString()}
                  </span>
                </div>

                {/* Today's Attendance */}
                <div>
                  <p className="text-xs mb-2 text-slate-500 dark:text-slate-400">Mark Today</p>
                  {todayRecord ? (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                      todayRecord.status === "present"
                        ? "bg-emerald-100/50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "bg-rose-100/50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                    }`}>
                      ✓ Marked {todayRecord.status}
                    </span>
                  ) : (
                    <div className="flex gap-2">
                      {["present", "absent"].map((s) => (
                        <button key={s} onClick={() => handleMarkAttendance(w._id, s)}
                          disabled={marking === w._id}
                          className={`flex-1 py-2 rounded-xl text-xs font-medium capitalize transition-all disabled:opacity-50 border ${
                            s === "present"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
                              : "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400 dark:hover:bg-rose-500/20"
                          }`}>
                          {marking === w._id ? "..." : s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Worker Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-xl"
            style={!isDark ? { background: "rgba(254,253,251,0.97)", border: "1px solid rgba(0,0,0,0.08)" } : undefined}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-base text-slate-800 dark:text-white">Add Worker</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              {[
                { label: "Full Name", key: "name", type: "text", placeholder: "e.g. Rahul Sharma" },
                { label: "Position", key: "position", type: "text", placeholder: "e.g. Store Manager" },
                { label: "Phone (optional)", key: "phone", type: "tel", placeholder: "10-digit number" },
                { label: "Base Salary (₹)", key: "base_salary", type: "number", placeholder: "e.g. 15000" },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs mb-1.5 font-medium text-slate-600 dark:text-slate-400">{label}</label>
                  <input type={type} placeholder={placeholder}
                    required={key !== "phone"}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 rounded-xl text-white text-sm font-medium disabled:opacity-50 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors">
                  {saving ? "Adding..." : "Add Worker"}
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
