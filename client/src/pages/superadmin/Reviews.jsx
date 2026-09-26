import { useEffect, useState } from "react";
import {
  getAllReviews,
  getFlaggedReviews,
  removeReview,
  dismissFlag,
} from "../../services/superadmin/reviewService";
import Tabs from "../../components/common/Tabs";
import Avatar from "../../components/common/Avatar";
import { timeAgo } from "../../utils/formatDate";
import { SkeletonCard } from "../../components/common/Skeleton";
import { toast } from "react-hot-toast";

export default function AdminReviews() {
  const [tab, setTab] = useState("all");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const fn = tab === "flagged" ? getFlaggedReviews : getAllReviews;
      const r = await fn();
      setReviews(r.data.data?.data || r.data.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [tab]);

  const handleRemove = async (id) => {
    try { await removeReview(id); setReviews((r) => r.filter((x) => x._id !== id)); toast.success("Removed"); }
    catch { toast.error("Failed"); }
  };

  const handleDismiss = async (id) => {
    try { await dismissFlag(id); setReviews((r) => r.filter((x) => x._id !== id)); toast.success("Flag dismissed"); }
    catch { toast.error("Failed"); }
  };

  return (
    <div className="space-y-5 fi">
      <h1 className="dsp text-xl font-bold text-text">Reviews</h1>

      <Tabs
        tabs={[
          { key: "all", label: "All Reviews" },
          { key: "flagged", label: "Flagged", icon: "🚩" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 text-muted text-sm">No reviews</div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r._id} className="bg-surface border border-border rounded-2xl p-4 fi">
              <div className="flex items-start gap-3">
                <Avatar user={r.student} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-semibold text-text">{r.student?.firstName} {r.student?.lastName}</p>
                    <span className="text-yellow text-xs">{"★".repeat(r.rating)}</span>
                  </div>
                  <p className="text-xs text-muted mb-1">{r.course?.title}</p>
                  <p className="text-sm text-text mb-1">{r.review}</p>
                  <p className="text-[10px] text-muted">{timeAgo(r.createdAt)}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {tab === "flagged" && (
                    <button onClick={() => handleDismiss(r._id)} className="text-xs text-muted hover:text-text border border-border px-2 py-1 rounded-lg transition">Dismiss</button>
                  )}
                  <button onClick={() => handleRemove(r._id)} className="text-xs text-red hover:underline">Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}