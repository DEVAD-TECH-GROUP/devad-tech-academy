import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ClipboardList,
  Brain,
  Wrench,
  Radio,
  MessageCircle,
  Megaphone,
  Award,
  Wallet,
  BarChart3,
  Star,
  Bot,
  Gift,
  Mail,
  FolderKanban,
  CalendarDays,
  Settings,
} from "lucide-react";

import logo from "../../../assets/logo.png";

import useUIStore from "../../../store/uiStore";
import useAuthStore from "../../../store/authStore";
import {
  getInitials,
  getAvatarColor,
} from "../../../utils/generateAvatar";

const nav = [
  {
    to: "/instructor/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  {
    to: "/instructor/courses",
    icon: BookOpen,
    label: "My Courses",
  },
  {
    to: "/instructor/students",
    icon: Users,
    label: "Students",
  },
  {
    to: "/instructor/assignments",
    icon: ClipboardList,
    label: "Assignments",
  },
  {
    to: "/instructor/quizzes",
    icon: Brain,
    label: "Quizzes",
  },
  {
    to: "/instructor/projects",
    icon: Wrench,
    label: "Projects",
  },
  {
    to: "/instructor/live-classes",
    icon: Radio,
    label: "Live Classes",
  },
  {
    to: "/instructor/discussions",
    icon: MessageCircle,
    label: "Discussions",
  },
  {
    to: "/instructor/announcements",
    icon: Megaphone,
    label: "Announcements",
  },
  {
    to: "/instructor/certificates",
    icon: Award,
    label: "Certificates",
  },
  {
    to: "/instructor/earnings",
    icon: Wallet,
    label: "Earnings",
  },
  {
    to: "/instructor/analytics",
    icon: BarChart3,
    label: "Analytics",
  },
  {
    to: "/instructor/reviews",
    icon: Star,
    label: "Reviews",
  },
  {
    to: "/instructor/ai",
    icon: Bot,
    label: "AI Assistant",
  },
  {
    to: "/instructor/referral",
    icon: Gift,
    label: "Referral",
  },
  {
    to: "/instructor/messages",
    icon: Mail,
    label: "Messages",
  },
  {
    to: "/instructor/resources",
    icon: FolderKanban,
    label: "Resources",
  },
  {
    to: "/instructor/calendar",
    icon: CalendarDays,
    label: "Calendar",
  },
  {
    to: "/instructor/settings",
    icon: Settings,
    label: "Settings",
  },
];

export default function InstructorSidebar() {
  const {
    sidebarCollapsed,
    mobileDrawer,
    closeMobileDrawer,
  } = useUIStore();

  const { user, logout } = useAuthStore();

  const navigate = useNavigate();

  const collapsed = sidebarCollapsed;

  return (
    <aside
      className={`
        fixed lg:relative z-50 h-full flex flex-col
        bg-surface border-r border-border
        transition-all duration-300 shrink-0
        ${
          mobileDrawer
            ? "translate-x-0 slide-in"
            : "-translate-x-full lg:translate-x-0"
        }
        ${collapsed ? "w-14" : "w-56"}
      `}
    >
      {/* ─────────────────────────────────────────────
          HEADER
      ───────────────────────────────────────────── */}
     <div
  className={`
    flex items-center gap-3 p-4
    border-b border-border shrink-0
    cursor-pointer
    hover:bg-surfaceHigh
    transition
    ${collapsed ? "justify-center" : ""}
  `}
  onClick={() => {
    navigate("/");
    closeMobileDrawer();
  }}
>
  <div
    className="
      w-8 h-8 rounded-lg
      flex items-center justify-center shrink-0
      overflow-hidden
    "
  >
    <img
      src={logo}
      alt="Devad Tech Academy"
      className="
        w-8 h-8
        object-contain
      "
    />
  </div>

  {!collapsed && (
    <div>
      <p className="dsp text-sm font-bold text-text">
        Instructor
      </p>

      <p className="text-[10px] text-muted">
        DEVAD Tech Academy
      </p>
    </div>
  )}
</div>

      {/* ─────────────────────────────────────────────
          NAVIGATION
      ───────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={closeMobileDrawer}
            className={({ isActive }) =>
              `
                flex items-center gap-3
                px-2 py-2 rounded-xl
                text-sm transition-all

                ${
                  isActive
                    ? "bg-orange/10 text-orange font-medium"
                    : "text-muted hover:text-text hover:bg-surfaceHigh"
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
              <span className="truncate">
                {label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ─────────────────────────────────────────────
          USER SECTION
      ───────────────────────────────────────────── */}
      <div className="p-3 border-t border-border shrink-0">
        <div
          className={`
            flex items-center gap-2
            p-2 rounded-xl
            hover:bg-surfaceHigh
            cursor-pointer
            transition

            ${collapsed ? "justify-center" : ""}
          `}
          onClick={() => {
            navigate("/instructor/profile");
            closeMobileDrawer();
          }}
        >
          {/* Avatar */}
          <div
            className="
              w-8 h-8 rounded-full
              flex items-center justify-center
              text-white text-xs font-bold
              shrink-0 overflow-hidden
            "
            style={{
              background: getAvatarColor(
                user?.firstName
              ),
            }}
          >
            {user?.avatar?.url ? (
              <img
                src={user.avatar.url}
                alt=""
                className="
                  w-8 h-8
                  rounded-full
                  object-cover
                "
              />
            ) : (
              getInitials(
                user?.firstName,
                user?.lastName
              )
            )}
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <p
                className="
                  text-xs font-medium
                  text-text truncate
                "
              >
                {user?.firstName}{" "}
                {user?.lastName}
              </p>

              <p
                className="
                  text-[10px]
                  text-muted truncate
                "
              >
                {user?.email}
              </p>
            </div>
          )}
        </div>

        {/* Sign Out */}
        {!collapsed && (
          <button
            onClick={logout}
            className="
              w-full mt-1
              text-xs text-muted
              hover:text-red
              transition
              py-1.5
              rounded-lg
              hover:bg-red/10
            "
          >
            Sign out
          </button>
        )}
      </div>
    </aside>
  );
}