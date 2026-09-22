import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Devad" className="h-14 mb-3" />
          <h1 className="dsp text-2xl font-bold text-text">Devad Tech Academy</h1>
          <p className="text-muted text-sm mt-1">Nigeria's Premier Tech School</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
