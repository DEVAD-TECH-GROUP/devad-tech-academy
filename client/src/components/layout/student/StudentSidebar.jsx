import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Brain,
  Wrench,
  Radio,
  Map,
  Award,
  Star,
  MessageCircle,
  Mail,
  CalendarDays,
  BriefcaseBusiness,
  FolderKanban,
  CreditCard,
  Gift,
  Headphones,
  Settings,
  LogOut,
} from "lucide-react";

import useUIStore from "../../../store/uiStore";
import useAuthStore from "../../../store/authStore";
import {
  getInitials,
  getAvatarColor,
} from "../../../utils/generateAvatar";

const nav = [
  {
    to: "/student/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  {
    to: "/student/courses",
    icon: BookOpen,
    label: "My Courses",
  },
  {
    to: "/student/assignments",
    icon: ClipboardList,
    label: "Assignments",
  },
  {
    to: "/student/quizzes",
    icon: Brain,
    label: "Quizzes",
  },
  {
    to: "/student/projects",
    icon: Wrench,
    label: "Projects",
  },
  {
    to: "/student/live-classes",
    icon: Radio,
    label: "Live Classes",
  },
  {
    to: "/student/learning-path",
    icon: Map,
    label: "Learning Path",
  },
  {
    to: "/student/certificates",
    icon: Award,
    label: "Certificates",
  },
  {
    to: "/student/achievements",
    icon: Star,
    label: "Achievements",
  },
  {
    to: "/student/community",
    icon: MessageCircle,
    label: "Community",
  },
  {
    to: "/student/messages",
    icon: Mail,
    label: "Messages",
  },
  {
    to: "/student/calendar",
    icon: CalendarDays,
    label: "Calendar",
  },
  {
    to: "/student/career",
    icon: BriefcaseBusiness,
    label: "Career",
  },
  {
    to: "/student/portfolio",
    icon: FolderKanban,
    label: "Portfolio",
  },
  {
    to: "/student/billing",
    icon: CreditCard,
    label: "Billing",
  },
  {
    to: "/student/referral",
    icon: Gift,
    label: "Referral",
  },
  {
    to: "/student/support",
    icon: Headphones,
    label: "Support",
  },
  {
    to: "/student/settings",
    icon: Settings,
    label: "Settings",
  },
];

export default function StudentSidebar() {
  const {
    sidebarCollapsed,
    mobileDrawer,
    closeMobileDrawer,
  } = useUIStore();

  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const isOpen = mobileDrawer;
  const collapsed = sidebarCollapsed;

  return (
    <aside
      className={`
        fixed z-50 flex h-full shrink-0 flex-col
        border-r border-border bg-surface
        transition-all duration-300
        lg:relative
        ${
          isOpen
            ? "translate-x-0 slide-in"
            : "-translate-x-full lg:translate-x-0"
        }
        ${collapsed ? "w-14" : "w-56"}
      `}
    >
      {/* Logo */}
      <div
        className={`
          flex shrink-0 items-center gap-3 border-b border-border p-4
          ${collapsed ? "justify-center" : ""}
        `}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-accent/10">
          <span className="dsp text-sm font-bold text-accent">D</span>
        </div>

        {!collapsed && (
          <div>
            <p className="dsp text-sm font-bold text-text">Devad</p>
            <p className="text-[10px] text-muted">Tech Academy</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={closeMobileDrawer}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `
                flex items-center gap-3 rounded-xl px-2 py-2 text-sm
                transition-all
                ${
                  isActive
                    ? "bg-accent/10 font-medium text-accent"
                    : "text-muted hover:bg-surfaceHigh hover:text-text"
                }
                ${collapsed ? "justify-center" : ""}
              `
            }
          >
            <Icon
              size={17}
              strokeWidth={1.8}
              className="shrink-0"
            />

            {!collapsed && (
              <span className="truncate">{label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="shrink-0 border-t border-border p-3">
        <div
          className={`
            flex cursor-pointer items-center gap-2 rounded-xl p-2
            transition hover:bg-surfaceHigh
            ${collapsed ? "justify-center" : ""}
          `}
          onClick={() => {
            navigate("/student/profile");
            closeMobileDrawer();
          }}
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{
              background: getAvatarColor(user?.firstName),
            }}
          >
            {user?.avatar?.url ? (
              <img
                src={user.avatar.url}
                alt={`${user.firstName} ${user.lastName}`}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              getInitials(user?.firstName, user?.lastName)
            )}
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-text">
                {user?.firstName} {user?.lastName}
              </p>

              <p className="truncate text-[10px] text-muted">
                {user?.email}
              </p>
            </div>
          )}
        </div>

        {!collapsed && (
          <button
            onClick={logout}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg py-1.5 text-xs text-muted transition hover:bg-red/10 hover:text-red"
          >
            <LogOut size={14} />
            Sign out
          </button>
        )}
      </div>
    </aside>
  );
}
