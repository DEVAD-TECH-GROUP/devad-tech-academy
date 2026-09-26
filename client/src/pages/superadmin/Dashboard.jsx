import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPlatformStats, getRecentActivity, getSystemHealth } from "../../services/superadmin/dashboardService";
import { formatNaira } from "../../utils/formatCurrency";
import { timeAgo } from "../../utils/formatDate";
import { SkeletonCard } from "../../components/common/Skeleton";
import Badge from "../../components/common/Badge";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPlatformStats(), getRecentActivity(), getSystemHealth()])
      .then(([s, a, h]) => {
        setStats(s.data.data);
        setActivity(a.data.data || []);
        setHealth(h.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );

  const s = stats || {};

  return (
    <div className="space-y-5 fi">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="dsp text-xl font-bold text-text">Super Admin Dashboard</h1>
            <span className="text-xs bg-purple/10 text-purple border border-purple/20 px-2 py-0.5 rounded-lg">
              🔐 Full Access
            </span>
          </div>
          <p className="text-muted text-sm">Platform overview and management</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: "👥", label: "Total Students",    value: s.users?.students || 0,          color: "#818CF8" },
          { icon: "👨‍🏫", label: "Instructors",      value: s.users?.instructors || 0,        color: "#FB923C" },
          { icon: "📚", label: "Published Courses",  value: s.courses?.total || 0,            color: "#34D399" },
          { icon: "💰", label: "Total Revenue",      value: formatNaira(s.revenue?.total||0), color: "#FBBF24" },
          { icon: "📋", label: "Enrollments",        value: s.enrollments?.total || 0,        color: "#60A5FA" },
          { icon: "⏳", label: "Pending Courses",    value: s.pending?.courses || 0,          color: "#F87171" },
          { icon: "📥", label: "Pending Instructors",value: s.pending?.instructors || 0,      color: "#F472B6" },
          { icon: "🎧", label: "Open Tickets",       value: s.pending?.tickets || 0,          color: "#C084FC" },
        ].map(({ icon, label, value, color }) => (
          <div key={label} className="bg-surface border border-border rounded-2xl p-4">
            <div className="text-2xl mb-2">{icon}</div>
            <div className="dsp text-xl font-extrabold" style={{ color }}>{value}</div>
            <div className="text-xs text-muted mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* System Health */}
        <div className="bg-surface border border-border rounded-2xl p-4">
          <h2 className="dsp text-sm font-bold text-text mb-3">System Health</h2>
          <div className="space-y-2">
            {[
              { label: "Database", status: health?.database?.status === "healthy" ? "healthy" : "error" },
              { label: "Server",   status: health?.server?.status || "operational" },
              { label: "Uptime",   status: `${Math.floor((health?.server?.uptime||0)/3600)}h` },
            ].map(({ label, status }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <span className="text-xs text-muted">{label}</span>
                <Badge variant={status === "healthy" || status === "operational" ? "green" : "red"}>
                  {status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-surface border border-border rounded-2xl p-4">
          <h2 className="dsp text-sm font-bold text-text mb-3">Recent Activity</h2>
          <div className="space-y-2">
            {activity.slice(0, 5).map((a) => (
              <div key={a._id} className="py-2 border-b border-border/50 last:border-0">
                <p className="text-xs text-text line-clamp-1">{a.action}</p>
                <p className="text-[10px] text-muted">{timeAgo(a.createdAt)}</p>
              </div>
            ))}
            {activity.length === 0 && (
              <p className="text-xs text-muted text-center py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Pending Actions */}
      {(s.pending?.instructors > 0 || s.pending?.courses > 0) && (
        <div className="bg-surface border border-border rounded-2xl p-4">
          <h2 className="dsp text-sm font-bold text-text mb-3">Pending Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {s.pending?.instructors > 0 && (
              <div
                onClick={() => navigate("/admin/instructors")}
                className="bg-orange/10 border border-orange/20 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-orange/20 transition"
              >
                <div>
                  <p className="text-xs font-semibold text-orange">{s.pending.instructors} Instructor Applications</p>
                  <p className="text-[10px] text-muted">Awaiting review</p>
                </div>
                <span className="text-orange">→</span>
              </div>
            )}
            {s.pending?.courses > 0 && (
              <div
                onClick={() => navigate("/admin/courses")}
                className="bg-yellow/10 border border-yellow/20 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-yellow/20 transition"
              >
                <div>
                  <p className="text-xs font-semibold text-yellow">{s.pending.courses} Courses for Review</p>
                  <p className="text-[10px] text-muted">Awaiting approval</p>
                </div>
                <span className="text-yellow">→</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-surface border border-border rounded-2xl p-4">
        <h2 className="dsp text-sm font-bold text-text mb-3">Quick Actions</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[
            ["👥", "Users",      "/admin/users"],
            ["📚", "Courses",    "/admin/courses"],
            ["💰", "Payments",   "/admin/payments"],
            ["📊", "Analytics",  "/admin/analytics"],
            ["🤖", "AI",         "/admin/ai"],
            ["⚙️", "Settings",   "/admin/settings"],
          ].map(([icon, label, path]) => (
            <button key={label} onClick={() => navigate(path)}
              className="bg-surfaceHigh border border-border rounded-xl py-3 flex flex-col items-center gap-1.5 text-xs text-muted hover:text-text hover:border-purple/40 transition">
              <span className="text-xl">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}