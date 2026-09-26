import { useEffect, useState } from "react";
import {
  getLearningPaths,
  createLearningPath,
  deleteLearningPath,
} from "../../services/superadmin/learningPathService";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import EmptyState from "../../components/common/EmptyState";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { SkeletonCard } from "../../components/common/Skeleton";
import { toast } from "react-hot-toast";

export default function LearningPaths() {
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await getLearningPaths();
      setPaths(r.data.data?.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.title.trim()) return toast.error("Title required");
    setCreating(true);
    try {
      const r = await createLearningPath(form);
      setPaths((p) => [r.data.data, ...p]);
      setShowCreate(false);
      setForm({ title: "", description: "" });
      toast.success("Learning path created! 🗺️");
    } catch { toast.error("Failed"); }
    finally { setCreating(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteLearningPath(confirmDelete._id);
      setPaths((p) => p.filter((x) => x._id !== confirmDelete._id));
      setConfirmDelete(null);
      toast.success("Deleted");
    } catch { toast.error("Failed"); }
    finally { setDeleting(false); }
  };

  return (
    <div className="space-y-5 fi">
      <div className="flex items-center justify-between gap-3">
        <h1 className="dsp text-xl font-bold text-text">Learning Paths</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-purple hover:bg-purple/90 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition"
        >
          + Create Path
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : paths.length === 0 ? (
        <EmptyState
          icon="🗺️"
          title="No learning paths"
          message="Create structured learning paths for your students"
          action={() => setShowCreate(true)}
          actionLabel="Create Path"
        />
      ) : (
        <div className="space-y-3">
          {paths.map((p) => (
            <div key={p._id} className="bg-surface border border-border rounded-2xl p-4 fi">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text mb-1">{p.title}</p>
                  <p className="text-xs text-muted mb-2">{p.description}</p>
                  <div className="flex gap-3 text-xs text-muted">
                    <span>📚 {p.requiredCourses?.length || 0} required</span>
                    <span>👥 {p.totalEnrolled || 0} enrolled</span>
                  </div>
                </div>
                <button
                  onClick={() => setConfirmDelete(p)}
                  className="text-muted hover:text-red transition text-sm shrink-0"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Learning Path" size="sm">
        <div className="space-y-3">
          <Input label="Title *" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Frontend Developer Path" required />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Describe this learning path..." rows={3} />
          <div className="flex gap-3">
            <button onClick={() => setShowCreate(false)} className="flex-1 bg-surfaceHigh border border-border text-text text-sm py-2.5 rounded-xl hover:border-purple/40 transition">Cancel</button>
            <button onClick={handleCreate} disabled={creating} className="flex-1 bg-purple hover:bg-purple/90 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-50">
              {creating ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Delete Learning Path"
        message={`Delete "${confirmDelete?.title}"?`}
        loading={deleting}
      />
    </div>
  );
}
