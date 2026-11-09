import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardList,
  Download,
  Edit3,
  ExternalLink,
  FileText,
  Loader2,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Send,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";

import {
  getMyAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getSubmissions,
  gradeSubmission,
} from "../../services/instructor/assignmentService";

import { getMyCourses } from "../../services/instructor/courseService";

/* =========================================================
   CONSTANTS
========================================================= */

const INITIAL_FORM = {
  course: "",
  title: "",
  description: "",
  instructions: "",
  dueDate: "",
  totalPoints: "100",
  passingPoints: "50",
  allowLateSubmission: false,
  latePenaltyPercent: "0",
  maxFileSize: "50",
  allowedFileTypes: "pdf,doc,docx,zip",
  isPublished: false,
  rubric: [],
  attachments: [],
};

const INITIAL_GRADE_FORM = {
  grade: "",
  feedback: "",
};

const inputClass =
  "w-full rounded-xl border border-border bg-surfaceHigh px-3.5 py-3 text-sm text-text outline-none transition placeholder:text-muted/70 focus:border-orange focus:ring-2 focus:ring-orange/15 disabled:cursor-not-allowed disabled:opacity-60";

const textareaClass =
  "w-full min-h-[110px] resize-y rounded-xl border border-border bg-surfaceHigh px-3.5 py-3 text-sm text-text outline-none transition placeholder:text-muted/70 focus:border-orange focus:ring-2 focus:ring-orange/15 disabled:cursor-not-allowed disabled:opacity-60";

const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-orange px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange/90 disabled:cursor-not-allowed disabled:opacity-50";

const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surfaceHigh px-4 py-2.5 text-sm font-medium text-text transition hover:border-orange/50 disabled:cursor-not-allowed disabled:opacity-50";

/* =========================================================
   HELPERS
========================================================= */

const getResponseList = (response) => {
  const payload = response?.data?.data;

  if (Array.isArray(payload)) return payload;

  if (Array.isArray(payload?.docs)) return payload.docs;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.assignments)) return payload.assignments;
  if (Array.isArray(payload?.courses)) return payload.courses;

  return [];
};

const getResponseObject = (response) => {
  const payload = response?.data?.data;

  if (payload && !Array.isArray(payload)) {
    return payload;
  }

  return null;
};

const getCourseId = (course) => {
  if (!course) return "";

  if (typeof course === "string") return course;

  return course._id || course.id || "";
};

const getCourseTitle = (course) => {
  if (!course) return "Unknown course";

  if (typeof course === "string") return "Course";

  return course.title || course.name || "Untitled course";
};

const formatDate = (date) => {
  if (!date) return "No date";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Invalid date";

  return parsed.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toDateTimeLocal = (date) => {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "";

  const offset = parsed.getTimezoneOffset() * 60000;

  return new Date(parsed.getTime() - offset).toISOString().slice(0, 16);
};

const isFutureDate = (date) => {
  if (!date) return false;

  const parsed = new Date(date);

  return !Number.isNaN(parsed.getTime()) && parsed.getTime() > Date.now();
};

const getStudentName = (student) => {
  if (!student) return "Unknown student";

  const name = [student.firstName, student.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || student.name || student.email || "Unknown student";
};

const getInitials = (name) => {
  return String(name || "S")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

/* =========================================================
   REUSABLE UI
========================================================= */

function Field({ label, children, hint, required = false }) {
  return (
    <div className="min-w-0 space-y-2">
      <label className="block text-sm font-medium text-text">
        {label}
        {required && <span className="ml-1 text-orange">*</span>}
      </label>

      {children}

      {hint && <p className="text-xs leading-5 text-muted">{hint}</p>}
    </div>
  );
}

function Toggle({ checked, onChange, label, description, disabled = false }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-border bg-surfaceHigh p-4">
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-text">{label}</span>

        {description && (
          <span className="mt-1 block text-xs leading-5 text-muted">
            {description}
          </span>
        )}
      </span>

      <input
        type="checkbox"
        checked={Boolean(checked)}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-orange"
      />
    </label>
  );
}

function StatusBadge({ published }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        published
          ? "bg-emerald-500/10 text-emerald-400"
          : "bg-amber-500/10 text-amber-400"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          published ? "bg-emerald-400" : "bg-amber-400"
        }`}
      />

      {published ? "Published" : "Draft"}
    </span>
  );
}

function ModalShell({
  title,
  subtitle,
  onClose,
  children,
  size = "max-w-3xl",
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-3 backdrop-blur-sm sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        className={`my-auto flex max-h-[94vh] w-full ${size} flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-text">{title}</h2>

            {subtitle && (
              <p className="mt-1 text-xs leading-5 text-muted">{subtitle}</p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted transition hover:bg-surfaceHigh hover:text-text"
            aria-label="Close modal"
          >
            <X size={19} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {children}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [showCreate, setShowCreate] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  const [showSubmissions, setShowSubmissions] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeForm, setGradeForm] = useState(INITIAL_GRADE_FORM);
  const [savingGrade, setSavingGrade] = useState(false);

  const [deletingId, setDeletingId] = useState(null);
  const [updatingPublishId, setUpdatingPublishId] = useState(null);

  /* -------------------------------------------------------
     ACTIVE ASSIGNMENT AND GRADE LIMIT
  ------------------------------------------------------- */

  const activeAssignment = useMemo(
    () =>
      assignments.find((assignment) => assignment._id === showSubmissions) ||
      null,
    [assignments, showSubmissions],
  );

  const maxGrade = Math.max(0, Number(activeAssignment?.totalPoints ?? 100));

  /* -------------------------------------------------------
     FORM UPDATE

     All text inputs use this state updater.
     Native inputs call it directly through onChange.
  ------------------------------------------------------- */

  const setFormField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const setGradeField = (field, value) => {
    setGradeForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  /* -------------------------------------------------------
     LOAD PAGE DATA
  ------------------------------------------------------- */

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [assignmentResponse, courseResponse] = await Promise.all([
        getMyAssignments(),
        getMyCourses(),
      ]);

      setAssignments(getResponseList(assignmentResponse));
      setCourses(getResponseList(courseResponse));
    } catch (error) {
      console.error("LOAD ASSIGNMENTS ERROR:", error);

      toast.error(getErrorMessage(error, "Failed to load assignments"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* -------------------------------------------------------
     RESET FORM
  ------------------------------------------------------- */

  const resetForm = () => {
    setForm({
      ...INITIAL_FORM,
      course: courses[0]?._id || "",
    });
  };

  /* -------------------------------------------------------
     OPEN CREATE
  ------------------------------------------------------- */

  const handleOpenCreate = () => {
    setEditingAssignment(null);

    setForm({
      ...INITIAL_FORM,
      course: courses[0]?._id || "",
    });

    setShowCreate(true);
  };

  /* -------------------------------------------------------
     OPEN EDIT
  ------------------------------------------------------- */

  const handleOpenEdit = (assignment) => {
    setEditingAssignment(assignment);

    setForm({
      course: getCourseId(assignment.course),
      title: assignment.title || "",
      description: assignment.description || "",
      instructions: assignment.instructions || "",
      dueDate: toDateTimeLocal(assignment.dueDate),
      totalPoints: String(assignment.totalPoints ?? 100),
      passingPoints: String(assignment.passingPoints ?? 50),
      allowLateSubmission: Boolean(assignment.allowLateSubmission),
      latePenaltyPercent: String(assignment.latePenaltyPercent ?? 0),
      maxFileSize: String(assignment.maxFileSize ?? 50),
      allowedFileTypes: Array.isArray(assignment.allowedFileTypes)
        ? assignment.allowedFileTypes.join(", ")
        : "",
      isPublished: Boolean(assignment.isPublished),
      rubric: Array.isArray(assignment.rubric)
        ? assignment.rubric.map((item) => ({
            criterion: item.criterion || "",
            description: item.description || "",
            points: String(item.points ?? ""),
          }))
        : [],
      attachments: Array.isArray(assignment.attachments)
        ? assignment.attachments.map((item) => ({
            name: item.name || "",
            url: item.url || "",
            public_id: item.public_id || "",
            type: item.type || "",
          }))
        : [],
    });

    setShowCreate(true);
  };

  const handleCloseForm = () => {
    if (saving) return;

    setShowCreate(false);
    setEditingAssignment(null);
    resetForm();
  };

  /* -------------------------------------------------------
     RUBRIC MANAGEMENT
  ------------------------------------------------------- */

  const addRubricCriterion = () => {
    setForm((current) => ({
      ...current,
      rubric: [
        ...current.rubric,
        {
          criterion: "",
          description: "",
          points: "",
        },
      ],
    }));
  };

  const updateRubricCriterion = (index, field, value) => {
    setForm((current) => ({
      ...current,
      rubric: current.rubric.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const removeRubricCriterion = (index) => {
    setForm((current) => ({
      ...current,
      rubric: current.rubric.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const rubricTotal = useMemo(
    () => form.rubric.reduce((sum, item) => sum + Number(item.points || 0), 0),
    [form.rubric],
  );

  /* -------------------------------------------------------
     ATTACHMENT METADATA MANAGEMENT

     This saves existing/external URLs and metadata.
     A real file upload requires a backend upload endpoint.
  ------------------------------------------------------- */

  const addAttachment = () => {
    setForm((current) => ({
      ...current,
      attachments: [
        ...current.attachments,
        {
          name: "",
          url: "",
          public_id: "",
          type: "",
        },
      ],
    }));
  };

  const updateAttachment = (index, field, value) => {
    setForm((current) => ({
      ...current,
      attachments: current.attachments.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const removeAttachment = (index) => {
    setForm((current) => ({
      ...current,
      attachments: current.attachments.filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    }));
  };

  /* -------------------------------------------------------
     VALIDATE FORM
  ------------------------------------------------------- */

  const validateForm = () => {
    if (!form.course) {
      toast.error("Select a course");
      return false;
    }

    if (form.title.trim().length < 3) {
      toast.error("Assignment title must be at least 3 characters");
      return false;
    }

    if (form.title.trim().length > 100) {
      toast.error("Assignment title cannot exceed 100 characters");
      return false;
    }

    if (form.description.trim().length < 10) {
      toast.error("Description must be at least 10 characters");
      return false;
    }

    if (form.description.trim().length > 5000) {
      toast.error("Description cannot exceed 5000 characters");
      return false;
    }

    if (form.instructions && form.instructions.length > 5000) {
      toast.error("Instructions cannot exceed 5000 characters");
      return false;
    }

    if (!editingAssignment && !isFutureDate(form.dueDate)) {
      toast.error("Choose a future due date");
      return false;
    }

    if (editingAssignment && form.dueDate && !isFutureDate(form.dueDate)) {
      toast.error("The due date must be in the future");
      return false;
    }

    const totalPoints = Number(form.totalPoints);
    const passingPoints = Number(form.passingPoints);
    const latePenalty = Number(form.latePenaltyPercent);
    const maxFileSize = Number(form.maxFileSize);

    if (!Number.isFinite(totalPoints) || totalPoints <= 0) {
      toast.error("Total points must be greater than zero");
      return false;
    }

    if (!Number.isFinite(passingPoints) || passingPoints <= 0) {
      toast.error("Passing points must be greater than zero");
      return false;
    }

    if (passingPoints > totalPoints) {
      toast.error("Passing points cannot exceed total points");
      return false;
    }

    if (!Number.isFinite(latePenalty) || latePenalty < 0 || latePenalty > 100) {
      toast.error("Late penalty must be between 0 and 100");
      return false;
    }

    if (
      !Number.isFinite(maxFileSize) ||
      maxFileSize <= 0 ||
      maxFileSize > 500
    ) {
      toast.error("Maximum file size must be between 1 and 500 MB");
      return false;
    }

    if (rubricTotal > totalPoints) {
      toast.error("Rubric points cannot exceed the assignment total points");
      return false;
    }

    for (let index = 0; index < form.rubric.length; index += 1) {
      const item = form.rubric[index];

      if (!item.criterion.trim()) {
        toast.error(`Enter a name for rubric criterion ${index + 1}`);
        return false;
      }

      if (!Number.isFinite(Number(item.points)) || Number(item.points) <= 0) {
        toast.error(`Enter valid points for rubric criterion ${index + 1}`);
        return false;
      }
    }

    for (let index = 0; index < form.attachments.length; index += 1) {
      const item = form.attachments[index];

      if (!item.name.trim() || !item.url.trim()) {
        toast.error(`Complete the name and URL for attachment ${index + 1}`);
        return false;
      }

      try {
        new URL(item.url);
      } catch {
        toast.error(`Enter a valid URL for attachment ${index + 1}`);
        return false;
      }
    }

    return true;
  };

  /* -------------------------------------------------------
     CREATE / UPDATE ASSIGNMENT
  ------------------------------------------------------- */

  const handleSaveAssignment = async (event) => {
    event.preventDefault();

    if (saving) return;
    if (!validateForm()) return;

    const payload = {
      course: form.course,
      title: form.title.trim(),
      description: form.description.trim(),
      instructions: form.instructions.trim() || null,

      dueDate: new Date(form.dueDate).toISOString(),

      totalPoints: Number(form.totalPoints),
      passingPoints: Number(form.passingPoints),

      allowLateSubmission: Boolean(form.allowLateSubmission),
      latePenaltyPercent: Number(form.latePenaltyPercent),
      maxFileSize: Number(form.maxFileSize),

      allowedFileTypes: form.allowedFileTypes
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean),

      isPublished: Boolean(form.isPublished),

      rubric: form.rubric.map((item) => ({
        criterion: item.criterion.trim(),
        description: item.description.trim(),
        points: Number(item.points),
      })),

      attachments: form.attachments.map((item) => ({
        name: item.name.trim(),
        url: item.url.trim(),
        public_id: item.public_id.trim(),
        type: item.type.trim(),
      })),
    };

    try {
      setSaving(true);

      if (editingAssignment?._id) {
        const response = await updateAssignment(editingAssignment._id, payload);

        const updatedAssignment = getResponseObject(response);

        setAssignments((current) =>
          current.map((item) =>
            item._id === editingAssignment._id
              ? {
                  ...item,
                  ...(updatedAssignment || payload),
                  course:
                    updatedAssignment?.course ||
                    courses.find((course) => course._id === payload.course) ||
                    item.course,
                }
              : item,
          ),
        );

        toast.success("Assignment updated successfully");
      } else {
        const response = await createAssignment(payload);

        const newAssignment = getResponseObject(response);

        if (!newAssignment?._id) {
          throw new Error("The server did not return the created assignment");
        }

        const selectedCourse = courses.find(
          (course) => course._id === payload.course,
        );

        setAssignments((current) => [
          {
            ...newAssignment,
            course: newAssignment.course || selectedCourse,
          },
          ...current,
        ]);

        toast.success("Assignment created successfully");
      }

      setShowCreate(false);
      setEditingAssignment(null);
      resetForm();
    } catch (error) {
      console.error("SAVE ASSIGNMENT ERROR:", error);

      toast.error(getErrorMessage(error, "Failed to save assignment"));
    } finally {
      setSaving(false);
    }
  };

  /* -------------------------------------------------------
     DELETE ASSIGNMENT
  ------------------------------------------------------- */

  const handleDeleteAssignment = async (assignment) => {
    const confirmed = window.confirm(
      `Delete "${assignment.title}"?\n\nAssignments with student submissions cannot be deleted.`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(assignment._id);

      await deleteAssignment(assignment._id);

      setAssignments((current) =>
        current.filter((item) => item._id !== assignment._id),
      );

      toast.success("Assignment deleted successfully");
    } catch (error) {
      console.error("DELETE ASSIGNMENT ERROR:", error);

      toast.error(getErrorMessage(error, "Failed to delete assignment"));
    } finally {
      setDeletingId(null);
    }
  };

  /* -------------------------------------------------------
     PUBLISH / UNPUBLISH
  ------------------------------------------------------- */

  const handleTogglePublish = async (assignment) => {
    const nextPublished = !assignment.isPublished;

    try {
      setUpdatingPublishId(assignment._id);

      const response = await updateAssignment(assignment._id, {
        isPublished: nextPublished,
      });

      const updated = getResponseObject(response);

      setAssignments((current) =>
        current.map((item) =>
          item._id === assignment._id
            ? {
                ...item,
                isPublished: updated?.isPublished ?? nextPublished,
              }
            : item,
        ),
      );

      toast.success(
        nextPublished ? "Assignment published" : "Assignment moved to drafts",
      );
    } catch (error) {
      console.error("PUBLISH ASSIGNMENT ERROR:", error);

      toast.error(getErrorMessage(error, "Unable to update assignment status"));
    } finally {
      setUpdatingPublishId(null);
    }
  };

  /* -------------------------------------------------------
     LOAD SUBMISSIONS
  ------------------------------------------------------- */

  const handleViewSubmissions = async (assignment) => {
    setShowSubmissions(assignment._id);
    setSubmissions([]);
    setGradingSubmission(null);

    try {
      setLoadingSubmissions(true);

      const response = await getSubmissions(assignment._id);

      setSubmissions(getResponseList(response));
    } catch (error) {
      console.error("LOAD SUBMISSIONS ERROR:", error);

      toast.error(getErrorMessage(error, "Failed to load submissions"));
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleCloseSubmissions = () => {
    if (savingGrade) return;

    setShowSubmissions(null);
    setSubmissions([]);
    setGradingSubmission(null);
    setGradeForm(INITIAL_GRADE_FORM);
  };

  /* -------------------------------------------------------
     OPEN GRADING
  ------------------------------------------------------- */

  const handleOpenGrade = (submission) => {
    setGradingSubmission(submission);

    setGradeForm({
      grade:
        submission.grade === null || submission.grade === undefined
          ? ""
          : String(submission.grade),
      feedback: submission.feedback || "",
    });
  };

  /* -------------------------------------------------------
     GRADE SUBMISSION
  ------------------------------------------------------- */

  const handleGrade = async (event) => {
    event.preventDefault();

    if (!gradingSubmission?._id || savingGrade) return;

    const numericGrade = Number(gradeForm.grade);

    if (gradeForm.grade === "" || !Number.isFinite(numericGrade)) {
      toast.error("Enter a valid grade");
      return;
    }

    if (numericGrade < 0 || numericGrade > maxGrade) {
      toast.error(`Grade must be between 0 and ${maxGrade}`);
      return;
    }

    if (gradeForm.feedback.length > 2000) {
      toast.error("Feedback cannot exceed 2000 characters");
      return;
    }

    try {
      setSavingGrade(true);

      const response = await gradeSubmission(gradingSubmission._id, {
        grade: numericGrade,
        feedback: gradeForm.feedback.trim(),
      });

      const updatedSubmission = getResponseObject(response);

      setSubmissions((current) =>
        current.map((item) =>
          item._id === gradingSubmission._id
            ? {
                ...item,
                ...(updatedSubmission || {}),
                grade: numericGrade,
                feedback: gradeForm.feedback.trim(),
                status: "graded",
                gradedAt: new Date().toISOString(),
              }
            : item,
        ),
      );

      setGradingSubmission(null);
      setGradeForm(INITIAL_GRADE_FORM);

      toast.success("Submission graded successfully");
    } catch (error) {
      console.error("GRADE SUBMISSION ERROR:", error);

      toast.error(getErrorMessage(error, "Failed to grade submission"));
    } finally {
      setSavingGrade(false);
    }
  };

  /* -------------------------------------------------------
     FILTER ASSIGNMENTS
  ------------------------------------------------------- */

  const filteredAssignments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return assignments.filter((assignment) => {
      const matchesSearch =
        !normalizedSearch ||
        assignment.title?.toLowerCase().includes(normalizedSearch) ||
        getCourseTitle(assignment.course)
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesFilter =
        filter === "all" ||
        (filter === "published" && assignment.isPublished) ||
        (filter === "draft" && !assignment.isPublished);

      return matchesSearch && matchesFilter;
    });
  }, [assignments, search, filter]);

  const publishedCount = assignments.filter((item) => item.isPublished).length;

  const draftCount = assignments.length - publishedCount;

  const submissionCount = assignments.reduce(
    (sum, item) => sum + Number(item.stats?.totalSubmissions || 0),
    0,
  );

  /* -------------------------------------------------------
     LOADING SCREEN
  ------------------------------------------------------- */

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-24 animate-pulse rounded-2xl bg-surfaceHigh" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-2xl bg-surfaceHigh"
            />
          ))}
        </div>

        <div className="h-64 animate-pulse rounded-2xl bg-surfaceHigh" />
      </div>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="fi space-y-6">
      {/* HEADER */}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange">
            <ClipboardList size={15} />
            Instructor workspace
          </div>

          <h1 className="mt-2 text-2xl font-bold text-text sm:text-3xl">
            Assignments
          </h1>

          <p className="mt-1 max-w-xl text-sm leading-6 text-muted">
            Create assignments, manage deadlines, review student work and grade
            submissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className={buttonSecondary}
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            disabled={courses.length === 0}
            className={buttonPrimary}
          >
            <Plus size={17} />
            Create Assignment
          </button>
        </div>
      </div>

      {/* NO COURSES NOTICE */}

      {courses.length === 0 && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
          <div className="flex items-start gap-3">
            <BookOpen className="mt-0.5 shrink-0 text-amber-400" />

            <div>
              <h3 className="text-sm font-semibold text-text">
                No courses available
              </h3>

              <p className="mt-1 text-xs leading-5 text-muted">
                You need to have a course assigned to you before creating
                assignments. Create or check your instructor courses first.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STATISTICS */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">
              Total assignments
            </span>

            <ClipboardList size={18} className="text-orange" />
          </div>

          <p className="mt-3 text-2xl font-bold text-text">
            {assignments.length}
          </p>

          <p className="mt-1 text-xs text-muted">Across your courses</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">
              Published assignments
            </span>

            <Check size={18} className="text-emerald-400" />
          </div>

          <p className="mt-3 text-2xl font-bold text-text">{publishedCount}</p>

          <p className="mt-1 text-xs text-muted">
            {draftCount} currently in draft
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">
              Student submissions
            </span>

            <Users size={18} className="text-sky-400" />
          </div>

          <p className="mt-3 text-2xl font-bold text-text">{submissionCount}</p>

          <p className="mt-1 text-xs text-muted">Recorded across assignments</p>
        </div>
      </div>

      {/* SEARCH AND FILTER */}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search assignments or courses..."
            className={`${inputClass} pl-10`}
          />
        </div>

        <div className="relative sm:w-48">
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className={`${inputClass} appearance-none pr-10`}
          >
            <option value="all">All assignments</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>

          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
        </div>
      </div>

      {/* ASSIGNMENT LIST */}

      {filteredAssignments.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface px-5 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange/10 text-orange">
            <FileText size={25} />
          </div>

          <h3 className="mt-4 text-base font-semibold text-text">
            {assignments.length === 0
              ? "No assignments yet"
              : "No matching assignments"}
          </h3>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
            {assignments.length === 0
              ? "Create your first assignment and make it available to your students."
              : "Try a different search term or change the assignment filter."}
          </p>

          {assignments.length === 0 && courses.length > 0 && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className={`${buttonPrimary} mt-5`}
            >
              <Plus size={16} />
              Create your first assignment
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAssignments.map((assignment) => {
            const courseTitle = getCourseTitle(assignment.course);

            const totalSubmissions = Number(
              assignment.stats?.totalSubmissions || 0,
            );

            const totalGraded = Number(assignment.stats?.totalGraded || 0);

            const isDeleting = deletingId === assignment._id;

            return (
              <div
                key={assignment._id}
                className="rounded-2xl border border-border bg-surface p-4 transition hover:border-orange/30 sm:p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge published={assignment.isPublished} />

                      <span className="rounded-full bg-surfaceHigh px-2.5 py-1 text-xs text-muted">
                        {courseTitle}
                      </span>
                    </div>

                    <h3 className="mt-3 break-words text-base font-bold text-text">
                      {assignment.title}
                    </h3>

                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">
                      {assignment.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={14} />
                        Due: {formatDate(assignment.dueDate)}
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <ClipboardList size={14} />
                        {assignment.totalPoints ?? 100} points
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <Users size={14} />
                        {totalSubmissions} submissions
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <Check size={14} />
                        {totalGraded} graded
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <button
                      type="button"
                      onClick={() => handleViewSubmissions(assignment)}
                      className={buttonPrimary}
                    >
                      <Users size={15} />
                      Submissions
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(assignment)}
                      className={buttonSecondary}
                      title="Edit assignment"
                    >
                      <Edit3 size={15} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTogglePublish(assignment)}
                      disabled={updatingPublishId === assignment._id}
                      className={buttonSecondary}
                    >
                      {updatingPublishId === assignment._id ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Check size={15} />
                      )}

                      {assignment.isPublished ? "Unpublish" : "Publish"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteAssignment(assignment)}
                      disabled={isDeleting}
                      className="inline-flex items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 p-2.5 text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                      title="Delete assignment"
                    >
                      {isDeleting ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =====================================================
          CREATE / EDIT ASSIGNMENT MODAL
      ====================================================== */}

      {showCreate && (
        <ModalShell
          title={editingAssignment ? "Edit assignment" : "Create assignment"}
          subtitle="Configure the assignment details, grading rules and student submission requirements."
          onClose={handleCloseForm}
          size="max-w-4xl"
        >
          <form onSubmit={handleSaveAssignment} className="space-y-7">
            {/* BASIC INFORMATION */}

            <section className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-text">
                  Basic information
                </h3>

                <p className="mt-1 text-xs text-muted">
                  The main details students will see.
                </p>
              </div>

              <Field label="Course" required>
                <select
                  value={form.course}
                  onChange={(event) =>
                    setFormField("course", event.target.value)
                  }
                  className={inputClass}
                  required
                >
                  <option value="">Select a course</option>

                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Assignment title" required>
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    setFormField("title", event.target.value)
                  }
                  placeholder="e.g. Build a responsive React application"
                  maxLength={100}
                  className={inputClass}
                  required
                />

                <p className="text-right text-[11px] text-muted">
                  {form.title.length}/100
                </p>
              </Field>

              <Field
                label="Description"
                required
                hint="At least 10 characters. Explain what students are expected to do."
              >
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setFormField("description", event.target.value)
                  }
                  placeholder="Describe the assignment and what students are expected to submit..."
                  rows={5}
                  maxLength={5000}
                  className={textareaClass}
                  required
                />

                <p className="text-right text-[11px] text-muted">
                  {form.description.length}/5000
                </p>
              </Field>

              <Field
                label="Instructions"
                hint="Optional detailed instructions, steps, formatting rules or submission guidance."
              >
                <textarea
                  value={form.instructions}
                  onChange={(event) =>
                    setFormField("instructions", event.target.value)
                  }
                  placeholder="1. Read the project requirements...&#10;2. Complete the tasks...&#10;3. Submit your work..."
                  rows={5}
                  maxLength={5000}
                  className={textareaClass}
                />
              </Field>

              <Field label="Due date and time" required>
                <input
                  type="datetime-local"
                  value={form.dueDate}
                  onChange={(event) =>
                    setFormField("dueDate", event.target.value)
                  }
                  className={inputClass}
                  required
                />
              </Field>
            </section>

            <div className="border-t border-border" />

            {/* GRADING SETTINGS */}

            <section className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-text">
                  Grading settings
                </h3>

                <p className="mt-1 text-xs text-muted">
                  Define the maximum score and the passing score.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Total points" required>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={form.totalPoints}
                    onChange={(event) =>
                      setFormField("totalPoints", event.target.value)
                    }
                    className={inputClass}
                    required
                  />
                </Field>

                <Field label="Passing points" required>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.passingPoints}
                    onChange={(event) =>
                      setFormField("passingPoints", event.target.value)
                    }
                    className={inputClass}
                    required
                  />
                </Field>
              </div>

              <div className="rounded-xl border border-border bg-surfaceHigh p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-muted">
                    Rubric points assigned
                  </span>

                  <span
                    className={`text-sm font-bold ${
                      rubricTotal > Number(form.totalPoints || 0)
                        ? "text-red-400"
                        : "text-text"
                    }`}
                  >
                    {rubricTotal} / {Number(form.totalPoints || 0)}
                  </span>
                </div>

                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
                  <div
                    className={`h-full rounded-full transition-all ${
                      rubricTotal > Number(form.totalPoints || 0)
                        ? "bg-red-400"
                        : "bg-orange"
                    }`}
                    style={{
                      width: `${
                        Number(form.totalPoints) > 0
                          ? Math.min(
                              100,
                              (rubricTotal / Number(form.totalPoints)) * 100,
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </section>

            <div className="border-t border-border" />

            {/* RUBRIC */}

            <section className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-text">
                    Grading rubric
                  </h3>

                  <p className="mt-1 text-xs text-muted">
                    Break the assignment into measurable criteria.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addRubricCriterion}
                  className={buttonSecondary}
                >
                  <Plus size={15} />
                  Add criterion
                </button>
              </div>

              {form.rubric.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-5 text-center">
                  <ClipboardList size={22} className="mx-auto text-muted" />

                  <p className="mt-2 text-sm font-medium text-text">
                    No rubric criteria
                  </p>

                  <p className="mt-1 text-xs text-muted">
                    You can create the assignment without a rubric, or add
                    criteria to guide your grading.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {form.rubric.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-border bg-surfaceHigh p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-bold text-muted">
                          CRITERION {index + 1}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeRubricCriterion(index)}
                          className="rounded-lg p-2 text-red-400 transition hover:bg-red-500/10"
                          aria-label="Remove rubric criterion"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_120px]">
                        <Field label="Criterion">
                          <input
                            type="text"
                            value={item.criterion}
                            onChange={(event) =>
                              updateRubricCriterion(
                                index,
                                "criterion",
                                event.target.value,
                              )
                            }
                            placeholder="e.g. Code quality"
                            className={inputClass}
                          />
                        </Field>

                        <Field label="Points">
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={item.points}
                            onChange={(event) =>
                              updateRubricCriterion(
                                index,
                                "points",
                                event.target.value,
                              )
                            }
                            placeholder="20"
                            className={inputClass}
                          />
                        </Field>
                      </div>

                      <div className="mt-3">
                        <Field label="Description">
                          <textarea
                            value={item.description}
                            onChange={(event) =>
                              updateRubricCriterion(
                                index,
                                "description",
                                event.target.value,
                              )
                            }
                            placeholder="Explain what a good performance looks like..."
                            rows={2}
                            className={textareaClass}
                          />
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="border-t border-border" />

            {/* SUBMISSION SETTINGS */}

            <section className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-text">
                  Submission settings
                </h3>

                <p className="mt-1 text-xs text-muted">
                  Configure late submissions and permitted file formats.
                </p>
              </div>

              <Toggle
                checked={form.allowLateSubmission}
                onChange={(value) => setFormField("allowLateSubmission", value)}
                label="Allow late submissions"
                description="Students can submit after the due date when enabled."
              />

              {form.allowLateSubmission && (
                <Field
                  label="Late penalty percentage"
                  hint="The percentage penalty applied to late submissions."
                >
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={form.latePenaltyPercent}
                    onChange={(event) =>
                      setFormField("latePenaltyPercent", event.target.value)
                    }
                    className={inputClass}
                  />
                </Field>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="Maximum file size (MB)"
                  hint="Maximum permitted size for an individual student file."
                >
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={form.maxFileSize}
                    onChange={(event) =>
                      setFormField("maxFileSize", event.target.value)
                    }
                    className={inputClass}
                  />
                </Field>

                <Field
                  label="Allowed file types"
                  hint="Separate extensions with commas. Example: pdf, docx, zip."
                >
                  <input
                    type="text"
                    value={form.allowedFileTypes}
                    onChange={(event) =>
                      setFormField("allowedFileTypes", event.target.value)
                    }
                    placeholder="pdf,doc,docx,zip"
                    className={inputClass}
                  />
                </Field>
              </div>
            </section>

            <div className="border-t border-border" />

            {/* ATTACHMENTS */}

            <section className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-text">
                    Assignment attachments
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-muted">
                    Add reference documents or resources using their existing
                    hosted URLs.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addAttachment}
                  className={buttonSecondary}
                >
                  <Plus size={15} />
                  Add attachment
                </button>
              </div>

              {form.attachments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-5 text-center">
                  <FileText size={22} className="mx-auto text-muted" />

                  <p className="mt-2 text-sm font-medium text-text">
                    No attachments added
                  </p>

                  <p className="mt-1 text-xs text-muted">
                    Attachments are optional.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {form.attachments.map((item, index) => (
                    <div
                      key={index}
                      className="space-y-3 rounded-xl border border-border bg-surfaceHigh p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted">
                          ATTACHMENT {index + 1}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="rounded-lg p-2 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <Field label="Attachment name">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(event) =>
                            updateAttachment(index, "name", event.target.value)
                          }
                          placeholder="Assignment reference PDF"
                          className={inputClass}
                        />
                      </Field>

                      <Field label="Hosted file URL">
                        <input
                          type="url"
                          value={item.url}
                          onChange={(event) =>
                            updateAttachment(index, "url", event.target.value)
                          }
                          placeholder="https://..."
                          className={inputClass}
                        />
                      </Field>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field label="Public ID">
                          <input
                            type="text"
                            value={item.public_id}
                            onChange={(event) =>
                              updateAttachment(
                                index,
                                "public_id",
                                event.target.value,
                              )
                            }
                            placeholder="Optional storage public ID"
                            className={inputClass}
                          />
                        </Field>

                        <Field label="File type">
                          <input
                            type="text"
                            value={item.type}
                            onChange={(event) =>
                              updateAttachment(
                                index,
                                "type",
                                event.target.value,
                              )
                            }
                            placeholder="application/pdf"
                            className={inputClass}
                          />
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="border-t border-border" />

            {/* PUBLISH */}

            <section className="space-y-3">
              <h3 className="text-sm font-bold text-text">Publishing</h3>

              <Toggle
                checked={form.isPublished}
                onChange={(value) => setFormField("isPublished", value)}
                label="Publish assignment immediately"
                description="When enabled, the assignment is created or updated as published. Otherwise, it remains a draft."
              />
            </section>

            {/* FORM ACTIONS */}

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCloseForm}
                disabled={saving}
                className={buttonSecondary}
              >
                Cancel
              </button>

              <button type="submit" disabled={saving} className={buttonPrimary}>
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Check size={16} />
                )}

                {saving
                  ? "Saving..."
                  : editingAssignment
                    ? "Save changes"
                    : "Create assignment"}
              </button>
            </div>
          </form>
        </ModalShell>
      )}

      {/* =====================================================
          SUBMISSIONS MODAL
      ====================================================== */}

      {showSubmissions && (
        <ModalShell
          title="Student submissions"
          subtitle={
            activeAssignment
              ? `${activeAssignment.title} · ${activeAssignment.totalPoints} points`
              : "Review and grade student work"
          }
          onClose={handleCloseSubmissions}
          size="max-w-4xl"
        >
          {loadingSubmissions ? (
            <div className="flex items-center justify-center gap-3 py-16 text-sm text-muted">
              <Loader2 size={19} className="animate-spin" />
              Loading submissions...
            </div>
          ) : submissions.length === 0 ? (
            <div className="py-14 text-center">
              <Users size={28} className="mx-auto text-muted" />

              <h3 className="mt-3 text-sm font-semibold text-text">
                No submissions yet
              </h3>

              <p className="mt-1 text-xs text-muted">
                Student submissions will appear here when they submit their
                work.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* SUBMISSION SUMMARY */}

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-surfaceHigh p-3">
                  <p className="text-xs text-muted">Total submissions</p>
                  <p className="mt-1 text-xl font-bold text-text">
                    {submissions.length}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-surfaceHigh p-3">
                  <p className="text-xs text-muted">Graded</p>
                  <p className="mt-1 text-xl font-bold text-text">
                    {
                      submissions.filter((item) => item.status === "graded")
                        .length
                    }
                  </p>
                </div>

                <div className="col-span-2 rounded-xl border border-border bg-surfaceHigh p-3 sm:col-span-1">
                  <p className="text-xs text-muted">Awaiting grading</p>
                  <p className="mt-1 text-xl font-bold text-text">
                    {
                      submissions.filter((item) => item.status !== "graded")
                        .length
                    }
                  </p>
                </div>
              </div>

              {/* SUBMISSION CARDS */}

              {submissions.map((submission) => {
                const studentName = getStudentName(submission.student);

                const isGraded = submission.status === "graded";

                return (
                  <div
                    key={submission._id}
                    className="rounded-xl border border-border bg-surface p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        {submission.student?.avatar?.url ? (
                          <img
                            src={submission.student.avatar.url}
                            alt={studentName}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange/10 text-xs font-bold text-orange">
                            {getInitials(studentName)}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-text">
                            {studentName}
                          </p>

                          <p className="truncate text-xs text-muted">
                            {submission.student?.email || ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            isGraded
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          {isGraded ? "Graded" : "Awaiting grading"}
                        </span>

                        {submission.isLate && (
                          <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400">
                            Late
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
                      <span>
                        Submitted: {formatDate(submission.submittedAt)}
                      </span>

                      {isGraded && (
                        <span className="font-semibold text-text">
                          Score: {submission.grade}/{maxGrade}
                        </span>
                      )}
                    </div>

                    {/* STUDENT RESPONSE */}

                    {submission.content && (
                      <div className="mt-4 rounded-xl bg-surfaceHigh p-3">
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted">
                          <MessageSquare size={14} />
                          Student response
                        </div>

                        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-text">
                          {submission.content}
                        </p>
                      </div>
                    )}

                    {/* SUBMISSION ATTACHMENTS */}

                    {Array.isArray(submission.attachments) &&
                      submission.attachments.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-xs font-semibold text-muted">
                            Submitted files
                          </p>

                          {submission.attachments.map((attachment, index) => {
                            const fileUrl =
                              attachment.url || attachment.secure_url || "";

                            return (
                              <div
                                key={attachment.public_id || index}
                                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3"
                              >
                                <div className="flex min-w-0 items-center gap-2">
                                  <FileText
                                    size={16}
                                    className="shrink-0 text-orange"
                                  />

                                  <span className="truncate text-xs text-text">
                                    {attachment.name ||
                                      `Attachment ${index + 1}`}
                                  </span>
                                </div>

                                {fileUrl && (
                                  <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-orange hover:underline"
                                  >
                                    <Download size={13} />
                                    Open file
                                    <ExternalLink size={12} />
                                  </a>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                    {/* SUBMISSION LINKS */}

                    {Array.isArray(submission.links) &&
                      submission.links.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-xs font-semibold text-muted">
                            Submitted links
                          </p>

                          {submission.links.map((link, index) => {
                            const url =
                              typeof link === "string" ? link : link.url;

                            return (
                              url && (
                                <a
                                  key={index}
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-2 break-all text-xs text-orange hover:underline"
                                >
                                  <ExternalLink size={13} />
                                  {url}
                                </a>
                              )
                            );
                          })}
                        </div>
                      )}

                    {/* EXISTING FEEDBACK */}

                    {submission.feedback && (
                      <div className="mt-4 rounded-xl border border-border p-3">
                        <p className="text-xs font-semibold text-muted">
                          Instructor feedback
                        </p>

                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-text">
                          {submission.feedback}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleOpenGrade(submission)}
                        className={buttonPrimary}
                      >
                        <Edit3 size={15} />
                        {isGraded ? "Update grade" : "Grade submission"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ModalShell>
      )}

      {/* =====================================================
          GRADING MODAL
      ====================================================== */}

      {gradingSubmission && (
        <ModalShell
          title="Grade submission"
          subtitle={`Maximum score: ${maxGrade} points`}
          onClose={() => {
            if (!savingGrade) {
              setGradingSubmission(null);
              setGradeForm(INITIAL_GRADE_FORM);
            }
          }}
          size="max-w-xl"
        >
          <form onSubmit={handleGrade} className="space-y-5">
            <div className="rounded-xl border border-border bg-surfaceHigh p-4">
              <p className="text-xs text-muted">Student</p>

              <p className="mt-1 text-sm font-semibold text-text">
                {getStudentName(gradingSubmission.student)}
              </p>

              <p className="mt-1 text-xs text-muted">
                {gradingSubmission.student?.email || ""}
              </p>

              <div className="mt-3 border-t border-border pt-3">
                <p className="text-xs text-muted">Assignment</p>

                <p className="mt-1 text-sm font-semibold text-text">
                  {activeAssignment?.title || "Assignment"}
                </p>
              </div>
            </div>

            <Field
              label={`Grade (out of ${maxGrade})`}
              required
              hint={`Enter a score between 0 and ${maxGrade}.`}
            >
              <input
                type="number"
                min="0"
                max={maxGrade}
                step="0.01"
                value={gradeForm.grade}
                onChange={(event) => setGradeField("grade", event.target.value)}
                placeholder={`Enter grade / ${maxGrade}`}
                className={inputClass}
                required
              />
            </Field>

            <Field
              label="Feedback"
              hint="Give the student useful feedback on their submission. Maximum 2,000 characters."
            >
              <textarea
                value={gradeForm.feedback}
                onChange={(event) =>
                  setGradeField("feedback", event.target.value)
                }
                placeholder="Explain what the student did well and what can be improved..."
                rows={6}
                maxLength={2000}
                className={textareaClass}
              />

              <p className="text-right text-[11px] text-muted">
                {gradeForm.feedback.length}/2000
              </p>
            </Field>

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setGradingSubmission(null);
                  setGradeForm(INITIAL_GRADE_FORM);
                }}
                disabled={savingGrade}
                className={buttonSecondary}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={savingGrade}
                className={buttonPrimary}
              >
                {savingGrade ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={15} />
                )}

                {savingGrade ? "Saving grade..." : "Save grade"}
              </button>
            </div>
          </form>
        </ModalShell>
      )}
    </div>
  );
}
