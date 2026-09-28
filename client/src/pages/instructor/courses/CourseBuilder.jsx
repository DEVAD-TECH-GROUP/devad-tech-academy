import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourse } from "../../../services/instructor/courseService";
import { getModules, createModule, deleteModule, reorderModules } from "../../../services/instructor/moduleService";
import { getLessons, createLesson, deleteLesson } from "../../../services/instructor/lessonService";
import Input from "../../../components/common/Input";
import Select from "../../../components/common/Select";
import Modal from "../../../components/common/Modal";
import { toast } from "react-hot-toast";
import { SkeletonCard } from "../../../components/common/Skeleton";

export default function CourseBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [lessons, setLessons] = useState({});
  const [addingModule, setAddingModule] = useState(false);
  const [moduleTitle, setModuleTitle] = useState("");
  const [addingLesson, setAddingLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState({ title: "", type: "video", duration: 0 });

  useEffect(() => {
    Promise.all([getCourse(id), getModules(id)])
      .then(([c, m]) => { setCourse(c.data.data); setModules(m.data.data || []); })
      .catch(() => toast.error("Course not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const loadLessons = async (moduleId) => {
    if (lessons[moduleId]) return;
    const r = await getLessons(moduleId);
    setLessons((l) => ({ ...l, [moduleId]: r.data.data || [] }));
  };

  const handleExpand = (moduleId) => {
    if (expanded === moduleId) { setExpanded(null); return; }
    setExpanded(moduleId);
    loadLessons(moduleId);
  };

  const handleAddModule = async () => {
    if (!moduleTitle.trim()) return toast.error("Module title required");
    try {
      const r = await createModule(id, { title: moduleTitle, order: modules.length + 1 });
      setModules((m) => [...m, r.data.data]);
      setModuleTitle("");
      setAddingModule(false);
      toast.success("Module added! 📦");
    } catch { toast.error("Failed to add module"); }
  };

  const handleDeleteModule = async (moduleId) => {
    try {
      await deleteModule(id, moduleId);
      setModules((m) => m.filter((x) => x._id !== moduleId));
      toast.success("Module deleted");
    } catch { toast.error("Failed to delete module"); }
  };

  const handleAddLesson = async () => {
    if (!lessonForm.title.trim()) return toast.error("Lesson title required");
    try {
      const r = await createLesson(addingLesson, { ...lessonForm, order: (lessons[addingLesson]?.length || 0) + 1 });
      setLessons((l) => ({ ...l, [addingLesson]: [...(l[addingLesson] || []), r.data.data] }));
      setLessonForm({ title: "", type: "video", duration: 0 });
      setAddingLesson(null);
      toast.success("Lesson added! 🎥");
    } catch { toast.error("Failed to add lesson"); }
  };

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>;

  return (
    <div className="space-y-5 fi">
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => navigate("/instructor/courses")} className="text-muted hover:text-text transition text-sm">← Courses</button>
        <h1 className="dsp text-xl font-bold text-text">{course?.title}</h1>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="dsp text-sm font-bold text-text">Course Content</h2>
          <button onClick={() => setAddingModule(true)}
            className="text-xs bg-orange/10 text-orange border border-orange/20 px-3 py-1.5 rounded-xl hover:bg-orange/20 transition">
            + Add Module
          </button>
        </div>

        {modules.length === 0
          ? <p className="text-xs text-muted text-center py-8">No modules yet. Add your first module!</p>
          : (
            <div className="space-y-2">
              {modules.map((m) => (
                <div key={m._id} className="border border-border rounded-xl overflow-hidden">
                  <div
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-surfaceHigh transition"
                    onClick={() => handleExpand(m._id)}>
                    <div className="flex items-center gap-2">
                      <span className="text-muted text-xs">{expanded === m._id ? "▾" : "▸"}</span>
                      <span className="text-sm font-medium text-text">{m.title}</span>
                      <span className="text-xs text-muted">({m.totalLessons || 0} lessons)</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteModule(m._id); }}
                      className="text-muted hover:text-red transition text-xs">Delete</button>
                  </div>

                  {expanded === m._id && (
                    <div className="border-t border-border bg-surfaceHigh p-3 space-y-2">
                      {(lessons[m._id] || []).map((l) => (
                        <div key={l._id} className="flex items-center gap-2 py-1.5">
                          <span className="text-base">{l.type === "video" ? "🎥" : l.type === "text" ? "📄" : "❓"}</span>
                          <span className="text-xs text-text flex-1">{l.title}</span>
                          <span className="text-[10px] text-muted">{l.duration}m</span>
                        </div>
                      ))}
                      <button onClick={() => setAddingLesson(m._id)}
                        className="text-xs text-orange hover:underline mt-1">+ Add Lesson</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Add Module Modal */}
      <Modal isOpen={addingModule} onClose={() => setAddingModule(false)} title="Add Module" size="sm">
        <Input label="Module Title" value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} placeholder="e.g. Introduction to React" required />
        <div className="flex gap-3 mt-4">
          <button onClick={() => setAddingModule(false)}
            className="flex-1 bg-surfaceHigh border border-border text-text text-sm py-2.5 rounded-xl hover:border-orange/40 transition">
            Cancel
          </button>
          <button onClick={handleAddModule}
            className="flex-1 bg-orange hover:bg-orange/90 text-white text-sm font-semibold py-2.5 rounded-xl transition">
            Add Module
          </button>
        </div>
      </Modal>

      {/* Add Lesson Modal */}
      <Modal isOpen={!!addingLesson} onClose={() => setAddingLesson(null)} title="Add Lesson" size="sm">
        <div className="space-y-3">
          <Input label="Lesson Title" value={lessonForm.title} onChange={(e) => setLessonForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. What is React?" required />
          <Select label="Lesson Type" value={lessonForm.type} onChange={(e) => setLessonForm((f) => ({ ...f, type: e.target.value }))}
            options={[{ value: "video", label: "Video" }, { value: "text", label: "Text/Article" }, { value: "quiz", label: "Quiz" }]} />
          <Input label="Duration (minutes)" type="number" value={lessonForm.duration} onChange={(e) => setLessonForm((f) => ({ ...f, duration: Number(e.target.value) }))} />
          <div className="flex gap-3">
            <button onClick={() => setAddingLesson(null)}
              className="flex-1 bg-surfaceHigh border border-border text-text text-sm py-2.5 rounded-xl hover:border-orange/40 transition">
              Cancel
            </button>
            <button onClick={handleAddLesson}
              className="flex-1 bg-orange hover:bg-orange/90 text-white text-sm font-semibold py-2.5 rounded-xl transition">
              Add Lesson
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
