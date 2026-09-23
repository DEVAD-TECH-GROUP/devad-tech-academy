import { useNavigate } from "react-router-dom";
import useUIStore from "../../../store/uiStore";
import useNotificationStore from "../../../store/notificationStore";
import useAuthStore from "../../../store/authStore";
import { getInitials, getAvatarColor } from "../../../utils/generateAvatar";

export default function SuperAdminTopbar() {
  const { toggleSidebar, openMobileDrawer } = useUIStore();
  const { unreadCount } = useNotificationStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <header className="h-14 bg-surface border-b border-border flex items-center px-4 gap-3 shrink-0">
      <button onClick={openMobileDrawer} className="lg:hidden text-muted hover:text-text p-1">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <button onClick={toggleSidebar} className="hidden lg:block text-muted hover:text-text p-1">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Super Admin badge */}
      <div className="hidden sm:flex items-center gap-2 bg-purple/10 border border-purple/20 rounded-xl px-3 py-1">
        <span className="text-purple text-xs font-medium">🔐 Super Admin</span>
      </div>

      <div className="flex-1" />

      <button onClick={() => navigate("/admin/notifications")} className="relative p-2 text-muted hover:text-text transition">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer"
        style={{ background: getAvatarColor(user?.firstName) }}
        onClick={() => navigate("/admin/profile")}
      >
        {user?.avatar?.url
          ? <img src={user.avatar.url} className="w-8 h-8 rounded-full object-cover" alt="" />
          : getInitials(user?.firstName, user?.lastName)
        }
      </div>
    </header>
  );
}