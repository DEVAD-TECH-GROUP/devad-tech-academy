import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Wallet,
  User,
} from "lucide-react";

const tabs = [
  {
    to: "/instructor/dashboard",
    icon: LayoutDashboard,
    label: "Home",
  },
  {
    to: "/instructor/courses",
    icon: BookOpen,
    label: "Courses",
  },
  {
    to: "/instructor/students",
    icon: Users,
    label: "Students",
  },
  {
    to: "/instructor/earnings",
    icon: Wallet,
    label: "Earnings",
  },
  {
    to: "/instructor/profile",
    icon: User,
    label: "Profile",
  },
];

export default function InstructorBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex lg:hidden z-30">
      {tabs.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] transition
            ${isActive ? "text-orange" : "text-muted"}`
          }
        >
          <Icon
            size={18}
            strokeWidth={1.8}
            className="shrink-0"
          />

          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
