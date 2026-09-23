import { NavLink, useNavigate } from "react-router-dom";
import useUIStore from "../../../store/uiStore";
import useAuthStore from "../../../store/authStore";
import { getInitials, getAvatarColor } from "../../../utils/generateAvatar";

const nav = [
  { to: "/instructor/dashboard",     icon: "⊞",  label: "Dashboard" },
  { to: "/instructor/courses",       icon: "📚", label: "My Courses" },
  { to: "/instructor/students",      icon: "👥", label: "Students" },
  { to: "/instructor/assignments",   icon: "📝", label: "Assignments" },
  { to: "/instructor/quizzes",       icon: "🧠", label: "Quizzes" },
  { to: "/instructor/projects",      icon: "🛠️", label: "Projects" },
  { to: "/instructor/live-classes",  icon: "📡", label: "Live Classes" },
  { to: "/instructor/discussions",   icon: "💬", label: "Discussions" },
  { to: "/instructor/announcements", icon: "📢", label: "Announcements" },
  { to: "/instructor/certificates",  icon: "🏅", label: "Certificates" },
  { to: "/instructor/earnings",      icon: "💰", label: "Earnings" },
  { to: "/instructor/analytics",     icon: "📊", label: "Analytics" },
  { to: "/instructor/reviews",       icon: "⭐", label: "Reviews" },
  { to: "/instructor/ai",            icon: "🤖", label: "AI Assistant" },
  { to: "/instructor/referral",      icon: "🎁", label: "Referral" },
  { to: "/instructor/messages",      icon: "✉️",  label: "Messages" },
  { to: "/instructor/resources",     icon: "🗂️", label: "Resources" },
  { to: "/instructor/calendar",      icon: "📅", label: "Calendar" },
  { to: "/instructor/settings",      icon: "⚙️",  label: "Settings" },
];

export default function InstructorSidebar() {
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
      <div className={`flex items-center gap-3 p-4 border-b border-border shrink-0 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-8 h-8 rounded-lg bg-orange/10 border border-orange/20 flex items-center justify-center shrink-0">
          <span className="dsp text-sm font-bold text-orange">I</span>
        </div>
        {!collapsed && (
          <div>
            <p className="dsp text-sm font-bold text-text">Instructor</p>
            <p className="text-[10px] text-muted">Devad Academy</p>
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
              ${isActive ? "bg-orange/10 text-orange font-medium" : "text-muted hover:text-text hover:bg-surfaceHigh"}
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
          onClick={() => { navigate("/instructor/profile"); closeMobileDrawer(); }}
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
              <p className="text-[10px] text-muted truncate">{user?.email}</p>
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