import { useNavigate } from "react-router-dom";
import {
  Bell,
  Menu,
  Search,
} from "lucide-react";

import useUIStore from "../../../store/uiStore";
import useNotificationStore from "../../../store/notificationStore";
import useAuthStore from "../../../store/authStore";
import {
  getInitials,
  getAvatarColor,
} from "../../../utils/generateAvatar";

export default function StudentTopbar() {
  const { toggleSidebar, openMobileDrawer } = useUIStore();
  const { unreadCount } = useNotificationStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface px-4">
      {/* Mobile menu */}
      <button
        type="button"
        onClick={openMobileDrawer}
        className="p-1 text-muted transition hover:text-text lg:hidden"
        aria-label="Open navigation menu"
      >
        <Menu size={20} strokeWidth={1.8} />
      </button>

      {/* Desktop sidebar toggle */}
      <button
        type="button"
        onClick={toggleSidebar}
        className="hidden p-1 text-muted transition hover:text-text lg:block"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} strokeWidth={1.8} />
      </button>

      {/* Search */}
      <button
        type="button"
        onClick={() => navigate("/student/search")}
        className="hidden max-w-xs flex-1 items-center gap-2 rounded-xl border border-border bg-surfaceHigh px-3 py-2 text-left transition hover:border-accent/40 sm:flex"
        aria-label="Search courses"
      >
        <Search
          size={16}
          strokeWidth={1.8}
          className="shrink-0 text-muted"
        />

        <span className="text-xs text-muted">
          Search courses...
        </span>
      </button>

      <div className="flex-1" />

      {/* Notifications */}
      <button
        type="button"
        onClick={() => navigate("/student/notifications")}
        className="relative p-2 text-muted transition hover:text-text"
        aria-label={
          unreadCount > 0
            ? `${unreadCount} unread notifications`
            : "Notifications"
        }
      >
        <Bell size={20} strokeWidth={1.8} />

        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red px-1 text-[9px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Avatar */}
      <button
        type="button"
        onClick={() => navigate("/student/profile")}
        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full text-xs font-bold text-white"
        style={{
          background: getAvatarColor(user?.firstName),
        }}
        aria-label="Open profile"
      >
        {user?.avatar?.url ? (
          <img
            src={user.avatar.url}
            alt={`${user.firstName} ${user.lastName}`}
            className="h-full w-full object-cover"
          />
        ) : (
          getInitials(user?.firstName, user?.lastName)
        )}
      </button>
    </header>
  );
}
