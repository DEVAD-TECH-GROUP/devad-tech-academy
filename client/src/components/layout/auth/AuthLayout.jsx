import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-3">
            <span className="dsp text-2xl font-bold text-accent">D</span>
          </div>
          <h1 className="dsp text-xl font-bold text-text">Devad Tech Academy</h1>
          <p className="text-muted text-xs mt-1">Nigeria's Premier Tech School 🇳🇬</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
