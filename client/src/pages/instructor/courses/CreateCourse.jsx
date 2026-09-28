import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCourse } from "../../../services/instructor/courseService";
import Input from "../../../components/common/Input";
import Textarea from "../../../components/common/Textarea";
import Select from "../../../components/common/Select";
import { toast } from "react-hot-toast";

export default function CreateCourse() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", description: "", shortDescription: "",
    level: "beginner", language: "English", price: 0,
    category: "", tags: [],
  });
  const [creating, setCreating] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleCreate = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      return toast.error("Title and description are required");
    }
    setCreating(true);
    try {
      const r = await createCourse(form);
      toast.success("Course created! Now add content 🎉");
      navigate(`/instructor/courses/${r.data.data._id}/build`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Creation failed");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-5 fi max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/instructor/courses")} className="text-muted hover:text-text transition text-sm">← Back</button>
        <h1 className="dsp text-xl font-bold text-text">Create New Course</h1>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
        <h2 className="dsp text-sm font-bold text-text">Course Details</h2>
        <Input label="Course Title *" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Complete React Development Course" required />
        <Input label="Short Description *" value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} placeholder="One line about your course" />
        <Textarea label="Full Description *" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Detailed description of what students will learn..." rows={5} required />

        <div className="grid grid-cols-2 gap-3">
          <Select label="Level" value={form.level} onChange={(e) => set("level", e.target.value)}
            options={[
              { value: "beginner", label: "Beginner" },
              { value: "intermediate", label: "Intermediate" },
              { value: "advanced", label: "Advanced" },
            ]} />
          <Select label="Language" value={form.language} onChange={(e) => set("language", e.target.value)}
            options={[
              { value: "English", label: "English" },
              { value: "Pidgin", label: "Pidgin English" },
              { value: "Yoruba", label: "Yoruba" },
              { value: "Igbo", label: "Igbo" },
              { value: "Hausa", label: "Hausa" },
            ]} />
        </div>

        <Input label="Price (₦)" type="number" value={form.price} onChange={(e) => set("price", Number(e.target.value))} placeholder="0 for free" />

        <div className="flex gap-3">
          <button onClick={() => navigate("/instructor/courses")}
            className="flex-1 bg-surfaceHigh border border-border text-text font-semibold py-3 rounded-xl text-sm hover:border-orange/40 transition">
            Cancel
          </button>
          <button onClick={handleCreate} disabled={creating}
            className="flex-1 bg-orange hover:bg-orange/90 text-white font-semibold py-3 rounded-xl text-sm transition disabled:opacity-50">
            {creating ? "Creating..." : "Create Course →"}
          </button>
        </div>
      </div>
    </div>
  );
}

