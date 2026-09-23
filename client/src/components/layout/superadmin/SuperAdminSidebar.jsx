import { NavLink, useNavigate } from "react-router-dom";
import useUIStore from "../../../store/uiStore";
import useAuthStore from "../../../store/authStore";
import { getInitials, getAvatarColor } from "../../../utils/generateAvatar";

const nav = [
  { to: "/admin/dashboard",      icon: "⊞",  label: "Dashboard" },
  { to: "/admin/users",          icon: "👥", label: "Users" },
  { to: "/admin/instructors",    icon: "👨‍🏫", label: "Instructors" },
  { to: "/admin/students",       icon: "🎓", label: "Students" },
  { to: "/admin/courses",        icon: "📚", label: "Courses" },
  { to: "/admin/live-classes",   icon: "📡", label: "Live Classes" },
  { to: "/admin/learning-paths", icon: "🗺️", label: "Learning Paths" },
  { to: "/admin/assignments",    icon: "📝", label: "Assignments" },
  { to: "/admin/quizzes",        icon: "🧠", label: "Quizzes" },
  { to: "/admin/projects",       icon: "🛠️", label: "Projects" },
  { to: "/admin/payments",       icon: "💳", label: "Payments" },
  { to: "/admin/financial",      icon: "💰", label: "Financial" },
  { to: "/admin/analytics",      icon: "📊", label: "Analytics" },
  { to: "/admin/reports",        icon: "📋", label: "Reports" },
  { to: "/admin/certificates",   icon: "🏅", label: "Certificates" },
  { to: "/admin/content",        icon: "📰", label: "Content" },
  { to: "/admin/community",      icon: "🌐", label: "Community" },
  { to: "/admin/communication",  icon: "📢", label: "Communication" },
  { to: "/admin/reviews",        icon: "⭐", label: "Reviews" },
  { to: "/admin/support",        icon: "🎧", label: "Support" },
  { to: "/admin/roles",          icon: "🔐", label: "Roles" },
  { to: "/admin/audit",          icon: "📜", label: "Audit Logs" },
  { to: "/admin/integrations",   icon: "🔗", label: "Integrations" },
  { to: "/admin/ai",             icon: "🤖", label: "AI Management" },
  { to: "/admin/settings",       icon: "⚙️",  label: "Settings" },
];

export default function SuperAdminSidebar() {
  const { sidebarCollapsed, mobileDrawer, closeMobileDrawer } = useUIStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const collapsed = sidebarCollapsed;

  return (
    <aside
      className={`
        fixed lg:relative z-50 h-full flex flex-col bg-surface border-r border-border
        transition-all duration-300 shrink-0
        ${mobileDrawer ? "translate-x-0 slide-in" : "-translate-x-full lg:translate-x-0"}
        ${collapsed ? "w-14" : "w-56"}
      `}
    >
      {/* Logo + Super Admin badge */}
      <div className={`flex items-center gap-3 p-4 border-b border-border shrink-0 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-8 h-8 rounded-lg bg-purple/10 border border-purple/20 flex items-center justify-center shrink-0">
          <span className="dsp text-sm font-bold text-purple">A</span>
        </div>
        {!collapsed && (
          <div>
            <p className="dsp text-sm font-bold text-text">Super Admin</p>
            <p className="text-[10px] text-purple">Full Access 🔐</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
        {nav.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={closeMobileDrawer}
            className={({ isActive }) =>
              `flex items-center gap-3 px-2 py-2 rounded-xl text-sm transition-all
              ${isActive ? "bg-purple/10 text-purple font-medium" : "text-muted hover:text-text hover:bg-surfaceHigh"}
              ${collapsed ? "justify-center" : ""}`
            }
          >
            <span className="text-base shrink-0">{icon}</span>
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-border shrink-0">
        <div
          className={`flex items-center gap-2 p-2 rounded-xl hover:bg-surfaceHigh cursor-pointer transition ${collapsed ? "justify-center" : ""}`}
          onClick={() => { navigate("/admin/profile"); closeMobileDrawer(); }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: getAvatarColor(user?.firstName) }}
          >
            {user?.avatar?.url
              ? <img src={user.avatar.url} alt="" className="w-8 h-8 rounded-full object-cover" />
              : getInitials(user?.firstName, user?.lastName)
            }
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-medium text-text truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] text-purple truncate">Super Admin</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <button onClick={logout} className="w-full mt-1 text-xs text-muted hover:text-red transition py-1.5 rounded-lg hover:bg-red/10">
            Sign out
          </button>
        )}
      </div>
    </aside>
  );
}
