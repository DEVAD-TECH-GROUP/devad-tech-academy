import Badge from "../../common/Badge";
import { formatDate, formatTime } from "../../../utils/formatDate";

export default function LiveClassCard({
  liveClass,
  onStart,
  onDelete,
  starting,
}) {
  const statusVariant =
    { live: "green", scheduled: "blue", ended: "default" }[liveClass.status] ||
    "default";

  return (
    <div className="bg-surface border border-border rounded-2xl p-4 fi">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-sm font-semibold text-text">{liveClass.title}</p>
            <Badge variant={statusVariant} size="xs">
              {liveClass.status}
            </Badge>
            {liveClass.status === "live" && (
              <span className="flex items-center gap-1 text-xs text-green">
                <span className="w-1.5 h-1.5 bg-green rounded-full animate-pulse" />{" "}
                LIVE
              </span>
            )}
          </div>
          <p className="text-xs text-muted mb-1">{liveClass.course?.title}</p>
          {liveClass.scheduledAt && (
            <p className="text-xs text-muted">
              📅 {formatDate(liveClass.scheduledAt)} ·{" "}
              {formatTime(liveClass.scheduledAt)}
            </p>
          )}
          <p className="text-xs text-muted">
            ⏱ {liveClass.duration}m · 👥 {liveClass.maxParticipants} max
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {liveClass.status === "scheduled" && (
            <button
              onClick={() => onStart?.(liveClass._id)}
              disabled={starting}
              className="text-xs bg-green/10 text-green border border-green/20 px-3 py-1.5 rounded-xl hover:bg-green/20 transition disabled:opacity-50"
            >
              {starting ? "..." : "Start"}
            </button>
          )}
          <button
            onClick={() => onDelete?.(liveClass._id)}
            className="text-xs text-muted hover:text-red transition border border-border px-3 py-1.5 rounded-xl hover:border-red/40"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
