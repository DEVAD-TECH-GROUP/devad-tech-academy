import { useEffect, useState } from "react";
import {
  getMyLiveClasses,
  createLiveClass,
  startLiveClass,
} from "../../services/instructor/liveClassService";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import EmptyState from "../../components/common/EmptyState";
import { SkeletonCard } from "../../components/common/Skeleton";
import { formatDate, formatTime } from "../../utils/formatDate";
import { toast } from "react-hot-toast";

export default function LiveClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: "",
    scheduledAt: "",
    duration: 120,
    maxParticipants: 100,
  });
  const [creating, setCreating] = useState(false);
  const [starting, setStarting] = useState(null);

  useEffect(() => {
    getMyLiveClasses()
      .then((r) => setClasses(r.data.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.scheduledAt)
      return toast.error("Title and date required");
    setCreating(true);
    try {
      const r = await createLiveClass(form);
      setClasses((c) => [r.data.data, ...c]);
      setShowCreate(false);
      setForm({
        title: "",
        scheduledAt: "",
        duration: 120,
        maxParticipants: 100,
      });
      toast.success("Live class created! 📡");
    } catch {
      toast.error("Failed to create class");
    } finally {
      setCreating(false);
    }
  };

  const handleStart = async (id) => {
    setStarting(id);
    try {
      const r = await startLiveClass(id);
      setClasses((c) =>
        c.map((x) => (x._id === id ? { ...x, status: "live" } : x)),
      );
      if (r.data.data?.meetingRoom?.roomUrl) {
        window.open(r.data.data.meetingRoom.roomUrl, "_blank");
      }
      toast.success("Live class started! 🔴");
    } catch {
      toast.error("Failed to start class");
    } finally {
      setStarting(null);
    }
  };

  const statusVariant = (s) =>
    ({ live: "green", scheduled: "blue", ended: "default" })[s] || "default";

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
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="dsp text-xl font-bold text-text">Live Classes</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-orange hover:bg-orange/90 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition"
        >
          + Schedule Class
        </button>
      </div>

      {classes.length === 0 ? (
        <EmptyState
          icon="📡"
          title="No live classes"
          message="Schedule your first live class"
          action={() => setShowCreate(true)}
          actionLabel="Schedule Class"
        />
      ) : (
        <div className="space-y-3">
          {classes.map((c) => (
            <div
              key={c._id}
              className="bg-surface border border-border rounded-2xl p-4 fi"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-semibold text-text">{c.title}</p>
                    <Badge variant={statusVariant(c.status)}>{c.status}</Badge>
                  </div>
                  <p className="text-xs text-muted mb-1">{c.course?.title}</p>
                  <div className="flex gap-3 text-xs text-muted">
                    {c.scheduledAt && (
                      <span>
                        📅 {formatDate(c.scheduledAt)} ·{" "}
                        {formatTime(c.scheduledAt)}
                      </span>
                    )}
                    <span>⏱ {c.duration} min</span>
                    <span>👥 {c.maxParticipants} max</span>
                  </div>
                </div>
                {c.status === "scheduled" && (
                  <button
                    onClick={() => handleStart(c._id)}
                    disabled={starting === c._id}
                    className="shrink-0 text-xs bg-green/10 text-green border border-green/20 px-3 py-1.5 rounded-xl hover:bg-green/20 transition disabled:opacity-50"
                  >
                    {starting === c._id ? "Starting..." : "Start Class"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Schedule Live Class"
        size="sm"
      >
        <div className="space-y-3">
          <Input
            label="Title *"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g. React Hooks Deep Dive"
            required
          />
          <Input
            label="Scheduled Date & Time *"
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) =>
              setForm((f) => ({ ...f, scheduledAt: e.target.value }))
            }
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Duration (min)"
              type="number"
              value={form.duration}
              onChange={(e) =>
                setForm((f) => ({ ...f, duration: Number(e.target.value) }))
              }
            />
            <Input
              label="Max Participants"
              type="number"
              value={form.maxParticipants}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  maxParticipants: Number(e.target.value),
                }))
              }
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreate(false)}
              className="flex-1 bg-surfaceHigh border border-border text-text text-sm py-2.5 rounded-xl hover:border-orange/40 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="flex-1 bg-orange hover:bg-orange/90 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-50"
            >
              {creating ? "Scheduling..." : "Schedule"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
