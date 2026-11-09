// src/pages/instructor/Calendar.jsx
import { useEffect, useState } from "react";
import { getDashboardCalendar } from "../../services/instructor/dashboardService";
import { formatDate, formatTime } from "../../utils/formatDate";
import { SkeletonCard } from "../../components/common/Skeleton";

export default function InstructorCalendar() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardCalendar()
      .then((r) => setClasses(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );

  return (
    <div className="space-y-5 fi">
      <h1 className="dsp text-xl font-bold text-text">Calendar</h1>
      <div className="bg-surface border border-border rounded-2xl p-4">
        <h2 className="dsp text-sm font-bold text-text mb-3">
          Upcoming Live Classes
        </h2>
        {classes.length === 0 ? (
          <p className="text-xs text-muted text-center py-8">
            No upcoming classes
          </p>
        ) : (
          classes.map((c) => (
            <div
              key={c._id}
              className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0"
            >
              <div className="w-2 h-2 rounded-full bg-green shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-medium text-text">{c.title}</p>
                <p className="text-[10px] text-muted">
                  {formatDate(c.scheduledAt)} · {formatTime(c.scheduledAt)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
