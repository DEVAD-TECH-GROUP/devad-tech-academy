import { useState } from "react";
import {
  generateQuiz,
  generateAssignment,
  generateOutline,
  explainConcept,
} from "../../services/instructor/aiService";
import Tabs from "../../components/common/Tabs";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Spinner from "../../components/common/Spinner";
import { toast } from "react-hot-toast";

export default function AIAssistant() {
  const [tab, setTab] = useState("quiz");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [forms, setForms] = useState({
    quiz: { topic: "", difficulty: "medium", questionCount: 5 },
    assignment: { topic: "", courseLevel: "beginner", durationDays: 7 },
    outline: { courseTopic: "", lessonTopic: "", duration: 60 },
    explain: { concept: "", studentLevel: "beginner" },
  });

  const setForm = (tab, k, v) =>
    setForms((f) => ({ ...f, [tab]: { ...f[tab], [k]: v } }));

  const handlers = {
    quiz: () => generateQuiz(forms.quiz),
    assignment: () => generateAssignment(forms.assignment),
    outline: () => generateOutline(forms.outline),
    explain: () => explainConcept(forms.explain),
  };

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const r = await handlers[tab]();
      setResult(r.data.data);
      toast.success("Generated! 🤖");
    } catch (err) {
      toast.error(err.response?.data?.message || "AI generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 fi">
      <div>
        <h1 className="dsp text-xl font-bold text-text">AI Assistant</h1>
        <p className="text-muted text-xs mt-0.5">Powered by Claude AI 🤖</p>
      </div>

      <Tabs
        tabs={[
          { key: "quiz", label: "Quiz Gen", icon: "🧠" },
          { key: "assignment", label: "Assignment", icon: "📝" },
          { key: "outline", label: "Outline", icon: "📋" },
          { key: "explain", label: "Explain", icon: "💡" },
        ]}
        active={tab}
        onChange={(t) => {
          setTab(t);
          setResult(null);
        }}
      />

      <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
        {tab === "quiz" && (
          <>
            <Input
              label="Topic *"
              value={forms.quiz.topic}
              onChange={(e) => setForm("quiz", "topic", e.target.value)}
              placeholder="e.g. React Hooks"
            />
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Difficulty"
                value={forms.quiz.difficulty}
                onChange={(e) => setForm("quiz", "difficulty", e.target.value)}
                options={[
                  { value: "easy", label: "Easy" },
                  { value: "medium", label: "Medium" },
                  { value: "hard", label: "Hard" },
                ]}
              />
              <Input
                label="Questions"
                type="number"
                value={forms.quiz.questionCount}
                onChange={(e) =>
                  setForm("quiz", "questionCount", Number(e.target.value))
                }
              />
            </div>
          </>
        )}

        {tab === "assignment" && (
          <>
            <Input
              label="Topic *"
              value={forms.assignment.topic}
              onChange={(e) => setForm("assignment", "topic", e.target.value)}
              placeholder="e.g. Build a REST API"
            />
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Level"
                value={forms.assignment.courseLevel}
                onChange={(e) =>
                  setForm("assignment", "courseLevel", e.target.value)
                }
                options={[
                  { value: "beginner", label: "Beginner" },
                  { value: "intermediate", label: "Intermediate" },
                  { value: "advanced", label: "Advanced" },
                ]}
              />
              <Input
                label="Days to Complete"
                type="number"
                value={forms.assignment.durationDays}
                onChange={(e) =>
                  setForm("assignment", "durationDays", Number(e.target.value))
                }
              />
            </div>
          </>
        )}

        {tab === "outline" && (
          <>
            <Input
              label="Course Topic *"
              value={forms.outline.courseTopic}
              onChange={(e) =>
                setForm("outline", "courseTopic", e.target.value)
              }
              placeholder="e.g. React Development"
            />
            <Input
              label="Lesson Topic *"
              value={forms.outline.lessonTopic}
              onChange={(e) =>
                setForm("outline", "lessonTopic", e.target.value)
              }
              placeholder="e.g. useState Hook"
            />
            <Input
              label="Duration (min)"
              type="number"
              value={forms.outline.duration}
              onChange={(e) =>
                setForm("outline", "duration", Number(e.target.value))
              }
            />
          </>
        )}

        {tab === "explain" && (
          <>
            <Input
              label="Concept *"
              value={forms.explain.concept}
              onChange={(e) => setForm("explain", "concept", e.target.value)}
              placeholder="e.g. Closures in JavaScript"
            />
            <Select
              label="Student Level"
              value={forms.explain.studentLevel}
              onChange={(e) =>
                setForm("explain", "studentLevel", e.target.value)
              }
              options={[
                { value: "beginner", label: "Beginner" },
                { value: "intermediate", label: "Intermediate" },
                { value: "advanced", label: "Advanced" },
              ]}
            />
          </>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-orange hover:bg-orange/90 text-white font-semibold py-3 rounded-xl text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Spinner size="sm" color="white" /> Generating...
            </>
          ) : (
            "🤖 Generate with AI"
          )}
        </button>
      </div>

      {result && (
        <div className="bg-surface border border-border rounded-2xl p-5">
          <h2 className="dsp text-sm font-bold text-text mb-3">
            Generated Result
          </h2>
          <div className="bg-surfaceHigh rounded-xl p-4">
            <pre className="text-xs text-text whitespace-pre-wrap font-mono overflow-auto max-h-96">
              {typeof result === "string"
                ? result
                : JSON.stringify(result, null, 2)}
            </pre>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(
                typeof result === "string"
                  ? result
                  : JSON.stringify(result, null, 2),
              );
              toast.success("Copied! 📋");
            }}
            className="mt-3 text-xs text-accent hover:underline"
          >
            Copy to clipboard
          </button>
        </div>
      )}
    </div>
  );
}
