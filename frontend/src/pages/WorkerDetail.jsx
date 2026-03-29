import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import API from "../api/axios";
import Layout from "../components/Layout";

function calcMonthlyStats(attendance, year, month) {
  const totalDays = new Date(year, month + 1, 0).getDate();
  const monthlyRecords = attendance.filter((a) => {
    const d = new Date(a.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
  const presentDays = monthlyRecords.filter((a) => a.status === "present").length;
  const absentDays = monthlyRecords.filter((a) => a.status === "absent").length;
  return { presentDays, absentDays, totalDays };
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function WorkerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear] = useState(now.getFullYear());

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/login", { replace: true }); return; }
    API.get(`/workers/${id}`)
      .then((r) => setWorker(r.data))
      .catch(() => navigate("/workers"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <Layout title="Worker Detail">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin border-t-slate-600 dark:border-t-slate-400" />
        </div>
      </Layout>
    );
  }

  if (!worker) return null;

  const { presentDays, absentDays, totalDays } = calcMonthlyStats(
    worker.attendance || [], selectedYear, selectedMonth
  );
  const earnedSalary = totalDays ? Math.round((presentDays / totalDays) * worker.base_salary) : 0;

  // Build a day-by-day calendar for selected month
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const attendanceByDay = {};
  (worker.attendance || []).forEach((a) => {
    const d = new Date(a.date);
    if (d.getFullYear() === selectedYear && d.getMonth() === selectedMonth) {
      attendanceByDay[d.getDate()] = a.status;
    }
  });

  return (
    <Layout title="Worker Detail" subtitle={`${worker.name} — ${worker.position}`}>
      <div className="mb-4">
        <Link to="/workers" className="flex items-center gap-1.5 text-sm transition-colors text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Workers
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile Card */}
        <div className="rounded-2xl p-6 lg:col-span-1 bg-white/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 backdrop-blur-xl">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl mb-3 bg-slate-700 dark:bg-slate-700">
              {worker.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="font-bold text-base text-slate-800 dark:text-slate-200">{worker.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{worker.position}</p>
            {worker.phone && (
              <p className="text-xs mt-1 text-slate-400 dark:text-slate-500">📞 {worker.phone}</p>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Base Salary</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">₹{Number(worker.base_salary).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">This Month Present</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-500">{presentDays} days</span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">This Month Absent</span>
              <span className="font-semibold text-rose-600 dark:text-rose-500">{absentDays} days</span>
            </div>
            <div className="flex justify-between text-sm py-2">
              <span className="text-slate-500 dark:text-slate-400">Earned Salary</span>
              <span className="font-bold text-base text-emerald-600 dark:text-emerald-500">₹{earnedSalary.toLocaleString()}</span>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-xl text-xs text-center bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400">
            Formula: ({presentDays}/{totalDays}) × ₹{Number(worker.base_salary).toLocaleString()} = ₹{earnedSalary.toLocaleString()}
          </div>
        </div>

        {/* Attendance Calendar */}
        <div className="rounded-2xl p-6 lg:col-span-2 bg-white/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-5">
            <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">Attendance Calendar</p>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-1.5 rounded-lg text-sm focus:outline-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              {MONTHS.map((m, i) => <option key={i} value={i}>{m} {selectedYear}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-7 gap-1.5 mb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i} className="text-center text-xs font-medium py-1 text-slate-500 dark:text-slate-400">{d}</div>
            ))}
          </div>

          {/* Empty cells for start of month */}
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: new Date(selectedYear, selectedMonth, 1).getDay() }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const status = attendanceByDay[day];
              return (
                <div key={day}
                  className={`aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all ${
                    status === "present"
                      ? "bg-emerald-100/50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                      : status === "absent"
                      ? "bg-rose-100/50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                      : "bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600"
                  }`}>
                  {day}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-100 dark:bg-emerald-500/20" /> Present
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-100 dark:bg-rose-500/20" /> Absent
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-100 dark:bg-slate-800" /> Unmarked
            </span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
