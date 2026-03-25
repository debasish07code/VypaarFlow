import { Link, useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { label: "Dashboard",    path: "/dashboard",    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { label: "Inventory",    path: "/inventory",    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
  { label: "Transactions", path: "/transactions", icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" },
  { label: "Orders",       path: "/orders",       icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
  { label: "Profile",      path: "/profile",      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

export default function Layout({ children, title, subtitle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "User";
  const initial = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(135deg,#faf9f7 0%,#f5f3f0 50%,#faf9f7 100%)" }}>

      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 relative"
        style={{ background: "linear-gradient(180deg,#fefdfb 0%,#faf9f7 100%)", borderRight: "1px solid rgba(0,0,0,0.06)" }}>

        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.05) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

        {/* Glow top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(107,114,128,0.3),transparent 70%)" }} />

        <div className="relative z-10 flex flex-col h-full p-5">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 mb-8 px-1 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
              style={{ background: "linear-gradient(135deg,#475569,#334155)" }}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-base font-bold text-gray-900 tracking-tight">VypaarFlow</span>
          </Link>

          {/* Nav */}
          <nav className="flex flex-col gap-1 flex-1">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group overflow-hidden
                    ${active ? "text-gray-900" : "text-gray-600 hover:text-gray-900"}`}
                  style={active ? { background: "rgba(107,114,128,0.1)", border: "1px solid rgba(0,0,0,0.06)" } : {}}>
                  {active && (
                    <div className="absolute inset-0 opacity-20 pointer-events-none"
                      style={{ background: "linear-gradient(90deg,rgba(107,114,128,0.2),transparent)" }} />
                  )}
                  {!active && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-xl"
                      style={{ background: "rgba(0,0,0,0.02)" }} />
                  )}
                  <svg className={`w-4 h-4 shrink-0 relative z-10 transition-colors duration-200 ${active ? "text-gray-700" : "text-gray-500 group-hover:text-gray-700"}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  <span className="relative z-10">{item.label}</span>
                  {active && <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-gray-500 z-10" />}
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
              <div className="min-w-0">
                <p className="text-gray-700 text-xs font-medium truncate">{userName}</p>
                <p className="text-gray-500 text-xs">Business Account</p>
              </div>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium text-gray-600 hover:text-red-600 transition-all duration-200 w-full group"
              style={{ hover: {} }}>
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
          style={{ background: "rgba(254,253,251,0.9)", borderBottom: "1px solid rgba(0,0,0,0.06)", backdropFilter: "blur(12px)" }}>
          <div>
            <h1 className="text-base font-semibold text-gray-900">{title}</h1>
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
            <Link to="/profile"
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 transition-all duration-200 hover:scale-110 hover:shadow-lg"
              style={{ background: "linear-gradient(135deg,#475569,#334155)", boxShadow: "0 0 0 2px rgba(107,114,128,0.2)" }}>
              {initial}
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
