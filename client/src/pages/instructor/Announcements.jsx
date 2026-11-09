// src/pages/instructor/Announcements.jsx
import { useEffect, useState } from "react";
import {
  getMyAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from "../../services/instructor/anouncementService";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import EmptyState from "../../components/common/EmptyState";
import { formatDate } from "../../utils/formatDate";
import { toast } from "react-hot-toast";
import { SkeletonCard } from "../../components/common/Skeleton";

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", message: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    getMyAnnouncements()
      .then((r) => setAnnouncements(r.data.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.message.trim())
      return toast.error("Fill all fields");
    setCreating(true);
    try {
      const r = await createAnnouncement(form);
      setAnnouncements((a) => [r.data.data, ...a]);
      setShowCreate(false);
      setForm({ title: "", message: "" });
      toast.success("Announcement sent! 📢");
    } catch {
      toast.error("Failed");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAnnouncement(id);
      setAnnouncements((a) => a.filter((x) => x._id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

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
      <div className="flex items-center justify-between gap-3">
        <h1 className="dsp text-xl font-bold text-text">Announcements</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-orange hover:bg-orange/90 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition"
        >
          + New
        </button>
      </div>

      {announcements.length === 0 ? (
        <EmptyState
          icon="📢"
          title="No announcements"
          message="Send your first announcement to students"
          action={() => setShowCreate(true)}
          actionLabel="Create Announcement"
        />
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div
              key={a._id}
              className="bg-surface border border-border rounded-2xl p-4 fi"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-text mb-1">
                    {a.title}
                  </p>
                  <p className="text-xs text-muted mb-2 line-clamp-2">
                    {a.message}
                  </p>
                  <p className="text-[10px] text-muted">
                    {formatDate(a.publishedAt)}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(a._id)}
                  className="text-muted hover:text-red transition text-sm shrink-0"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="New Announcement"
      >
        <div className="space-y-3">
          <Input
            label="Title *"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Announcement title"
            required
          />
          <Textarea
            label="Message *"
            value={form.message}
            onChange={(e) =>
              setForm((f) => ({ ...f, message: e.target.value }))
            }
            placeholder="Write your message to students..."
            rows={5}
            required
          />
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
              {creating ? "Sending..." : "Send Announcement"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
