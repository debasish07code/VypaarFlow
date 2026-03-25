import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Layout from "../components/Layout";
import Toast from "../components/Toast";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const notify = (message, type = "success") => setToast({ message, type });

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/login", { replace: true }); return; }
    API.get("/users/profile")
      .then((res) => {
        setUser(res.data);
        localStorage.setItem("userName", res.data.name);
        localStorage.setItem("userEmail", res.data.email);
      })
      .catch(() => notify("Failed to load profile", "error"));
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm)
      return notify("New passwords do not match", "error");
    if (pwForm.newPassword.length < 6)
      return notify("Password must be at least 6 characters", "error");

    setSaving(true);
    try {
      await API.put("/users/change-password", {
        oldPassword: pwForm.oldPassword,
        newPassword: pwForm.newPassword,
      });
      notify("Password updated successfully");
      setPwForm({ oldPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      notify(err.response?.data?.message || "Failed to update password", "error");
    } finally {
      setSaving(false);
    }
  };

  const PasswordInput = ({ label, field, show, toggle }) => (
    <div>
      <label className="block text-sm mb-1.5" style={{ color: "rgba(120,113,108,0.7)" }}>{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          required
          value={pwForm[field]}
          onChange={(e) => setPwForm({ ...pwForm, [field]: e.target.value })}
          className="w-full px-4 py-3 pr-11 rounded-xl text-sm focus:outline-none"
          style={{ background: "rgba(0,0,0,0.04)", borderColor: "rgba(0,0,0,0.1)", color: "#78716c", border: "1px solid rgba(0,0,0,0.1)" }}
        />
        <button type="button" onClick={toggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
          style={{ color: "rgba(120,113,108,0.6)" }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={show
                ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"}
            />
          </svg>
        </button>
      </div>
    </div>
  );

  return (
    <Layout title="Profile" subtitle="Manage your account">
      <div className="max-w-2xl space-y-6">

        {/* Profile Card */}
        <div className="border rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.75)", borderColor: "rgba(0,0,0,0.06)" }}>
          <h3 className="text-base font-semibold mb-6" style={{ color: "#78716c" }}>Account Information</h3>
          {user ? (
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0"
                style={{ background: "linear-gradient(135deg,#78716c,#6b7280)" }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold" style={{ color: "#78716c" }}>{user.name}</p>
                <p className="text-sm" style={{ color: "rgba(120,113,108,0.6)" }}>{user.email}</p>
                <p className="text-xs" style={{ color: "rgba(120,113,108,0.5)" }}>Member since {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl animate-pulse" style={{ background: "rgba(0,0,0,0.1)" }} />
              <div className="space-y-2">
                <div className="h-4 w-32 rounded animate-pulse" style={{ background: "rgba(0,0,0,0.1)" }} />
                <div className="h-3 w-48 rounded animate-pulse" style={{ background: "rgba(0,0,0,0.1)" }} />
              </div>
            </div>
          )}
        </div>

        {/* Change Password */}
        <div className="border rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.75)", borderColor: "rgba(0,0,0,0.06)" }}>
          <h3 className="text-base font-semibold mb-6" style={{ color: "#78716c" }}>Change Password</h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <PasswordInput label="Current Password" field="oldPassword" show={showOld} toggle={() => setShowOld(!showOld)} />
            <PasswordInput label="New Password" field="newPassword" show={showNew} toggle={() => setShowNew(!showNew)} />
            <div>
              <label className="block text-sm mb-1.5" style={{ color: "rgba(120,113,108,0.7)" }}>Confirm New Password</label>
              <input
                type="password" required
                value={pwForm.confirm}
                onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                style={{ background: "rgba(0,0,0,0.04)", borderColor: "rgba(0,0,0,0.1)", color: "#78716c", border: "1px solid rgba(0,0,0,0.1)" }}
              />
            </div>
            <button type="submit" disabled={saving}
              className="w-full py-3 rounded-xl text-white text-sm font-medium transition-colors disabled:opacity-50 mt-2"
              style={{ background: "linear-gradient(135deg,#78716c,#6b7280)" }}>
              {saving ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="border rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.75)", borderColor: "rgba(220,38,38,0.2)" }}>
          <h3 className="text-base font-semibold mb-2" style={{ color: "#dc2626" }}>Danger Zone</h3>
          <p className="text-sm mb-4" style={{ color: "rgba(120,113,108,0.6)" }}>Once you log out, you will need your credentials to sign back in.</p>
          <button
            onClick={() => { localStorage.clear(); window.location.href = "/login"; }}
            className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{ border: "1px solid rgba(220,38,38,0.2)", color: "#dc2626" }}>
            Sign out of all sessions
          </button>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Layout>
  );
}
