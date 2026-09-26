import { useEffect } from "react";
import useNotificationStore from "../../store/notificationStore";
import { timeAgo } from "../../utils/formatDate";
import Badge from "../../components/common/Badge";

export default function AdminNotifications() {
  const { notifications, unreadCount, fetch, markRead, markAllRead } = useNotificationStore();

  useEffect(() => { fetch("superadmin"); }, []);

  return (
    <div className="space-y-5 fi">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="dsp text-xl font-bold text-text">Notifications</h1>
          {unreadCount > 0 && <p className="text-xs text-muted">{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead("superadmin")}
            className="text-xs text-purple hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <div className="text-5xl mb-3">🔔</div>
          <p className="text-sm">No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && markRead(n._id, "superadmin")}
              className={`bg-surface border rounded-2xl p-4 cursor-pointer transition
                ${!n.isRead ? "border-purple/40 bg-purple/5" : "border-border hover:border-purple/20"}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0">🔔</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="text-xs font-semibold text-text">{n.title}</p>
                    {!n.isRead && <Badge variant="purple" size="xs">New</Badge>}
                  </div>
                  <p className="text-xs text-muted">{n.message}</p>
                  <p className="text-[10px] text-muted/60 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}