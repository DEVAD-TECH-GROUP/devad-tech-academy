import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/admin/dashboard",   icon: "⊞",  label: "Home" },
  { to: "/admin/users",       icon: "👥", label: "Users" },
  { to: "/admin/courses",     icon: "📚", label: "Courses" },
  { to: "/admin/analytics",   icon: "📊", label: "Analytics" },
  { to: "/admin/settings",    icon: "⚙️",  label: "Settings" },
];

export default function SuperAdminBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex lg:hidden z-30">
      {tabs.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] transition
            ${isActive ? "text-purple" : "text-muted"}`
          }
        >
          <span className="text-lg leading-none">{icon}</span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
