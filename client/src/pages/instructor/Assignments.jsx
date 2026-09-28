import { useEffect, useState } from "react";
import { getMyAssignments, createAssignment, getSubmissions, gradeSubmission } from "../../services/instructor/assignmentService";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import EmptyState from "../../components/common/EmptyState";
import { SkeletonCard } from "../../components/common/Skeleton";
import { formatDate } from "../../utils/formatDate";
import { toast } from "react-hot-toast";

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showSubmissions, setShowSubmissions] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [grading, setGrading] = useState(null);
  const [gradeForm, setGradeForm] = useState({ grade: "", feedback: "" });
  const [form, setForm] = useState({ title: "", description: "", dueDate: "", maxScore: 100 });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    getMyAssignments()
      .then((r) => setAssignments(r.data.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.title.trim()) return toast.error("Title required");
    setCreating(true);
    try {
      const r = await createAssignment(form);
      setAssignments((a) => [r.data.data, ...a]);
      setShowCreate(false);
      setForm({ title: "", description: "", dueDate: "", maxScore: 100 });
      toast.success("Assignment created! 📝");
    } catch { toast.error("Failed to create assignment"); }
    finally { setCreating(false); }
  };

  const handleViewSubmissions = async (id) => {
    setShowSubmissions(id);
    try {
      const r = await getSubmissions(id);
      setSubmissions(r.data.data || []);
    } catch {}
  };

  const handleGrade = async () => {
    if (!gradeForm.grade) return toast.error("Grade required");
    try {
      await gradeSubmission(grading._id, gradeForm);
      setSubmissions((s) => s.map((x) =>
        x._id === grading._id ? { ...x, status: "graded", grade: gradeForm.grade } : x
      ));
      setGrading(null);
      setGradeForm({ grade: "", feedback: "" });
      toast.success("Graded! ✅");
    } catch { toast.error("Grading failed"); }
  };

  if (loading) return <div className="space-y-3">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>;

  return (
    <div className="space-y-5 fi">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="dsp text-xl font-bold text-text">Assignments</h1>
        <button onClick={() => setShowCreate(true)}
          className="bg-orange hover:bg-orange/90 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition">
          + Create Assignment
        </button>
      </div>

      {assignments.length === 0
        ? <EmptyState icon="📝" title="No assignments" message="Create your first assignment" action={() => setShowCreate(true)} actionLabel="Create Assignment" />
        : (
          <div className="space-y-3">
            {assignments.map((a) => (
              <div key={a._id} className="bg-surface border border-border rounded-2xl p-4 fi">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text mb-1">{a.title}</p>
                    <p className="text-xs text-muted mb-2">{a.course?.title}</p>
                    <div className="flex gap-2 flex-wrap text-xs text-muted">
                      <span>📅 Due: {formatDate(a.dueDate)}</span>
                      <span>📤 {a.totalSubmissions || 0} submissions</span>
                      <span>🎯 Max: {a.maxScore}</span>
                    </div>
                  </div>
                  <button onClick={() => handleViewSubmissions(a._id)}
                    className="text-xs bg-orange/10 text-orange border border-orange/20 px-3 py-1.5 rounded-xl hover:bg-orange/20 transition shrink-0">
                    View Submissions
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Assignment">
        <div className="space-y-3">
          <Input label="Title *" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Assignment title" required />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Instructions..." rows={4} />
          <Input label="Due Date" type="datetime-local" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
          <Input label="Max Score" type="number" value={form.maxScore} onChange={(e) => setForm((f) => ({ ...f, maxScore: Number(e.target.value) }))} />
          <div className="flex gap-3">
            <button onClick={() => setShowCreate(false)} className="flex-1 bg-surfaceHigh border border-border text-text text-sm py-2.5 rounded-xl hover:border-orange/40 transition">Cancel</button>
            <button onClick={handleCreate} disabled={creating} className="flex-1 bg-orange hover:bg-orange/90 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-50">
              {creating ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Submissions Modal */}
      <Modal isOpen={!!showSubmissions} onClose={() => setShowSubmissions(null)} title="Submissions" size="lg">
        <div className="space-y-3">
          {submissions.length === 0
            ? <p className="text-xs text-muted text-center py-8">No submissions yet</p>
            : submissions.map((s) => (
              <div key={s._id} className="bg-surfaceHigh border border-border rounded-xl p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-text">{s.student?.firstName} {s.student?.lastName}</p>
                    <p className="text-[10px] text-muted">{formatDate(s.submittedAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={s.status === "graded" ? "green" : "yellow"}>{s.status}</Badge>
                    {s.status !== "graded" && (
                      <button onClick={() => setGrading(s)}
                        className="text-xs bg-green/10 text-green border border-green/20 px-2 py-1 rounded-lg hover:bg-green/20 transition">
                        Grade
                      </button>
                    )}
                    {s.grade && <span className="text-xs text-green font-bold">{s.grade}/100</span>}
                  </div>
                </div>
                {s.content && <p className="text-xs text-muted mt-2 line-clamp-2">{s.content}</p>}
              </div>
            ))
          }
        </div>
      </Modal>

      {/* Grade Modal */}
      <Modal isOpen={!!grading} onClose={() => setGrading(null)} title="Grade Submission" size="sm">
        <div className="space-y-3">
          <Input label="Grade (0-100) *" type="number" value={gradeForm.grade} onChange={(e) => setGradeForm((f) => ({ ...f, grade: e.target.value }))} placeholder="85" required />
          <Textarea label="Feedback" value={gradeForm.feedback} onChange={(e) => setGradeForm((f) => ({ ...f, feedback: e.target.value }))} placeholder="Your feedback..." rows={3} />
          <div className="flex gap-3">
            <button onClick={() => setGrading(null)} className="flex-1 bg-surfaceHigh border border-border text-text text-sm py-2.5 rounded-xl hover:border-orange/40 transition">Cancel</button>
            <button onClick={handleGrade} className="flex-1 bg-green/10 text-green border border-green/20 text-sm font-semibold py-2.5 rounded-xl hover:bg-green/20 transition">Submit Grade</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
