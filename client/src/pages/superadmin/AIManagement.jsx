import { useEffect, useState } from "react";
import { getAIConfig, updateAIConfig, getAIUsage } from "../../services/superadmin/aiService";
import Toggle from "../../components/common/Toggle";
import { SkeletonCard } from "../../components/common/Skeleton";
import { toast } from "react-hot-toast";

export default function AIManagement() {
  const [config, setConfig] = useState({});
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getAIConfig(), getAIUsage()])
      .then(([c, u]) => { setConfig(c.data.data || {}); setUsage(u.data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try { await updateAIConfig(config); toast.success("AI config updated! 🤖"); }
    catch { toast.error("Failed"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>;

  return (
    <div className="space-y-5 fi max-w-2xl">
      <h1 className="dsp text-xl font-bold text-text">AI Management</h1>
      <p className="text-muted text-xs -mt-3">Powered by Claude AI 🤖</p>

      {/* Usage stats */}
      {usage && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Requests", value: usage.totalRequests || 0, color: "#818CF8" },
            { label: "Total Tokens", value: (usage.totalTokens || 0).toLocaleString(), color: "#34D399" },
            { label: "Unique Users", value: usage.uniqueUsers || 0, color: "#FBBF24" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-surface border border-border rounded-2xl p-4 text-center">
              <div className="dsp text-lg font-extrabold" style={{ color }}>{value}</div>
              <div className="text-xs text-muted mt-1">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Config */}
      <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
        <h2 className="dsp text-sm font-bold text-text">Feature Configuration</h2>
        {[
          { key: "quizGeneration", label: "Quiz Generation", desc: "Let instructors generate quizzes with AI" },
          { key: "assignmentGeneration", label: "Assignment Generation", desc: "Let instructors generate assignment briefs" },
          { key: "lessonOutline", label: "Lesson Outline", desc: "Generate lesson outlines automatically" },
          { key: "studentAssistant", label: "Student AI Assistant", desc: "Students can ask AI for help" },
          { key: "contentModeration", label: "Content Moderation", desc: "Auto-moderate community content" },
        ].map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
            <div>
              <p className="text-sm font-medium text-text">{label}</p>
              <p className="text-xs text-muted">{desc}</p>
            </div>
            <Toggle
              checked={config?.[key] !== false}
              onChange={(val) => setConfig((c) => ({ ...c, [key]: val }))}
            />
          </div>
        ))}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-purple hover:bg-purple/90 text-white font-semibold py-3 rounded-xl text-sm transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save AI Config"}
        </button>
      </div>
    </div>
  );
}
