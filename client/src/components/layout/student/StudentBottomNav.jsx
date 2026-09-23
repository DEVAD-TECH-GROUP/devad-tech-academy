import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  MessageCircle,
  User,
} from "lucide-react";

const tabs = [
  {
    to: "/student/dashboard",
    icon: LayoutDashboard,
    label: "Home",
  },
  {
    to: "/student/courses",
    icon: BookOpen,
    label: "Courses",
  },
  {
    to: "/student/assignments",
    icon: ClipboardList,
    label: "Tasks",
  },
  {
    to: "/student/community",
    icon: MessageCircle,
    label: "Community",
  },
  {
    to: "/student/profile",
    icon: User,
    label: "Profile",
  },
];

export default function StudentBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-border bg-surface lg:hidden">
      {tabs.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `
              flex flex-1 flex-col items-center justify-center
              gap-0.5 py-2 text-[10px] transition
              ${
                isActive
                  ? "font-medium text-accent"
                  : "text-muted"
              }
            `
          }
        >
          {({ isActive }) => (
            <>
              <Icon
                size={19}
                strokeWidth={isActive ? 2.2 : 1.8}
                className="leading-none"
              />

              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

