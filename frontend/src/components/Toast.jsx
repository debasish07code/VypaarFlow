import { useEffect } from "react";

const icons = {
  success: { path: "M5 13l4 4L19 7", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
  error:   { path: "M6 18L18 6M6 6l12 12", color: "text-red-600", bg: "bg-red-50 border-red-200" },
  info:    { path: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
};

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { path, color, bg } = icons[type] || icons.info;

  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border ${bg} backdrop-blur-sm shadow-xl animate-[slideUp_0.3s_ease-out]`}>
      <svg className={`w-5 h-5 shrink-0 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
      </svg>
      <span className="text-gray-900 text-sm font-medium">{message}</span>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors ml-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
