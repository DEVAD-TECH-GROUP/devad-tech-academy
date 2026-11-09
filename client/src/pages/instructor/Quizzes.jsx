import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

import {
  getMyQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuiz,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  getQuizResults,
} from "../../services/instructor/quizService";
import { getMyCourses } from "../../services/instructor/courseService";

import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import EmptyState from "../../components/common/EmptyState";
import { SkeletonCard } from "../../components/common/Skeleton";

/* =========================================================
   CONSTANTS
========================================================= */

const INITIAL_FORM = {
  course: "",
  title: "",
  description: "",
  duration: 30,
  passingScore: 70,
  maxAttempts: 3,
};

const QUESTION_TYPE_OPTIONS = [
  { value: "multiple_choice", label: "Multiple choice" },
  { value: "true_false", label: "True / False" },
  { value: "short_answer", label: "Short answer" },
  { value: "coding", label: "Coding" },
  { value: "essay", label: "Essay" },
];

const TYPE_LABEL = Object.fromEntries(
  QUESTION_TYPE_OPTIONS.map((item) => [item.value, item.label]),
);

const emptyOptions = () => [
  { text: "", isCorrect: true },
  { text: "", isCorrect: false },
];

const INITIAL_QUESTION = {
  question: "",
  type: "multiple_choice",
  points: 1,
  difficulty: "medium",
  explanation: "",
  options: emptyOptions(),
  correctAnswer: "",
  codeLanguage: "javascript",
  starterCode: "",
  testCases: [],
};

const STATUS_NEXT = {
  draft: { status: "active", label: "Publish", done: "Quiz published" },
  active: { status: "closed", label: "Close", done: "Quiz closed" },
  closed: { status: "active", label: "Reopen", done: "Quiz reopened" },
};

const inputClass =
  "w-full rounded-xl border border-border bg-surfaceHigh px-3.5 py-3 text-sm text-text outline-none transition placeholder:text-muted/70 focus:border-orange focus:ring-2 focus:ring-orange/15 disabled:cursor-not-allowed disabled:opacity-60";

const textareaClass = `${inputClass} min-h-[90px] resize-y`;

const buttonPrimary =
  "rounded-xl bg-sky-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-orange/90 disabled:cursor-not-allowed disabled:opacity-50";

const buttonSecondary =
  "rounded-xl border border-border bg-surfaceHigh px-3 py-2 text-xs font-medium text-text transition hover:border-orange/40 disabled:cursor-not-allowed disabled:opacity-50";

const buttonDanger =
  "rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-50";

/* =========================================================
   HELPERS
========================================================= */

const getList = (response) => {
  const payload = response?.data?.data;

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.docs)) return payload.docs;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.quizzes)) return payload.quizzes;
  if (Array.isArray(payload?.courses)) return payload.courses;

  return [];
};

const getObject = (response) => {
  const payload = response?.data?.data;

  return payload && !Array.isArray(payload) ? payload : null;
};

const getCourseId = (course) =>
  !course ? "" : typeof course === "string" ? course : course._id || "";

const getCourseTitle = (course) =>
  !course
    ? "No course"
    : typeof course === "string"
      ? "Course"
      : course.title || course.name || "Untitled course";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const getStudentName = (student) => {
  if (!student) return "Unknown student";

  const name = [student.firstName, student.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || student.email || "Unknown student";
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const defaultCorrectAnswer = (type) => (type === "true_false" ? "true" : "");

function FormField({ label, children, required = false }) {
  return (
    <div className="min-w-0 space-y-2">
      <label className="block text-sm font-medium text-text">
        {label}
        {required && <span className="ml-1 text-orange">*</span>}
      </label>

      {children}
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // quiz create / edit
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  // results
  const [resultsQuiz, setResultsQuiz] = useState(null);
  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);

  // questions manager
  const [questionsQuiz, setQuestionsQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionView, setQuestionView] = useState("list");
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionForm, setQuestionForm] = useState(INITIAL_QUESTION);
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [deletingQuestionId, setDeletingQuestionId] = useState(null);

  /* -------------------------------------------------------
     LOAD DATA
  ------------------------------------------------------- */

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [quizResponse, courseResponse] = await Promise.all([
        getMyQuizzes(),
        getMyCourses(),
      ]);

      setQuizzes(getList(quizResponse));
      setCourses(getList(courseResponse));
    } catch (error) {
      console.error("LOAD QUIZZES ERROR:", error);
      toast.error(getErrorMessage(error, "Failed to load quizzes"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* -------------------------------------------------------
     QUIZ FORM
  ------------------------------------------------------- */

  const setField = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleOpenCreate = () => {
    setEditing(null);
    setForm({ ...INITIAL_FORM, course: courses[0]?._id || "" });
    setShowForm(true);
  };

  const handleOpenEdit = (quiz) => {
    setEditing(quiz);
    setForm({
      course: getCourseId(quiz.course),
      title: quiz.title || "",
      description: quiz.description || "",
      duration: quiz.duration ?? 30,
      passingScore: quiz.passingScore ?? 70,
      maxAttempts: quiz.maxAttempts ?? 3,
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditing(null);
    setForm(INITIAL_FORM);
  };

  const validateQuiz = () => {
    if (!form.course) {
      toast.error("Select a course");
      return false;
    }

    if (form.title.trim().length < 3) {
      toast.error("Title must be at least 3 characters");
      return false;
    }

    if (form.title.trim().length > 100) {
      toast.error("Title cannot exceed 100 characters");
      return false;
    }

    if (form.description.length > 500) {
      toast.error("Description cannot exceed 500 characters");
      return false;
    }

    if (!Number.isFinite(Number(form.duration)) || Number(form.duration) <= 0) {
      toast.error("Duration must be greater than zero");
      return false;
    }

    const passing = Number(form.passingScore);

    if (!Number.isFinite(passing) || passing < 0 || passing > 100) {
      toast.error("Pass score must be between 0 and 100");
      return false;
    }

    if (
      !Number.isFinite(Number(form.maxAttempts)) ||
      Number(form.maxAttempts) < 1
    ) {
      toast.error("Max attempts must be at least 1");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (saving || !validateQuiz()) return;

    const payload = {
      title: form.title.trim(),
      duration: Number(form.duration),
      passingScore: Number(form.passingScore),
      maxAttempts: Math.floor(Number(form.maxAttempts)),
    };

    try {
      setSaving(true);

      if (editing?._id) {
        // course is fixed after creation; description may be cleared
        const response = await updateQuiz(editing._id, {
          ...payload,
          description: form.description.trim(),
        });

        const updated = getObject(response);

        setQuizzes((current) =>
          current.map((item) =>
            item._id === editing._id
              ? { ...item, ...(updated || payload), course: item.course }
              : item,
          ),
        );

        toast.success("Quiz updated");
      } else {
        const createPayload = { ...payload, course: form.course };

        if (form.description.trim()) {
          createPayload.description = form.description.trim();
        }

        const response = await createQuiz(createPayload);
        const created = getObject(response);

        if (!created?._id) {
          throw new Error("The server did not return the created quiz");
        }

        const courseObject = courses.find((c) => c._id === form.course);

        setQuizzes((current) => [
          { ...created, course: courseObject || created.course },
          ...current,
        ]);

        toast.success("Quiz created. Add questions, then publish it.");
      }

      setShowForm(false);
      setEditing(null);
      setForm(INITIAL_FORM);
    } catch (error) {
      console.error("SAVE QUIZ ERROR:", error);
      toast.error(getErrorMessage(error, "Failed to save quiz"));
    } finally {
      setSaving(false);
    }
  };

  /* -------------------------------------------------------
     DELETE / STATUS
  ------------------------------------------------------- */

  const handleDelete = async (quiz) => {
    const confirmed = window.confirm(
      `Delete "${quiz.title}"?\n\nAll its questions will also be deleted.`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(quiz._id);

      await deleteQuiz(quiz._id);

      setQuizzes((current) => current.filter((item) => item._id !== quiz._id));

      toast.success("Quiz deleted");
    } catch (error) {
      console.error("DELETE QUIZ ERROR:", error);
      toast.error(getErrorMessage(error, "Failed to delete quiz"));
    } finally {
      setDeletingId(null);
    }
  };

  const handleChangeStatus = async (quiz) => {
    const next = STATUS_NEXT[quiz.status] || STATUS_NEXT.draft;

    try {
      setStatusUpdatingId(quiz._id);

      const response = await updateQuiz(quiz._id, { status: next.status });
      const updated = getObject(response);

      setQuizzes((current) =>
        current.map((item) =>
          item._id === quiz._id
            ? { ...item, status: updated?.status ?? next.status }
            : item,
        ),
      );

      toast.success(next.done);
    } catch (error) {
      console.error("QUIZ STATUS ERROR:", error);
      toast.error(getErrorMessage(error, "Unable to update quiz status"));
    } finally {
      setStatusUpdatingId(null);
    }
  };

  /* -------------------------------------------------------
     RESULTS
  ------------------------------------------------------- */

  const handleViewResults = async (quiz) => {
    setResultsQuiz(quiz);
    setResults([]);

    try {
      setLoadingResults(true);

      const response = await getQuizResults(quiz._id);

      setResults(getList(response));
    } catch (error) {
      console.error("LOAD RESULTS ERROR:", error);
      toast.error(getErrorMessage(error, "Failed to load results"));
    } finally {
      setLoadingResults(false);
    }
  };

  const resultSummary = useMemo(() => {
    if (!results.length) return { total: 0, passed: 0, average: 0 };

    const passed = results.filter((item) => item.isPassed).length;
    const average =
      results.reduce((sum, item) => sum + Number(item.percentage || 0), 0) /
      results.length;

    return { total: results.length, passed, average: Math.round(average) };
  }, [results]);

  /* -------------------------------------------------------
     QUESTIONS MANAGER
  ------------------------------------------------------- */

  const syncQuiz = (quizData) => {
    if (!quizData?._id) return;

    setQuizzes((current) =>
      current.map((item) =>
        item._id === quizData._id
          ? {
              ...item,
              totalQuestions: quizData.totalQuestions,
              totalPoints: quizData.totalPoints,
              status: quizData.status,
            }
          : item,
      ),
    );
  };

  // Reloads the quiz and its questions so counts and points stay accurate
  const loadQuestions = async (quizId) => {
    try {
      setLoadingQuestions(true);

      const response = await getQuiz(quizId);
      const data = getObject(response);

      setQuestions(Array.isArray(data?.questions) ? data.questions : []);
      syncQuiz(data);
    } catch (error) {
      console.error("LOAD QUESTIONS ERROR:", error);
      toast.error(getErrorMessage(error, "Failed to load questions"));
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleOpenQuestions = (quiz) => {
    setQuestionsQuiz(quiz);
    setQuestions([]);
    setQuestionView("list");
    setEditingQuestion(null);
    setQuestionForm(INITIAL_QUESTION);
    loadQuestions(quiz._id);
  };

  const handleCloseQuestions = () => {
    if (savingQuestion) return;

    setQuestionsQuiz(null);
    setQuestions([]);
    setQuestionView("list");
    setEditingQuestion(null);
    setQuestionForm(INITIAL_QUESTION);
  };

  const setQuestionField = (field, value) =>
    setQuestionForm((current) => ({ ...current, [field]: value }));

  const handleQuestionTypeChange = (type) => {
    setQuestionForm((current) => ({
      ...current,
      type,
      correctAnswer: defaultCorrectAnswer(type),
    }));
  };

  const handleOpenAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionForm({ ...INITIAL_QUESTION, options: emptyOptions() });
    setQuestionView("form");
  };

  const handleOpenEditQuestion = (question) => {
    setEditingQuestion(question);
    setQuestionForm({
      question: question.question || "",
      type: question.type || "multiple_choice",
      points: question.points ?? 1,
      difficulty: question.difficulty || "medium",
      explanation: question.explanation || "",
      options:
        Array.isArray(question.options) && question.options.length >= 2
          ? question.options.map((item) => ({
              text: item.text || "",
              isCorrect: Boolean(item.isCorrect),
            }))
          : emptyOptions(),
      correctAnswer:
        question.correctAnswer || defaultCorrectAnswer(question.type),
      codeLanguage: question.codeLanguage || "javascript",
      starterCode: question.starterCode || "",
      testCases: Array.isArray(question.testCases)
        ? question.testCases.map((item) => ({
            input: item.input || "",
            expectedOutput: item.expectedOutput || "",
            isHidden: Boolean(item.isHidden),
          }))
        : [],
    });
    setQuestionView("form");
  };

  // options
  const addOption = () =>
    setQuestionForm((current) =>
      current.options.length >= 8
        ? current
        : {
            ...current,
            options: [...current.options, { text: "", isCorrect: false }],
          },
    );

  const updateOption = (index, field, value) =>
    setQuestionForm((current) => ({
      ...current,
      options: current.options.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));

  const removeOption = (index) =>
    setQuestionForm((current) =>
      current.options.length <= 2
        ? current
        : {
            ...current,
            options: current.options.filter(
              (_, itemIndex) => itemIndex !== index,
            ),
          },
    );

  // test cases
  const addTestCase = () =>
    setQuestionForm((current) => ({
      ...current,
      testCases: [
        ...current.testCases,
        { input: "", expectedOutput: "", isHidden: false },
      ],
    }));

  const updateTestCase = (index, field, value) =>
    setQuestionForm((current) => ({
      ...current,
      testCases: current.testCases.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));

  const removeTestCase = (index) =>
    setQuestionForm((current) => ({
      ...current,
      testCases: current.testCases.filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    }));

  const validateQuestion = () => {
    const f = questionForm;

    if (f.question.trim().length < 5) {
      toast.error("Question must be at least 5 characters");
      return false;
    }

    if (f.question.length > 1000) {
      toast.error("Question cannot exceed 1000 characters");
      return false;
    }

    if (!Number.isFinite(Number(f.points)) || Number(f.points) <= 0) {
      toast.error("Points must be greater than zero");
      return false;
    }

    if (f.explanation.length > 1000) {
      toast.error("Explanation cannot exceed 1000 characters");
      return false;
    }

    if (f.type === "multiple_choice") {
      if (f.options.some((item) => !item.text.trim())) {
        toast.error("Fill in every option or remove the empty ones");
        return false;
      }

      if (!f.options.some((item) => item.isCorrect)) {
        toast.error("Mark at least one option as correct");
        return false;
      }
    }

    if (f.type === "short_answer" && !f.correctAnswer.trim()) {
      toast.error("Enter the correct answer");
      return false;
    }

    if (f.type === "coding" && !f.codeLanguage.trim()) {
      toast.error("Enter the programming language");
      return false;
    }

    return true;
  };

  const handleSaveQuestion = async () => {
    if (savingQuestion || !questionsQuiz?._id || !validateQuestion()) return;

    const f = questionForm;

    const payload = {
      question: f.question.trim(),
      type: f.type,
      points: Number(f.points),
      difficulty: f.difficulty,
      explanation: f.explanation.trim(),
    };

    if (f.type === "multiple_choice") {
      payload.options = f.options.map((item) => ({
        text: item.text.trim(),
        isCorrect: Boolean(item.isCorrect),
      }));
    }

    if (f.type === "true_false") {
      payload.correctAnswer = f.correctAnswer === "false" ? "false" : "true";
    }

    if (f.type === "short_answer") {
      payload.correctAnswer = f.correctAnswer.trim();
    }

    if (f.type === "coding") {
      payload.codeLanguage = f.codeLanguage.trim();
      payload.starterCode = f.starterCode;
      payload.testCases = f.testCases.map((item) => ({
        input: item.input,
        expectedOutput: item.expectedOutput,
        isHidden: Boolean(item.isHidden),
      }));
    }

    try {
      setSavingQuestion(true);

      if (editingQuestion?._id) {
        await updateQuestion(questionsQuiz._id, editingQuestion._id, payload);
        toast.success("Question updated");
      } else {
        await addQuestion(questionsQuiz._id, payload);
        toast.success("Question added");
      }

      await loadQuestions(questionsQuiz._id);

      setQuestionView("list");
      setEditingQuestion(null);
      setQuestionForm(INITIAL_QUESTION);
    } catch (error) {
      console.error("SAVE QUESTION ERROR:", error);
      toast.error(getErrorMessage(error, "Failed to save question"));
    } finally {
      setSavingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (question) => {
    if (!questionsQuiz?._id) return;

    if (!window.confirm("Delete this question?")) return;

    try {
      setDeletingQuestionId(question._id);

      await deleteQuestion(questionsQuiz._id, question._id);
      await loadQuestions(questionsQuiz._id);

      toast.success("Question deleted");
    } catch (error) {
      console.error("DELETE QUESTION ERROR:", error);
      toast.error(getErrorMessage(error, "Failed to delete question"));
    } finally {
      setDeletingQuestionId(null);
    }
  };

  const activeQuestionsQuiz = useMemo(
    () =>
      quizzes.find((item) => item._id === questionsQuiz?._id) || questionsQuiz,
    [quizzes, questionsQuiz],
  );

  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5 fi">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="dsp text-xl font-bold text-text">Quizzes</h1>

        <button
          type="button"
          onClick={handleOpenCreate}
          disabled={courses.length === 0}
          className="rounded-xl bg-orange px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-orange/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Create Quiz
        </button>
      </div>

      {courses.length === 0 && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs leading-5 text-muted">
          You need a course before you can create a quiz.
        </div>
      )}

      {quizzes.length === 0 ? (
        <EmptyState
          icon="🧠"
          title="No quizzes"
          message="Create your first quiz"
          action={courses.length ? handleOpenCreate : undefined}
          actionLabel="Create Quiz"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {quizzes.map((q) => {
            const next = STATUS_NEXT[q.status] || STATUS_NEXT.draft;

            return (
              <div
                key={q._id}
                className="fi rounded-2xl border border-border bg-surface p-4"
              >
                <div className="mb-2 flex items-start justify-between">
                  <p className="mr-2 flex-1 break-words text-sm font-semibold text-text">
                    {q.title}
                  </p>

                  <Badge variant={q.status === "active" ? "green" : "default"}>
                    {q.status}
                  </Badge>
                </div>

                <p className="mb-3 text-xs text-muted">
                  {getCourseTitle(q.course)}
                </p>

                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    ["❓", q.totalQuestions || 0, "Questions"],
                    ["⏱", q.duration, "Minutes"],
                    ["🎯", `${q.passingScore}%`, "Pass"],
                  ].map(([icon, val, label]) => (
                    <div key={label} className="rounded-lg bg-surfaceHigh p-2">
                      <div className="text-sm">{icon}</div>
                      <div className="text-xs font-bold text-text">{val}</div>
                      <div className="text-[10px] text-muted">{label}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenQuestions(q)}
                    className={buttonPrimary}
                  >
                    Questions
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChangeStatus(q)}
                    disabled={statusUpdatingId === q._id}
                    className={buttonSecondary}
                  >
                    {statusUpdatingId === q._id ? "Updating..." : next.label}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleViewResults(q)}
                    className={buttonSecondary}
                  >
                    Results
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(q)}
                    className={buttonSecondary}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(q)}
                    disabled={deletingId === q._id}
                    className={buttonDanger}
                  >
                    {deletingId === q._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =====================================================
          CREATE / EDIT QUIZ
      ====================================================== */}

      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={editing ? "Edit Quiz" : "Create Quiz"}
        size="sm"
      >
        <div className="space-y-3">
          <FormField label="Course" required>
            <select
              value={form.course}
              onChange={(e) => setField("course", e.target.value)}
              disabled={Boolean(editing)}
              className={inputClass}
            >
              <option value="">Select a course</option>

              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title || course.name || "Untitled course"}
                </option>
              ))}
            </select>
          </FormField>

          <Input
            label="Quiz Title *"
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            placeholder="e.g. React Fundamentals Quiz"
            required
          />

          <FormField label="Description">
            <textarea
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Optional short description"
              maxLength={500}
              className={textareaClass}
            />
          </FormField>

          <div className="grid grid-cols-3 gap-2">
            <Input
              label="Duration (min)"
              type="number"
              value={form.duration}
              onChange={(e) => setField("duration", e.target.value)}
            />

            <Input
              label="Pass Score %"
              type="number"
              value={form.passingScore}
              onChange={(e) => setField("passingScore", e.target.value)}
            />

            <Input
              label="Max Attempts"
              type="number"
              value={form.maxAttempts}
              onChange={(e) => setField("maxAttempts", e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCloseForm}
              disabled={saving}
              className="flex-1 rounded-xl border border-border bg-surfaceHigh py-2.5 text-sm text-text transition hover:border-orange/40 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 rounded-xl bg-orange py-2.5 text-sm font-semibold text-white transition hover:bg-orange/90 disabled:opacity-50"
            >
              {saving ? "Saving..." : editing ? "Save changes" : "Create Quiz"}
            </button>
          </div>
        </div>
      </Modal>

      {/* =====================================================
          QUESTIONS MANAGER
      ====================================================== */}

      <Modal
        isOpen={Boolean(questionsQuiz)}
        onClose={handleCloseQuestions}
        title={
          activeQuestionsQuiz
            ? `Questions · ${activeQuestionsQuiz.title}`
            : "Questions"
        }
        size="lg"
      >
        {questionView === "list" ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted">
                {activeQuestionsQuiz?.totalQuestions || 0} questions ·{" "}
                {activeQuestionsQuiz?.totalPoints || 0} points
              </p>

              <button
                type="button"
                onClick={handleOpenAddQuestion}
                className={buttonPrimary}
              >
                + Add question
              </button>
            </div>

            {loadingQuestions ? (
              <p className="py-10 text-center text-sm text-muted">
                Loading questions...
              </p>
            ) : questions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <p className="text-sm font-medium text-text">
                  No questions yet
                </p>

                <p className="mt-1 text-xs text-muted">
                  Add at least one question before you publish this quiz.
                </p>
              </div>
            ) : (
              questions.map((question, index) => (
                <div
                  key={question._id}
                  className="rounded-xl border border-border bg-surface p-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="min-w-0 flex-1 break-words text-sm font-semibold text-text">
                      {index + 1}. {question.question}
                    </p>

                    <div className="flex items-center gap-2">
                      <Badge variant="default">
                        {TYPE_LABEL[question.type] || question.type}
                      </Badge>

                      <span className="text-xs text-muted">
                        {question.points} pt
                        {Number(question.points) === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>

                  {question.type === "multiple_choice" &&
                    Array.isArray(question.options) && (
                      <ul className="mt-2 space-y-1">
                        {question.options.map((option, optionIndex) => (
                          <li
                            key={optionIndex}
                            className={`text-xs ${
                              option.isCorrect
                                ? "font-semibold text-emerald-400"
                                : "text-muted"
                            }`}
                          >
                            {option.isCorrect ? "✓" : "•"} {option.text}
                          </li>
                        ))}
                      </ul>
                    )}

                  {(question.type === "true_false" ||
                    question.type === "short_answer") &&
                    question.correctAnswer && (
                      <p className="mt-2 text-xs font-semibold text-emerald-400">
                        Answer: {question.correctAnswer}
                      </p>
                    )}

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditQuestion(question)}
                      className={buttonSecondary}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(question)}
                      disabled={deletingQuestionId === question._id}
                      className={buttonDanger}
                    >
                      {deletingQuestionId === question._id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm font-bold text-text">
              {editingQuestion ? "Edit question" : "Add question"}
            </p>

            <FormField label="Question type" required>
              <select
                value={questionForm.type}
                onChange={(e) => handleQuestionTypeChange(e.target.value)}
                className={inputClass}
              >
                {QUESTION_TYPE_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Question" required>
              <textarea
                value={questionForm.question}
                onChange={(e) => setQuestionField("question", e.target.value)}
                placeholder="Write the question..."
                maxLength={1000}
                className={textareaClass}
              />
            </FormField>

            {questionForm.type === "multiple_choice" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-text">
                    Options <span className="text-orange">*</span>
                  </label>

                  <button
                    type="button"
                    onClick={addOption}
                    disabled={questionForm.options.length >= 8}
                    className={buttonSecondary}
                  >
                    + Add option
                  </button>
                </div>

                <p className="text-xs text-muted">
                  Tick the box next to each correct option.
                </p>

                {questionForm.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={option.isCorrect}
                      onChange={(e) =>
                        updateOption(index, "isCorrect", e.target.checked)
                      }
                      className="h-4 w-4 shrink-0 cursor-pointer accent-orange"
                      aria-label={`Option ${index + 1} is correct`}
                    />

                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) =>
                        updateOption(index, "text", e.target.value)
                      }
                      placeholder={`Option ${index + 1}`}
                      className={inputClass}
                    />

                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      disabled={questionForm.options.length <= 2}
                      className={buttonDanger}
                      aria-label={`Remove option ${index + 1}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {questionForm.type === "true_false" && (
              <FormField label="Correct answer" required>
                <select
                  value={questionForm.correctAnswer || "true"}
                  onChange={(e) =>
                    setQuestionField("correctAnswer", e.target.value)
                  }
                  className={inputClass}
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              </FormField>
            )}

            {questionForm.type === "short_answer" && (
              <FormField label="Correct answer" required>
                <input
                  type="text"
                  value={questionForm.correctAnswer}
                  onChange={(e) =>
                    setQuestionField("correctAnswer", e.target.value)
                  }
                  placeholder="The expected answer"
                  className={inputClass}
                />
              </FormField>
            )}

            {questionForm.type === "coding" && (
              <div className="space-y-4">
                <FormField label="Programming language" required>
                  <input
                    type="text"
                    value={questionForm.codeLanguage}
                    onChange={(e) =>
                      setQuestionField("codeLanguage", e.target.value)
                    }
                    placeholder="e.g. javascript"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Starter code">
                  <textarea
                    value={questionForm.starterCode}
                    onChange={(e) =>
                      setQuestionField("starterCode", e.target.value)
                    }
                    placeholder="Code the student starts with (optional)"
                    className={`${textareaClass} font-mono`}
                  />
                </FormField>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-text">
                      Test cases
                    </label>

                    <button
                      type="button"
                      onClick={addTestCase}
                      className={buttonSecondary}
                    >
                      + Add test case
                    </button>
                  </div>

                  {questionForm.testCases.map((testCase, index) => (
                    <div
                      key={index}
                      className="space-y-2 rounded-xl border border-border bg-surfaceHigh p-3"
                    >
                      <input
                        type="text"
                        value={testCase.input}
                        onChange={(e) =>
                          updateTestCase(index, "input", e.target.value)
                        }
                        placeholder="Input"
                        className={inputClass}
                      />

                      <input
                        type="text"
                        value={testCase.expectedOutput}
                        onChange={(e) =>
                          updateTestCase(
                            index,
                            "expectedOutput",
                            e.target.value,
                          )
                        }
                        placeholder="Expected output"
                        className={inputClass}
                      />

                      <div className="flex items-center justify-between">
                        <label className="flex cursor-pointer items-center gap-2 text-xs text-muted">
                          <input
                            type="checkbox"
                            checked={testCase.isHidden}
                            onChange={(e) =>
                              updateTestCase(
                                index,
                                "isHidden",
                                e.target.checked,
                              )
                            }
                            className="h-4 w-4 accent-orange"
                          />
                          Hidden from students
                        </label>

                        <button
                          type="button"
                          onClick={() => removeTestCase(index)}
                          className={buttonDanger}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField label="Points" required>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={questionForm.points}
                  onChange={(e) => setQuestionField("points", e.target.value)}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Difficulty">
                <select
                  value={questionForm.difficulty}
                  onChange={(e) =>
                    setQuestionField("difficulty", e.target.value)
                  }
                  className={inputClass}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </FormField>
            </div>

            <FormField label="Explanation">
              <textarea
                value={questionForm.explanation}
                onChange={(e) =>
                  setQuestionField("explanation", e.target.value)
                }
                placeholder="Shown to students after the quiz (optional)"
                maxLength={1000}
                className={textareaClass}
              />
            </FormField>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  if (savingQuestion) return;
                  setQuestionView("list");
                  setEditingQuestion(null);
                  setQuestionForm(INITIAL_QUESTION);
                }}
                disabled={savingQuestion}
                className="flex-1 rounded-xl border border-border bg-surfaceHigh py-2.5 text-sm text-text transition hover:border-orange/40 disabled:opacity-50"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleSaveQuestion}
                disabled={savingQuestion}
                className="flex-1 rounded-xl bg-orange py-2.5 text-sm font-semibold text-white transition hover:bg-orange/90 disabled:opacity-50"
              >
                {savingQuestion
                  ? "Saving..."
                  : editingQuestion
                    ? "Save question"
                    : "Add question"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* =====================================================
          RESULTS
      ====================================================== */}

      <Modal
        isOpen={Boolean(resultsQuiz)}
        onClose={() => {
          setResultsQuiz(null);
          setResults([]);
        }}
        title={resultsQuiz ? `Results · ${resultsQuiz.title}` : "Results"}
        size="lg"
      >
        {loadingResults ? (
          <p className="py-10 text-center text-sm text-muted">
            Loading results...
          </p>
        ) : results.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">
            No submitted attempts yet.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-surfaceHigh p-2">
                <div className="text-xs text-muted">Attempts</div>
                <div className="text-sm font-bold text-text">
                  {resultSummary.total}
                </div>
              </div>

              <div className="rounded-lg bg-surfaceHigh p-2">
                <div className="text-xs text-muted">Passed</div>
                <div className="text-sm font-bold text-text">
                  {resultSummary.passed}
                </div>
              </div>

              <div className="rounded-lg bg-surfaceHigh p-2">
                <div className="text-xs text-muted">Average</div>
                <div className="text-sm font-bold text-text">
                  {resultSummary.average}%
                </div>
              </div>
            </div>

            {results.map((attempt) => (
              <div
                key={attempt._id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text">
                    {getStudentName(attempt.student)}
                  </p>

                  <p className="truncate text-xs text-muted">
                    {attempt.student?.email || ""} · Attempt{" "}
                    {attempt.attemptNumber} · {formatDate(attempt.submittedAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-text">
                    {Math.round(attempt.percentage || 0)}%
                  </span>

                  <Badge variant={attempt.isPassed ? "green" : "default"}>
                    {attempt.isPassed ? "Passed" : "Failed"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
