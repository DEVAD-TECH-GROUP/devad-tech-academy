import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
} from "lucide-react";
import { toast } from "react-hot-toast";

import useAuthStore from "../../store/authStore";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [show, setShow] = useState(false);

  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const user = await login(form.email, form.password);

      toast.success("Welcome back! 👋");

      if (user.role === "super_admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "instructor") {
        navigate("/instructor/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Login failed"
      );
    }
  };

  const googleAuthUrl = `${
    import.meta.env.VITE_API_URL
  }/auth/google`;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg px-4 py-10 text-text">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-18rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-[-15rem] left-[-10rem] h-[28rem] w-[28rem] rounded-full bg-purple/10 blur-3xl" />
        <div className="absolute right-[-10rem] top-1/3 h-[24rem] w-[24rem] rounded-full bg-blue/10 blur-3xl" />
      </div>

      {/* Decorative grid */}
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(129,140,248,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(129,140,248,0.06)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />

      <section className="relative z-10 w-full max-w-md">
        {/* Brand */}
        <div className="mb-7 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 shadow-[0_0_35px_rgba(129,140,248,0.2)]">
            <span className="dsp text-2xl font-bold text-accent">
              D
            </span>
          </div>

          <p className="mb-2 flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.24em] text-accent">
            <Sparkles size={14} />
            Devad Tech Academy
          </p>

          <h1 className="dsp text-3xl font-bold tracking-tight text-text">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-muted">
            Continue your learning journey.
          </p>
        </div>

        {/* Login card */}
        <div className="fi rounded-3xl border border-border bg-surface/95 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
          <div className="mb-6">
            <h2 className="dsp text-xl font-semibold text-text">
              Sign in to your account
            </h2>

            <p className="mt-1 text-sm text-muted">
              Enter your details to access your dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-medium text-mutedLight"
              >
                Email address
              </label>

              <div className="group relative">
                <Mail
                  size={17}
                  strokeWidth={1.8}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted transition group-focus-within:text-accent"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-border bg-surfaceHigh py-3.5 pl-11 pr-4 text-sm text-text outline-none transition placeholder:text-muted/70 focus:border-accent focus:bg-surfaceHigh focus:ring-4 focus:ring-accent/10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-medium text-mutedLight"
                >
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-accent transition hover:text-accent/80 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="group relative">
                <LockKeyhole
                  size={17}
                  strokeWidth={1.8}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted transition group-focus-within:text-accent"
                />

                <input
                  id="password"
                  name="password"
                  type={show ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-border bg-surfaceHigh py-3.5 pl-11 pr-12 text-sm text-text outline-none transition placeholder:text-muted/70 focus:border-accent focus:bg-surfaceHigh focus:ring-4 focus:ring-accent/10"
                />

                <button
                  type="button"
                  onClick={() => setShow((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted transition hover:bg-accent/10 hover:text-text"
                  aria-label={
                    show ? "Hide password" : "Show password"
                  }
                >
                  {show ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition hover:bg-accent/90 hover:shadow-accent/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign in"}

              {!isLoading && (
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />

            <span className="text-[11px] uppercase tracking-wider text-muted">
              or continue with
            </span>

            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Google */}
          <a
            href={googleAuthUrl}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-surfaceHigh py-3 text-sm font-medium text-text transition hover:border-accent/50 hover:bg-accent/5"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>

            Continue with Google
          </a>

          {/* Register */}
          <p className="mt-7 text-center text-sm text-muted">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-accent transition hover:text-accent/80 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-muted/70">
          Secure access to your Devad learning space
        </p>
      </section>
    </main>
  );
}
