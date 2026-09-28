import { useEffect } from "react";
import toast from "react-hot-toast";

import useNotificationStore from "../../store/notificationStore";

import { timeAgo } from "../../utils/formatDate";
import Badge from "../../components/common/Badge";

export default function AdminNotifications() {
  // ==========================================================
  // STORE
  // ==========================================================

  const {
    notifications,
    unreadCount,

    loading,
    markingRead,
    markingAllRead,

    error,

    fetch,
    markRead,
    markAllRead,
    clearError,
  } = useNotificationStore();

  // ==========================================================
  // DEBUG
  // ==========================================================

  useEffect(() => {
    console.log(
      "[DEVAD ADMIN NOTIFICATIONS] Component mounted"
    );

    return () => {
      console.log(
        "[DEVAD ADMIN NOTIFICATIONS] Component unmounted"
      );
    };
  }, []);

  // ==========================================================
  // FETCH
  // ==========================================================

  useEffect(() => {
    console.log(
      "[DEVAD ADMIN NOTIFICATIONS] Fetching notifications..."
    );

    fetch().catch((err) => {
      console.error(
        "[DEVAD ADMIN NOTIFICATIONS ERROR] Initial fetch failed:",
        err
      );
    });
  }, [fetch]);

  // ==========================================================
  // WATCH STATE
  // ==========================================================

  useEffect(() => {
    console.log(
      "[DEVAD ADMIN NOTIFICATIONS] State changed:",
      {
        notificationCount: notifications.length,
        unreadCount,
        loading,
        markingRead,
        markingAllRead,
        error,
      }
    );
  }, [
    notifications.length,
    unreadCount,
    loading,
    markingRead,
    markingAllRead,
    error,
  ]);

  // ==========================================================
  // ERROR TOAST
  // ==========================================================

  useEffect(() => {
    if (!error) return;

    console.error(
      "[DEVAD ADMIN NOTIFICATIONS ERROR] Store error:",
      error
    );

    toast.error(error);

    clearError();
  }, [error, clearError]);

  // ==========================================================
  // MARK ONE READ
  // ==========================================================

  const handleMarkRead = async (id) => {
    console.log(
      "[DEVAD ADMIN NOTIFICATIONS] Marking notification as read:",
      id
    );

    try {
      await markRead(id);

      console.log(
        "[DEVAD ADMIN NOTIFICATIONS] Notification marked as read:",
        id
      );
    } catch (error) {
      console.error(
        "[DEVAD ADMIN NOTIFICATIONS ERROR] Failed to mark notification as read:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to mark notification as read"
      );
    }
  };

  // ==========================================================
  // MARK ALL READ
  // ==========================================================

  const handleMarkAllRead = async () => {
    console.log(
      "[DEVAD ADMIN NOTIFICATIONS] Mark all notifications as read"
    );

    try {
      await markAllRead();

      console.log(
        "[DEVAD ADMIN NOTIFICATIONS] All notifications marked as read"
      );

      toast.success("All notifications marked as read");
    } catch (error) {
      console.error(
        "[DEVAD ADMIN NOTIFICATIONS ERROR] Failed to mark all as read:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to mark all notifications as read"
      );
    }
  };

  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh = async () => {
    console.log(
      "[DEVAD ADMIN NOTIFICATIONS] Refreshing notifications..."
    );

    try {
      await fetch();

      console.log(
        "[DEVAD ADMIN NOTIFICATIONS] Notifications refreshed"
      );
    } catch (error) {
      console.error(
        "[DEVAD ADMIN NOTIFICATIONS ERROR] Refresh failed:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to refresh notifications"
      );
    }
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="space-y-5 fi">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="dsp text-xl font-bold text-text">
            Notifications
          </h1>

          {unreadCount > 0 ? (
            <p className="text-xs text-muted">
              {unreadCount} unread
            </p>
          ) : (
            <p className="text-xs text-muted">
              You're all caught up
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh */}

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="text-xs text-muted hover:text-text transition disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>

          {/* Mark all */}

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={markingAllRead}
              className="text-xs text-purple hover:underline disabled:opacity-50"
            >
              {markingAllRead
                ? "Marking..."
                : "Mark all read"}
            </button>
          )}
        </div>
      </div>

      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading && notifications.length === 0 ? (
        <div className="space-y-2">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="bg-surface border border-border rounded-2xl p-4 animate-pulse"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-border/40 shrink-0" />

                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-border/40 rounded w-1/3" />
                  <div className="h-3 bg-border/40 rounded w-3/4" />
                  <div className="h-2 bg-border/30 rounded w-1/5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        /* ====================================================
           EMPTY
           ==================================================== */

        <div className="text-center py-16 text-muted">
          <div className="text-5xl mb-3">
            🔔
          </div>

          <p className="text-sm">
            No notifications
          </p>

          <p className="text-xs mt-1 text-muted/60">
            New notifications will appear here.
          </p>
        </div>
      ) : (
        /* ====================================================
           NOTIFICATIONS
           ==================================================== */

        <div className="space-y-2">
          {notifications.map((notification) => {
            const isUnread = !notification.isRead;

            return (
              <div
                key={notification._id}
                onClick={() => {
                  if (
                    isUnread &&
                    !markingRead
                  ) {
                    handleMarkRead(
                      notification._id
                    );
                  }
                }}
                className={`
                  bg-surface
                  border
                  rounded-2xl
                  p-4
                  transition
                  ${
                    isUnread
                      ? "border-purple/40 bg-purple/5 cursor-pointer"
                      : "border-border hover:border-purple/20"
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  {/* ICON */}

                  <div
                    className={`
                      w-10
                      h-10
                      rounded-full
                      flex
                      items-center
                      justify-center
                      shrink-0
                      ${
                        isUnread
                          ? "bg-purple/10"
                          : "bg-border/20"
                      }
                    `}
                  >
                    <span className="text-xl">
                      🔔
                    </span>
                  </div>

                  {/* CONTENT */}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-xs font-semibold text-text">
                        {notification.title ||
                          "Notification"}
                      </p>

                      {isUnread && (
                        <Badge
                          variant="purple"
                          size="xs"
                        >
                          New
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-muted leading-relaxed">
                      {notification.message}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-[10px] text-muted/60">
                        {notification.createdAt
                          ? timeAgo(
                              notification.createdAt
                            )
                          : "Just now"}
                      </p>

                      {isUnread && (
                        <span className="text-[10px] text-purple/70">
                          • Click to mark as read
                        </span>
                      )}
                    </div>
                  </div>

                  {/* UNREAD INDICATOR */}

                  {isUnread && (
                    <div className="w-2 h-2 rounded-full bg-purple shrink-0 mt-2" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================
          DEBUG INFO
          ====================================================== */}

      {import.meta.env.DEV && (
        <div className="mt-6 p-3 rounded-xl border border-border bg-black/10">
          <p className="text-[10px] font-semibold text-muted mb-1">
            Notification Debug
          </p>

          <div className="text-[10px] text-muted/70 space-y-0.5">
            <p>
              Notifications:{" "}
              {notifications.length}
            </p>

            <p>
              Unread:{" "}
              {unreadCount}
            </p>

            <p>
              Loading:{" "}
              {String(loading)}
            </p>

            <p>
              Marking read:{" "}
              {String(markingRead)}
            </p>

            <p>
              Marking all:{" "}
              {String(markingAllRead)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}