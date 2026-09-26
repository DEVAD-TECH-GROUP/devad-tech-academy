import { useEffect, useState } from "react";
import {
  getAllDiscussions,
  deleteDiscussion,
  getFlaggedContent,
  removeFlaggedContent,
} from "../../services/superadmin/communityService";
import Tabs from "../../components/common/Tabs";
import { timeAgo } from "../../utils/formatDate";
import { SkeletonCard } from "../../components/common/Skeleton";
import { toast } from "react-hot-toast";

export default function AdminCommunity() {
  const [tab, setTab] = useState("discussions");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loaders = {
    discussions: getAllDiscussions,
    flagged: getFlaggedContent,
  };

  const load = async () => {
    setLoading(true);
    try {
      const r = await loaders[tab]();
      setData(r.data.data?.data || r.data.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [tab]);

  const handleDelete = async (id) => {
    try {
      await deleteDiscussion(id);
      setData((d) => d.filter((x) => x._id !== id));
      toast.success("Discussion removed");
    } catch { toast.error("Failed"); }
  };

  const handleRemoveFlagged = async (id) => {
    try {
      await removeFlaggedContent(id);
      setData((d) => d.filter((x) => x._id !== id));
      toast.success("Content removed");
    } catch { toast.error("Failed"); }
  };

  return (
    <div className="space-y-5 fi">
      <h1 className="dsp text-xl font-bold text-text">Community</h1>

      <Tabs
        tabs={[
          { key: "discussions", label: "Discussions", icon: "💬" },
          { key: "flagged", label: "Flagged", icon: "🚩" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : data.length === 0 ? (
        <div className="text-center py-16 text-muted text-sm">No {tab} content</div>
      ) : (
        <div className="space-y-3">
          {data.map((item) => (
            <div key={item._id} className="bg-surface border border-border rounded-2xl p-4 fi">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text mb-0.5 truncate">
                    {item.title || item.reason || "Flagged Content"}
                  </p>
                  <p className="text-xs text-muted">{timeAgo(item.createdAt)}</p>
                  {item.content && <p className="text-xs text-muted mt-1 line-clamp-2">{item.content}</p>}
                </div>
                <button
                  onClick={() => tab === "flagged" ? handleRemoveFlagged(item._id) : handleDelete(item._id)}
                  className="text-xs text-red hover:underline shrink-0"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
