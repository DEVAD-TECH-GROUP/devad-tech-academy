import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourse, updateCourse } from "../../../services/instructor/courseService";
import Input from "../../../components/common/Input";
import Textarea from "../../../components/common/Textarea";
import Select from "../../../components/common/Select";
import { toast } from "react-hot-toast";
import { SkeletonCard } from "../../../components/common/Skeleton";

export default function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCourse(id)
      .then((r) => {
        const c = r.data.data;
        setForm({
          title: c.title || "",
          description: c.description || "",
          shortDescription: c.shortDescription || "",
          level: c.level || "beginner",
          language: c.language || "English",
          price: c.price || 0,
        });
      })
      .catch(() => toast.error("Course not found"));
  }, [id]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCourse(id, form);
      toast.success("Course updated! ✅");
      navigate("/instructor/courses");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <div className="space-y-4">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>;

  return (
    <div className="space-y-5 fi max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/instructor/courses")} className="text-muted hover:text-text transition text-sm">← Back</button>
        <h1 className="dsp text-xl font-bold text-text">Edit Course</h1>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
        <Input label="Title *" value={form.title} onChange={(e) => set("title", e.target.value)} />
        <Input label="Short Description" value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} />
        <Textarea label="Description *" value={form.description} onChange={(e) => set("description", e.target.value)} rows={5} />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Level" value={form.level} onChange={(e) => set("level", e.target.value)}
            options={[
              { value: "beginner", label: "Beginner" },
              { value: "intermediate", label: "Intermediate" },
              { value: "advanced", label: "Advanced" },
            ]} />
          <Input label="Price (₦)" type="number" value={form.price} onChange={(e) => set("price", Number(e.target.value))} />
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate("/instructor/courses")}
            className="flex-1 bg-surfaceHigh border border-border text-text font-semibold py-3 rounded-xl text-sm hover:border-orange/40 transition">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 bg-orange hover:bg-orange/90 text-white font-semibold py-3 rounded-xl text-sm transition disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}