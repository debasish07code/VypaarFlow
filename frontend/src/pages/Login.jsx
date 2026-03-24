import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const handleMove = (e) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await API.post("/login", form);
      localStorage.setItem("token", res.data.token);
      alert("Login successful");
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes gradient { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-30px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
        @keyframes shimmer { to{background-position:200% center} }
        @keyframes glow { 0%,100%{filter:drop-shadow(0 0 20px rgba(99,102,241,0.4))} 50%{filter:drop-shadow(0 0 40px rgba(99,102,241,0.6))} }
        @keyframes blob { 0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%} 50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%} }
        @keyframes orbit { from{transform:rotate(0deg) translateX(120px) rotate(0deg)} to{transform:rotate(360deg) translateX(120px) rotate(-360deg)} }
      `}</style>

      <div className="min-h-screen w-full flex">
        
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden"
             style={{background:'linear-gradient(135deg,#0a0e27 0%,#1a1a3e 50%,#2d2d5f 100%)'}}>
          
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 opacity-30"
               style={{background:'linear-gradient(-45deg,#4a5578,#5a6b8f,#6a7ba8,#4a5578)',backgroundSize:'400% 400%',animation:'gradient 15s ease infinite'}}/>
          
          {/* Mouse follow glow */}
          <div className="absolute w-96 h-96 rounded-full pointer-events-none blur-3xl opacity-20 transition-all duration-500"
               style={{background:'radial-gradient(circle,rgba(90,107,143,0.4),transparent 70%)',left:mouse.x-192,top:mouse.y-192}}/>
          
          {/* Floating blobs */}
          <div className="absolute w-72 h-72 bg-gradient-to-br from-slate-500/15 to-slate-600/10 blur-3xl top-20 left-10"
               style={{animation:'blob 12s ease-in-out infinite, float 8s ease-in-out infinite'}}/>
          <div className="absolute w-80 h-80 bg-gradient-to-br from-slate-600/12 to-slate-700/8 blur-3xl bottom-20 right-10"
               style={{animation:'blob 10s ease-in-out infinite reverse, float 10s ease-in-out infinite 1s'}}/>
          <div className="absolute w-64 h-64 bg-gradient-to-br from-slate-500/10 to-slate-600/5 blur-3xl top-1/2 left-1/3"
               style={{animation:'blob 14s ease-in-out infinite, pulse 6s ease-in-out infinite'}}/>
          
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.05]"
               style={{backgroundImage:'linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)',backgroundSize:'60px 60px'}}/>
          
          {/* Orbital rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-[400px] h-[400px] border border-white/5 rounded-full" style={{animation:'spin 40s linear infinite'}}/>
            <div className="absolute inset-8 border border-white/10 rounded-full" style={{animation:'spin 30s linear infinite reverse'}}/>
            <div className="absolute inset-16 border border-white/5 rounded-full" style={{animation:'spin 20s linear infinite'}}/>
            
            {/* Orbiting dots */}
            <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-indigo-400 rounded-full" style={{animation:'orbit 15s linear infinite'}}/>
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-violet-400 rounded-full" style={{animation:'orbit 20s linear infinite reverse'}}/>
            <div className="absolute top-1/2 left-1/2 w-2.5 h-2.5 bg-fuchsia-400 rounded-full" style={{animation:'orbit 25s linear infinite',animationDelay:'-5s'}}/>
          </div>
          
          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 w-full">
            
            {/* Logo */}
            <div className="mb-12" style={{animation:'slideIn 0.8s ease-out forwards'}}>
              <div className="flex items-center gap-3">
                <div className="relative" style={{animation:'glow 4s ease-in-out infinite'}}>
                  <div className="w-14 h-14 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 hover:rotate-6 transition-all duration-300 cursor-pointer">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                  </div>
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">VypaarFlow</span>
              </div>
            </div>
            
            {/* Heading */}
            <div style={{animation:'slideIn 0.8s ease-out 0.1s both'}}>
              <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
                Streamline Your
                <span className="block bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-clip-text text-transparent">
                  Business Operations
                </span>
              </h1>
              <p className="text-lg text-slate-300/80 max-w-md leading-relaxed">
                Manage transactions, track finances, and grow your business with our powerful all-in-one platform.
              </p>
            </div>
            
            {/* Features */}
            <div className="mt-12 space-y-4">
              {[
                { icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', text: 'Real-time Analytics Dashboard' },
                { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', text: 'Bank-grade Security' },
                { icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', text: 'Automated Financial Reports' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group" style={{animation:`slideIn 0.6s ease-out ${0.2 + i * 0.1}s both`}}>
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
                    <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon}/>
                    </svg>
                  </div>
                  <span className="text-slate-200 font-medium">{item.text}</span>
                </div>
              ))}
            </div>
            
            {/* Testimonial */}
            <div className="mt-16 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10" style={{animation:'slideIn 0.8s ease-out 0.5s both'}}>
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <p className="text-slate-300 italic">"VypaarFlow transformed how we manage our finances. The insights are incredible."</p>
              <p className="text-slate-400 text-sm mt-3">- Rahul Sharma, CEO at TechStart</p>
            </div>
          </div>
        </div>
        
        {/* Right Panel - Login Form */}
        <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center p-6 sm:p-10 bg-white relative overflow-hidden">
          
          {/* Subtle background elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gray-200/5 rounded-full blur-3xl"/>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gray-300/5 rounded-full blur-3xl"/>
          
          {/* Form container */}
          <div className="w-full max-w-md" style={{animation:'scaleIn 0.6s ease-out forwards'}}>
            
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-10" style={{animation:'slideUp 0.6s ease-out forwards'}}>
              <div className="w-12 h-12 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-white">VypaarFlow</span>
            </div>
            
            {/* Header */}
            <div className="mb-10" style={{animation:'slideUp 0.6s ease-out 0.1s both'}}>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
              <p className="text-gray-600">Enter your credentials to access your account</p>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Email */}
              <div style={{animation:'slideUp 0.6s ease-out 0.2s both'}}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                <div className={`relative transition-all duration-300 ${focused === 'email' ? 'transform scale-[1.01]' : ''}`}>
                  <div className={`absolute -inset-0.5 bg-gradient-to-r from-gray-400 to-gray-500 rounded-xl blur opacity-0 transition-opacity duration-300 ${focused === 'email' ? 'opacity-50' : ''}`}/>
                  <div className="relative">
                    <svg className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${focused === 'email' ? 'text-gray-700' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      onFocus={() => setFocused('email')}
                      onBlur={() => setFocused(null)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>
              
              {/* Password */}
              <div style={{animation:'slideUp 0.6s ease-out 0.3s both'}}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className={`relative transition-all duration-300 ${focused === 'password' ? 'transform scale-[1.01]' : ''}`}>
                  <div className={`absolute -inset-0.5 bg-gradient-to-r from-gray-400 to-gray-500 rounded-xl blur opacity-0 transition-opacity duration-300 ${focused === 'password' ? 'opacity-50' : ''}`}/>
                  <div className="relative">
                    <svg className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${focused === 'password' ? 'text-gray-700' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      onFocus={() => setFocused('password')}
                      onBlur={() => setFocused(null)}
                      className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-500/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Remember & Forgot */}
              <div className="flex items-center justify-between" style={{animation:'slideUp 0.6s ease-out 0.35s both'}}>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 bg-white text-gray-700 focus:ring-gray-500 focus:ring-offset-white"/>
                  <span className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-gray-700 hover:text-gray-900 transition-colors font-medium">
                  Forgot password?
                </Link>
              </div>
              
              {/* Submit */}
              <div style={{animation:'slideUp 0.6s ease-out 0.4s both'}}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full py-4 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900"/>
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                       style={{background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)',backgroundSize:'200% 100%',animation:'shimmer 1.5s infinite'}}/>
                  <span className="relative flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                        </svg>
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>
            
            {/* Divider */}
            <div className="flex items-center gap-4 my-8" style={{animation:'slideUp 0.6s ease-out 0.45s both'}}>
              <div className="flex-1 h-px bg-gray-300"/>
              <span className="text-gray-500 text-sm">or continue with</span>
              <div className="flex-1 h-px bg-gray-300"/>
            </div>
            
            {/* Social */}
            <div className="grid grid-cols-3 gap-4" style={{animation:'slideUp 0.6s ease-out 0.5s both'}}>
              {[
                { name: 'Google', path: 'M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' },
                { name: 'GitHub', path: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' },
                { name: 'X', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' }
              ].map((social, i) => (
                <button
                  key={i}
                  type="button"
                  className="group relative py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-white transition-all duration-300 hover:bg-slate-800 hover:border-slate-700 hover:scale-105 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.path}/>
                  </svg>
                </button>
              ))}
            </div>
            
            {/* Sign up */}
            <p className="text-center mt-8 text-slate-400" style={{animation:'slideUp 0.6s ease-out 0.55s both'}}>
              Don't have an account?{' '}
              <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
