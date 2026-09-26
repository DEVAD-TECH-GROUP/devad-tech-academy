import { useEffect, useState } from "react";
import { getAllLiveClasses } from "../../services/superadmin/liveClassService";
import Badge from "../../components/common/Badge";
import { formatDate, formatTime } from "../../utils/formatDate";
import { SkeletonCard } from "../../components/common/Skeleton";
import Pagination from "../../components/common/Pagination";

export default function AdminLiveClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const r = await getAllLiveClasses({ page, limit: 20 });
      setClasses(r.data.data?.data || []);
      setTotalPages(r.data.data?.totalPages || 1);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  const statusVariant = (s) => ({ live: "green", scheduled: "blue", ended: "default" }[s] || "default");

  return (
    <div className="space-y-5 fi">
      <h1 className="dsp text-xl font-bold text-text">Live Classes</h1>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : (
        <div className="space-y-3">
          {classes.length === 0 && <p className="text-center text-muted text-sm py-16">No live classes</p>}
          {classes.map((c) => (
            <div key={c._id} className="bg-surface border border-border rounded-2xl p-4 fi">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-semibold text-text">{c.title}</p>
                    <Badge variant={statusVariant(c.status)} size="xs">{c.status}</Badge>
                    {c.status === "live" && (
                      <span className="flex items-center gap-1 text-xs text-green">
                        <span className="w-1.5 h-1.5 bg-green rounded-full animate-pulse" /> LIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted">{c.course?.title}</p>
                  <p className="text-xs text-muted">
                    {c.instructor?.firstName} {c.instructor?.lastName}
                  </p>
                  {c.scheduledAt && (
                    <p className="text-xs text-muted">
                      📅 {formatDate(c.scheduledAt)} · {formatTime(c.scheduledAt)}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted">⏱ {c.duration}m</p>
                  <p className="text-xs text-muted">👥 {c.maxParticipants}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onNext={() => setPage((p) => p + 1)} onPrev={() => setPage((p) => p - 1)} onGoTo={setPage} />
    </div>
  );
}