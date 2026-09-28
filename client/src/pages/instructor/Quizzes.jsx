import { useEffect, useState } from "react";
import { getMyQuizzes, createQuiz, addQuestion, getQuizResults } from "../../services/instructor/quizService";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import EmptyState from "../../components/common/EmptyState";
import { SkeletonCard } from "../../components/common/Skeleton";
import { toast } from "react-hot-toast";

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", duration: 30, passingScore: 70, maxAttempts: 3 });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    getMyQuizzes()
      .then((r) => setQuizzes(r.data.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.title.trim()) return toast.error("Title required");
    setCreating(true);
    try {
      const r = await createQuiz(form);
      setQuizzes((q) => [r.data.data, ...q]);
      setShowCreate(false);
      setForm({ title: "", duration: 30, passingScore: 70, maxAttempts: 3 });
      toast.success("Quiz created! 🧠");
    } catch { toast.error("Failed to create quiz"); }
    finally { setCreating(false); }
  };

  if (loading) return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>;

  return (
    <div className="space-y-5 fi">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="dsp text-xl font-bold text-text">Quizzes</h1>
        <button onClick={() => setShowCreate(true)}
          className="bg-orange hover:bg-orange/90 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition">
          + Create Quiz
        </button>
      </div>

      {quizzes.length === 0
        ? <EmptyState icon="🧠" title="No quizzes" message="Create your first quiz" action={() => setShowCreate(true)} actionLabel="Create Quiz" />
        : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quizzes.map((q) => (
              <div key={q._id} className="bg-surface border border-border rounded-2xl p-4 fi">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-semibold text-text flex-1 mr-2">{q.title}</p>
                  <Badge variant={q.status === "active" ? "green" : "default"}>{q.status}</Badge>
                </div>
                <p className="text-xs text-muted mb-3">{q.course?.title}</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    ["❓", q.totalQuestions || 0, "Questions"],
                    ["⏱", q.duration, "Minutes"],
                    ["🎯", `${q.passingScore}%`, "Pass"],
                  ].map(([icon, val, label]) => (
                    <div key={label} className="bg-surfaceHigh rounded-lg p-2">
                      <div className="text-sm">{icon}</div>
                      <div className="text-xs font-bold text-text">{val}</div>
                      <div className="text-[10px] text-muted">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Quiz" size="sm">
        <div className="space-y-3">
          <Input label="Quiz Title *" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. React Fundamentals Quiz" required />
          <div className="grid grid-cols-3 gap-2">
            <Input label="Duration (min)" type="number" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: Number(e.target.value) }))} />
            <Input label="Pass Score %" type="number" value={form.passingScore} onChange={(e) => setForm((f) => ({ ...f, passingScore: Number(e.target.value) }))} />
            <Input label="Max Attempts" type="number" value={form.maxAttempts} onChange={(e) => setForm((f) => ({ ...f, maxAttempts: Number(e.target.value) }))} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowCreate(false)} className="flex-1 bg-surfaceHigh border border-border text-text text-sm py-2.5 rounded-xl hover:border-orange/40 transition">Cancel</button>
            <button onClick={handleCreate} disabled={creating} className="flex-1 bg-orange hover:bg-orange/90 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-50">
              {creating ? "Creating..." : "Create Quiz"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}