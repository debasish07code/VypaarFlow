import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const navItems = [
  { label: "Dashboard",    path: "/dashboard",    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { label: "Inventory",    path: "/inventory",    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
  { label: "Orders",       path: "/orders",       icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
  { label: "Transactions", path: "/transactions", icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" },
  { label: "Workers",      path: "/workers",      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { label: "Profile",      path: "/profile",      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

// Theme persistence
function getInitialTheme() {
  const saved = localStorage.getItem("theme");
  if (saved) return saved;
  return "light"; // default is white as requested
}

export default function Layout({ children, title, subtitle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "User";
  const initial = userName.charAt(0).toUpperCase();
  const [theme, setTheme] = useState(getInitialTheme);

  // Apply theme to root element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const cycleTheme = () => {
    setTheme((t) => {
      if (t === "light") return "dark";
      if (t === "dark") return "system";
      // system → resolve based on OS
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    });
  };

  const themeIcon = theme === "dark"
    ? "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    : theme === "light"
    ? "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
    : "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-1";

  return (
    <div className="flex min-h-screen" style={{
      background: theme === "dark"
        ? "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)"
        : "linear-gradient(135deg,#faf9f7 0%,#f5f3f0 50%,#faf9f7 100%)"
    }}>
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 relative"
        style={{
          background: theme === "dark"
            ? "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)"
            : "linear-gradient(180deg,#fefdfb 0%,#faf9f7 100%)",
          borderRight: "1px solid rgba(0,0,0,0.08)"
        }}>
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.05) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

        <div className="relative z-10 flex flex-col h-full p-5">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 mb-8 px-1 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
              style={{ background: "linear-gradient(135deg,#475569,#334155)" }}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-base font-bold tracking-tight" style={{ color: theme === "dark" ? "#f5f5f0" : "#1c1917" }}>VypaarFlow</span>
          </Link>

          {/* Nav */}
          <nav className="flex flex-col gap-1 flex-1">
            {navItems.map((item) => {
              const active = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
              return (
                <Link key={item.path} to={item.path}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group overflow-hidden`}
                  style={{
                    color: active
                      ? (theme === "dark" ? "#f5f5f0" : "#1c1917")
                      : (theme === "dark" ? "#a8a29e" : "#78716c"),
                    background: active
                      ? (theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(107,114,128,0.1)")
                      : "transparent",
                    border: active ? "1px solid rgba(0,0,0,0.06)" : "1px solid transparent",
                  }}>
                  {active && <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-gray-500 z-10" />}
                  <svg className="w-4 h-4 shrink-0 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User + Logout */}
          <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1"
              style={{ background: "rgba(0,0,0,0.04)" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ background: "linear-gradient(135deg,#475569,#334155)" }}>
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium truncate" style={{ color: theme === "dark" ? "#d6d3d1" : "#78716c" }}>{userName}</p>
                <p className="text-xs" style={{ color: "rgba(120,113,108,0.5)" }}>Business Account</p>
              </div>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 w-full group"
              style={{ color: theme === "dark" ? "#a8a29e" : "#78716c" }}>
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-4 shrink-0 relative"
          style={{
            background: theme === "dark" ? "rgba(15,23,42,0.9)" : "rgba(254,253,251,0.9)",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            backdropFilter: "blur(12px)"
          }}>
          <div>
            <h1 className="text-base font-semibold" style={{ color: theme === "dark" ? "#f5f5f0" : "#1c1917" }}>{title}</h1>
            {subtitle && <p className="text-xs mt-0.5" style={{ color: "rgba(107,114,128,0.6)" }}>{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            {/* Mobile nav */}
            <div className="lg:hidden flex gap-1">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path}
                  className={`p-2 rounded-lg transition-colors ${location.pathname === item.path ? "text-gray-900" : "text-gray-600 hover:text-gray-900"}`}
                  style={location.pathname === item.path ? { background: "rgba(107,114,128,0.1)" } : {}}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </Link>
              ))}
            </div>
            {/* Theme toggle */}
            <button onClick={cycleTheme}
              title={`Theme: ${theme}`}
              className="p-2 rounded-full transition-all duration-200 hover:scale-110"
              style={{ background: theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)", color: theme === "dark" ? "#e2e8f0" : "#475569" }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={themeIcon} />
              </svg>
            </button>
            
            <Link to="/profile"
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 transition-all duration-200 hover:scale-110 hover:shadow-lg"
              style={{ background: "linear-gradient(135deg,#475569,#334155)", boxShadow: "0 0 0 2px rgba(107,114,128,0.2)" }}>
              {initial}
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6"
          style={{ color: theme === "dark" ? "#d6d3d1" : "#44403c" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
