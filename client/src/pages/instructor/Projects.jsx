// src/pages/instructor/Projects.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  Download,
  Edit3,
  ExternalLink,
  FileText,
  FolderKanban,
  Loader2,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Send,
  Star,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";

import {
  getMyProjects,
  createProject,
  updateProject,
  deleteProject,
  getProjectSubmissions,
  gradeProjectSubmission,
} from "../../services/instructor/projectService";

import { getMyCourses } from "../../services/instructor/courseService";

/* =========================================================
   CONSTANTS
========================================================= */

const INITIAL_FORM = {
  course: "",
  title: "",
  description: "",
  requirements: "",
  type: "individual",
  maxTeamSize: "2",
  dueDate: "",
  totalPoints: "100",
  passingPoints: "50",
  isCapstone: false,
  isPublished: false,
  rubric: [],
};

const INITIAL_GRADE_FORM = {
  grade: "",
  letterGrade: "",
  feedback: "",
  rubricGrades: [],
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
  if (Array.isArray(payload?.projects)) return payload.projects;
  if (Array.isArray(payload?.courses)) return payload.courses;

  return [];
};

const getResponseObject = (response) => {
  const payload = response?.data?.data;

  return payload && !Array.isArray(payload) ? payload : null;
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

const getInitials = (name) =>
  String(name || "S")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const requirementToText = (item) =>
  typeof item === "string" ? item : item?.text || item?.title || "";

// Submission field names can vary, so collect every link-like field
const getSubmissionLinks = (submission) => {
  const links = [];

  [
    ["Repository", submission.repoUrl || submission.githubUrl],
    ["Live demo", submission.liveUrl || submission.demoUrl],
  ].forEach(([label, url]) => {
    if (url) links.push({ label, url });
  });

  if (Array.isArray(submission.links)) {
    submission.links.forEach((link, index) => {
      const url = typeof link === "string" ? link : link?.url;

      if (url) {
        links.push({
          label:
            (typeof link === "object" && link.label) || `Link ${index + 1}`,
          url,
        });
      }
    });
  }

  return links;
};

const getSubmissionFiles = (submission) => {
  const files = submission.attachments || submission.files;

  return Array.isArray(files) ? files : [];
};

const getTeamMembers = (submission) => {
  const members = submission.teamMembers || submission.members;

  return Array.isArray(members) ? members : [];
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
    <label
      className={`flex items-start justify-between gap-4 rounded-xl border border-border bg-surfaceHigh p-4 ${
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      }`}
    >
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

/* Rendered on document.body so a transformed ancestor ("fi") cannot
   trap position: fixed. Header is fixed; only the body scrolls. */
function ModalShell({
  title,
  subtitle,
  onClose,
  children,
  size = "max-w-3xl",
  zIndex = "z-[1000]",
}) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`fixed inset-0 ${zIndex} flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-5`}
      role="presentation"
    >
      <div
        className={`flex w-full ${size} min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl`}
        style={{ maxHeight: "calc(100dvh - 1.5rem)" }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border bg-surface px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-text">{title}</h2>

            {subtitle && (
              <p className="mt-1 text-xs leading-5 text-muted">{subtitle}</p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-muted transition hover:bg-surfaceHigh hover:text-text"
            aria-label="Close modal"
          >
            <X size={19} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-5 py-5 pb-8 sm:px-6">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [showCreate, setShowCreate] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
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
     LOCK BACKGROUND SCROLL WHILE A MODAL IS OPEN
  ------------------------------------------------------- */

  const isAnyModalOpen =
    showCreate || Boolean(showSubmissions) || Boolean(gradingSubmission);

  useEffect(() => {
    if (!isAnyModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [isAnyModalOpen]);

  /* -------------------------------------------------------
     ACTIVE PROJECT / GRADE LIMIT
  ------------------------------------------------------- */

  const activeProject = useMemo(
    () => projects.find((project) => project._id === showSubmissions) || null,
    [projects, showSubmissions],
  );

  const maxGrade = Math.max(0, Number(activeProject?.totalPoints ?? 100));

  const activeRubric = useMemo(
    () => (Array.isArray(activeProject?.rubric) ? activeProject.rubric : []),
    [activeProject],
  );

  /* -------------------------------------------------------
     FORM HELPERS
  ------------------------------------------------------- */

  const setFormField = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const setGradeField = (field, value) =>
    setGradeForm((current) => ({ ...current, [field]: value }));

  /* -------------------------------------------------------
     LOAD DATA
  ------------------------------------------------------- */

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [projectResponse, courseResponse] = await Promise.all([
        getMyProjects(),
        getMyCourses(),
      ]);

      setProjects(getResponseList(projectResponse));
      setCourses(getResponseList(courseResponse));
    } catch (error) {
      console.error("LOAD PROJECTS ERROR:", error);
      toast.error(getErrorMessage(error, "Failed to load projects"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* -------------------------------------------------------
     OPEN / CLOSE FORM
  ------------------------------------------------------- */

  const resetForm = () =>
    setForm({ ...INITIAL_FORM, course: courses[0]?._id || "" });

  const handleOpenCreate = () => {
    setEditingProject(null);
    resetForm();
    setShowCreate(true);
  };

  const handleOpenEdit = (project) => {
    setEditingProject(project);

    setForm({
      course: getCourseId(project.course),
      title: project.title || "",
      description: project.description || "",
      requirements: Array.isArray(project.requirements)
        ? project.requirements.map(requirementToText).filter(Boolean).join("\n")
        : "",
      type: project.type || "individual",
      maxTeamSize: String(project.maxTeamSize ?? 2),
      dueDate: toDateTimeLocal(project.dueDate),
      totalPoints: String(project.totalPoints ?? 100),
      passingPoints: String(project.passingPoints ?? 50),
      isCapstone: Boolean(project.isCapstone),
      isPublished: Boolean(project.isPublished),
      rubric: Array.isArray(project.rubric)
        ? project.rubric.map((item) => ({
            criterion: item.criterion || "",
            description: item.description || "",
            points: String(item.points ?? ""),
          }))
        : [],
    });

    setShowCreate(true);
  };

  const handleCloseForm = () => {
    if (saving) return;

    setShowCreate(false);
    setEditingProject(null);
    resetForm();
  };

  /* -------------------------------------------------------
     RUBRIC
  ------------------------------------------------------- */

  const addRubricCriterion = () =>
    setForm((current) => ({
      ...current,
      rubric: [
        ...current.rubric,
        { criterion: "", description: "", points: "" },
      ],
    }));

  const updateRubricCriterion = (index, field, value) =>
    setForm((current) => ({
      ...current,
      rubric: current.rubric.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));

  const removeRubricCriterion = (index) =>
    setForm((current) => ({
      ...current,
      rubric: current.rubric.filter((_, itemIndex) => itemIndex !== index),
    }));

  const rubricTotal = useMemo(
    () => form.rubric.reduce((sum, item) => sum + Number(item.points || 0), 0),
    [form.rubric],
  );

  /* -------------------------------------------------------
     VALIDATE
  ------------------------------------------------------- */

  const validateForm = () => {
    if (!form.course) {
      toast.error("Select a course");
      return false;
    }

    if (form.title.trim().length < 3) {
      toast.error("Project title must be at least 3 characters");
      return false;
    }

    if (form.title.trim().length > 100) {
      toast.error("Project title cannot exceed 100 characters");
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

    // A past due date is only rejected when it is new or has been changed
    const dueDateChanged =
      !editingProject ||
      form.dueDate !== toDateTimeLocal(editingProject.dueDate);

    if (!form.dueDate || (dueDateChanged && !isFutureDate(form.dueDate))) {
      toast.error("Choose a future due date");
      return false;
    }

    const totalPoints = Number(form.totalPoints);
    const passingPoints = Number(form.passingPoints);

    if (!Number.isFinite(totalPoints) || totalPoints <= 0) {
      toast.error("Total points must be greater than zero");
      return false;
    }

    if (!Number.isFinite(passingPoints) || passingPoints < 0) {
      toast.error("Passing points cannot be negative");
      return false;
    }

    if (passingPoints > totalPoints) {
      toast.error("Passing points cannot exceed total points");
      return false;
    }

    if (form.type === "team") {
      const teamSize = Number(form.maxTeamSize);

      if (!Number.isInteger(teamSize) || teamSize < 2) {
        toast.error("Team projects need a maximum team size of at least 2");
        return false;
      }
    }

    if (rubricTotal > totalPoints) {
      toast.error("Rubric points cannot exceed the project total points");
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

    return true;
  };

  /* -------------------------------------------------------
     SAVE
  ------------------------------------------------------- */

  const handleSaveProject = async (event) => {
    event.preventDefault();

    if (saving || !validateForm()) return;

    const payload = {
      course: form.course,
      title: form.title.trim(),
      description: form.description.trim(),
      requirements: form.requirements
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      type: form.type,
      maxTeamSize: form.type === "team" ? Number(form.maxTeamSize) : 1,
      dueDate: new Date(form.dueDate).toISOString(),
      totalPoints: Number(form.totalPoints),
      passingPoints: Number(form.passingPoints),
      isCapstone: Boolean(form.isCapstone),
      isPublished: Boolean(form.isPublished),
      rubric: form.rubric.map((item) => ({
        criterion: item.criterion.trim(),
        description: item.description.trim(),
        points: Number(item.points),
      })),
    };

    try {
      setSaving(true);

      const selectedCourse = courses.find(
        (course) => course._id === payload.course,
      );

      if (editingProject?._id) {
        const response = await updateProject(editingProject._id, payload);
        const updated = getResponseObject(response);

        setProjects((current) =>
          current.map((item) =>
            item._id === editingProject._id
              ? {
                  ...item,
                  ...(updated || payload),
                  course: updated?.course || selectedCourse || item.course,
                }
              : item,
          ),
        );

        toast.success("Project updated successfully");
      } else {
        const response = await createProject(payload);
        const created = getResponseObject(response);

        if (!created?._id) {
          throw new Error("The server did not return the created project");
        }

        setProjects((current) => [
          { ...created, course: created.course || selectedCourse },
          ...current,
        ]);

        toast.success("Project created successfully");
      }

      setShowCreate(false);
      setEditingProject(null);
      resetForm();
    } catch (error) {
      console.error("SAVE PROJECT ERROR:", error);
      toast.error(getErrorMessage(error, "Failed to save project"));
    } finally {
      setSaving(false);
    }
  };

  /* -------------------------------------------------------
     DELETE / PUBLISH
  ------------------------------------------------------- */

  const handleDeleteProject = async (project) => {
    const confirmed = window.confirm(
      `Delete "${project.title}"?\n\nProjects with student submissions cannot be deleted.`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(project._id);

      await deleteProject(project._id);

      setProjects((current) =>
        current.filter((item) => item._id !== project._id),
      );

      toast.success("Project deleted successfully");
    } catch (error) {
      console.error("DELETE PROJECT ERROR:", error);
      toast.error(getErrorMessage(error, "Failed to delete project"));
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublish = async (project) => {
    const nextPublished = !project.isPublished;

    try {
      setUpdatingPublishId(project._id);

      const response = await updateProject(project._id, {
        isPublished: nextPublished,
      });

      const updated = getResponseObject(response);

      setProjects((current) =>
        current.map((item) =>
          item._id === project._id
            ? { ...item, isPublished: updated?.isPublished ?? nextPublished }
            : item,
        ),
      );

      toast.success(
        nextPublished ? "Project published" : "Project moved to drafts",
      );
    } catch (error) {
      console.error("PUBLISH PROJECT ERROR:", error);
      toast.error(getErrorMessage(error, "Unable to update project status"));
    } finally {
      setUpdatingPublishId(null);
    }
  };

  /* -------------------------------------------------------
     SUBMISSIONS
  ------------------------------------------------------- */

  const handleViewSubmissions = async (project) => {
    setShowSubmissions(project._id);
    setSubmissions([]);
    setGradingSubmission(null);

    try {
      setLoadingSubmissions(true);

      const response = await getProjectSubmissions(project._id);

      setSubmissions(getResponseList(response));
    } catch (error) {
      console.error("LOAD PROJECT SUBMISSIONS ERROR:", error);
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
     GRADING
  ------------------------------------------------------- */

  const handleOpenGrade = (submission) => {
    setGradingSubmission(submission);

    const existing = Array.isArray(submission.rubricGrades)
      ? submission.rubricGrades
      : [];

    setGradeForm({
      grade:
        submission.grade === null || submission.grade === undefined
          ? ""
          : String(submission.grade),
      letterGrade: submission.letterGrade || "",
      feedback: submission.feedback || "",
      rubricGrades: activeRubric.map((item, index) => {
        const match =
          existing.find((entry) => entry.criterion === item.criterion) ||
          existing[index];

        return {
          criterion: item.criterion,
          pointsEarned:
            match?.pointsEarned === undefined || match?.pointsEarned === null
              ? ""
              : String(match.pointsEarned),
        };
      }),
    });
  };

  const closeGrading = () => {
    if (savingGrade) return;

    setGradingSubmission(null);
    setGradeForm(INITIAL_GRADE_FORM);
  };

  const updateRubricGrade = (index, value) =>
    setGradeForm((current) => ({
      ...current,
      rubricGrades: current.rubricGrades.map((item, itemIndex) =>
        itemIndex === index ? { ...item, pointsEarned: value } : item,
      ),
    }));

  const rubricEarnedTotal = useMemo(
    () =>
      gradeForm.rubricGrades.reduce(
        (sum, item) => sum + Number(item.pointsEarned || 0),
        0,
      ),
    [gradeForm.rubricGrades],
  );

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

    for (let index = 0; index < gradeForm.rubricGrades.length; index += 1) {
      const entered = gradeForm.rubricGrades[index].pointsEarned;

      if (entered === "") continue;

      const earned = Number(entered);
      const available = Number(activeRubric[index]?.points ?? 0);

      if (!Number.isFinite(earned) || earned < 0 || earned > available) {
        toast.error(
          `"${activeRubric[index]?.criterion}" must be between 0 and ${available}`,
        );
        return;
      }
    }

    if (gradeForm.letterGrade.length > 3) {
      toast.error("Letter grade cannot exceed 3 characters");
      return;
    }

    if (gradeForm.feedback.length > 2000) {
      toast.error("Feedback cannot exceed 2000 characters");
      return;
    }

    const hasRubricEntries = gradeForm.rubricGrades.some(
      (item) => item.pointsEarned !== "",
    );

    const payload = {
      grade: numericGrade,
      letterGrade: gradeForm.letterGrade.trim() || null,
      feedback: gradeForm.feedback.trim(),
    };

    if (hasRubricEntries) {
      payload.rubricGrades = gradeForm.rubricGrades.map((item) => ({
        criterion: item.criterion,
        pointsEarned: Number(item.pointsEarned || 0),
      }));
    }

    try {
      setSavingGrade(true);

      const wasGraded = gradingSubmission.status === "graded";

      const response = await gradeProjectSubmission(
        gradingSubmission._id,
        payload,
      );

      const updatedSubmission = getResponseObject(response);

      setSubmissions((current) =>
        current.map((item) =>
          item._id === gradingSubmission._id
            ? {
                ...item,
                ...(updatedSubmission || {}),
                grade: numericGrade,
                letterGrade: payload.letterGrade,
                feedback: payload.feedback,
                status: "graded",
                gradedAt: new Date().toISOString(),
              }
            : item,
        ),
      );

      if (!wasGraded && showSubmissions) {
        setProjects((current) =>
          current.map((item) =>
            item._id === showSubmissions
              ? { ...item, totalGraded: Number(item.totalGraded || 0) + 1 }
              : item,
          ),
        );
      }

      setGradingSubmission(null);
      setGradeForm(INITIAL_GRADE_FORM);

      toast.success("Submission graded successfully");
    } catch (error) {
      console.error("GRADE PROJECT ERROR:", error);
      toast.error(getErrorMessage(error, "Failed to grade submission"));
    } finally {
      setSavingGrade(false);
    }
  };

  /* -------------------------------------------------------
     FILTERING / STATS
  ------------------------------------------------------- */

  const filteredProjects = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesSearch =
        !normalizedSearch ||
        project.title?.toLowerCase().includes(normalizedSearch) ||
        getCourseTitle(project.course).toLowerCase().includes(normalizedSearch);

      const matchesFilter =
        filter === "all" ||
        (filter === "published" && project.isPublished) ||
        (filter === "draft" && !project.isPublished) ||
        (filter === "capstone" && project.isCapstone);

      return matchesSearch && matchesFilter;
    });
  }, [projects, search, filter]);

  const publishedCount = projects.filter((item) => item.isPublished).length;
  const draftCount = projects.length - publishedCount;

  const submissionCount = projects.reduce(
    (sum, item) =>
      sum + Number(item.stats?.totalSubmissions ?? item.totalSubmissions ?? 0),
    0,
  );

  /* -------------------------------------------------------
     LOADING
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
            <FolderKanban size={15} />
            Instructor workspace
          </div>

          <h1 className="mt-2 text-2xl font-bold text-text sm:text-3xl">
            Projects
          </h1>

          <p className="mt-1 max-w-xl text-sm leading-6 text-muted">
            Create individual, team and capstone projects, review student work
            and grade submissions.
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
            Create Project
          </button>
        </div>
      </div>

      {/* NO COURSES */}

      {courses.length === 0 && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
          <div className="flex items-start gap-3">
            <BookOpen className="mt-0.5 shrink-0 text-amber-400" />

            <div>
              <h3 className="text-sm font-semibold text-text">
                No courses available
              </h3>

              <p className="mt-1 text-xs leading-5 text-muted">
                You need a course before you can create projects.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STATS */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">
              Total projects
            </span>

            <FolderKanban size={18} className="text-orange" />
          </div>

          <p className="mt-3 text-2xl font-bold text-text">{projects.length}</p>

          <p className="mt-1 text-xs text-muted">Across your courses</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">
              Published projects
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

          <p className="mt-1 text-xs text-muted">Recorded across projects</p>
        </div>
      </div>

      {/* SEARCH / FILTER */}

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
            placeholder="Search projects or courses..."
            className={`${inputClass} pl-10`}
          />
        </div>

        <div className="relative sm:w-48">
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className={`${inputClass} appearance-none pr-10`}
          >
            <option value="all">All projects</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="capstone">Capstone</option>
          </select>

          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
        </div>
      </div>

      {/* LIST */}

      {filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface px-5 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange/10 text-orange">
            <FolderKanban size={25} />
          </div>

          <h3 className="mt-4 text-base font-semibold text-text">
            {projects.length === 0 ? "No projects yet" : "No matching projects"}
          </h3>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
            {projects.length === 0
              ? "Create your first project and make it available to your students."
              : "Try a different search term or change the project filter."}
          </p>

          {projects.length === 0 && courses.length > 0 && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className={`${buttonPrimary} mt-5`}
            >
              <Plus size={16} />
              Create your first project
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProjects.map((project) => {
            const totalSubmissions = Number(
              project.stats?.totalSubmissions ?? project.totalSubmissions ?? 0,
            );

            const totalGraded = Number(
              project.stats?.totalGraded ?? project.totalGraded ?? 0,
            );

            const isDeleting = deletingId === project._id;

            return (
              <div
                key={project._id}
                className="rounded-2xl border border-border bg-surface p-4 transition hover:border-orange/30 sm:p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge published={project.isPublished} />

                      {project.isCapstone && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2.5 py-1 text-xs font-semibold text-violet-400">
                          <Star size={12} />
                          Capstone
                        </span>
                      )}

                      <span className="rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-semibold text-sky-400">
                        {project.type === "team"
                          ? `Team · up to ${project.maxTeamSize}`
                          : "Individual"}
                      </span>

                      <span className="rounded-full bg-surfaceHigh px-2.5 py-1 text-xs text-muted">
                        {getCourseTitle(project.course)}
                      </span>
                    </div>

                    <h3 className="mt-3 break-words text-base font-bold text-text">
                      {project.title}
                    </h3>

                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">
                      {project.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={14} />
                        Due: {formatDate(project.dueDate)}
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <FolderKanban size={14} />
                        {project.totalPoints ?? 100} points
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
                      onClick={() => handleViewSubmissions(project)}
                      className={buttonPrimary}
                    >
                      <Users size={15} />
                      Submissions
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(project)}
                      className={buttonSecondary}
                    >
                      <Edit3 size={15} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTogglePublish(project)}
                      disabled={updatingPublishId === project._id}
                      className={buttonSecondary}
                    >
                      {updatingPublishId === project._id ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Check size={15} />
                      )}

                      {project.isPublished ? "Unpublish" : "Publish"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteProject(project)}
                      disabled={isDeleting}
                      className="inline-flex items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 p-2.5 text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                      title="Delete project"
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
          CREATE / EDIT PROJECT MODAL
      ====================================================== */}

      {showCreate && (
        <ModalShell
          title={editingProject ? "Edit project" : "Create project"}
          subtitle="Configure the project details, team settings and grading rules."
          onClose={handleCloseForm}
          size="max-w-4xl"
        >
          <form onSubmit={handleSaveProject} className="space-y-7">
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
                      {course.title || course.name || "Untitled course"}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Project title" required>
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    setFormField("title", event.target.value)
                  }
                  placeholder="e.g. Build a full-stack task manager"
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
                hint="At least 10 characters. Explain what students must build."
              >
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setFormField("description", event.target.value)
                  }
                  placeholder="Describe the project goals and deliverables..."
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
                label="Requirements"
                hint="One requirement per line. Students see these as a checklist."
              >
                <textarea
                  value={form.requirements}
                  onChange={(event) =>
                    setFormField("requirements", event.target.value)
                  }
                  placeholder={
                    "User authentication\nResponsive layout\nDeployed live link"
                  }
                  rows={5}
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

            {/* PROJECT TYPE */}

            <section className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-text">Project type</h3>

                <p className="mt-1 text-xs text-muted">
                  Choose whether students work alone or in teams.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Type" required>
                  <select
                    value={form.type}
                    onChange={(event) =>
                      setFormField("type", event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="individual">Individual</option>
                    <option value="team">Team</option>
                  </select>
                </Field>

                {form.type === "team" && (
                  <Field
                    label="Maximum team size"
                    required
                    hint="Minimum of 2 members."
                  >
                    <input
                      type="number"
                      min="2"
                      step="1"
                      value={form.maxTeamSize}
                      onChange={(event) =>
                        setFormField("maxTeamSize", event.target.value)
                      }
                      className={inputClass}
                    />
                  </Field>
                )}
              </div>

              <Toggle
                checked={form.isCapstone}
                onChange={(value) => setFormField("isCapstone", value)}
                label="Capstone project"
                description="Mark this as the final capstone project for the course."
              />
            </section>

            <div className="border-t border-border" />

            {/* GRADING */}

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
                    min="0"
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
                    Break the project into measurable criteria.
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
                  <FolderKanban size={22} className="mx-auto text-muted" />

                  <p className="mt-2 text-sm font-medium text-text">
                    No rubric criteria
                  </p>

                  <p className="mt-1 text-xs text-muted">
                    You can create the project without a rubric, or add criteria
                    to guide your grading.
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

            {/* PUBLISH */}

            <section className="space-y-3">
              <h3 className="text-sm font-bold text-text">Publishing</h3>

              <Toggle
                checked={form.isPublished}
                onChange={(value) => setFormField("isPublished", value)}
                label="Publish project immediately"
                description="When enabled, the project is visible to students. Otherwise, it remains a draft."
                disabled={saving}
              />
            </section>

            {/* ACTIONS */}

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
                  : editingProject
                    ? "Save changes"
                    : "Create project"}
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
            activeProject
              ? `${activeProject.title} · ${activeProject.totalPoints} points`
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

              {submissions.map((submission) => {
                const studentName = getStudentName(submission.student);
                const isGraded = submission.status === "graded";
                const links = getSubmissionLinks(submission);
                const files = getSubmissionFiles(submission);
                const team = getTeamMembers(submission);
                const responseText =
                  submission.content ||
                  submission.description ||
                  submission.notes ||
                  "";

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
                        Submitted:{" "}
                        {formatDate(
                          submission.submittedAt || submission.createdAt,
                        )}
                      </span>

                      {isGraded && (
                        <span className="font-semibold text-text">
                          Score: {submission.grade}/{maxGrade}
                          {submission.letterGrade
                            ? ` (${submission.letterGrade})`
                            : ""}
                        </span>
                      )}
                    </div>

                    {team.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-muted">
                          Team members
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {team.map((member, index) => (
                            <span
                              key={member._id || index}
                              className="rounded-full bg-surfaceHigh px-2.5 py-1 text-xs text-text"
                            >
                              {getStudentName(member.student || member)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {responseText && (
                      <div className="mt-4 rounded-xl bg-surfaceHigh p-3">
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted">
                          <MessageSquare size={14} />
                          Student response
                        </div>

                        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-text">
                          {responseText}
                        </p>
                      </div>
                    )}

                    {links.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-xs font-semibold text-muted">
                          Submitted links
                        </p>

                        {links.map((link, index) => (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 break-all text-xs text-orange hover:underline"
                          >
                            <ExternalLink size={13} />
                            {link.label}: {link.url}
                          </a>
                        ))}
                      </div>
                    )}

                    {files.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-xs font-semibold text-muted">
                          Submitted files
                        </p>

                        {files.map((attachment, index) => {
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
                                  {attachment.name || `Attachment ${index + 1}`}
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
          zIndex="z-[1100]"
          onClose={closeGrading}
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
                <p className="text-xs text-muted">Project</p>

                <p className="mt-1 text-sm font-semibold text-text">
                  {activeProject?.title || "Project"}
                </p>
              </div>
            </div>

            {activeRubric.length > 0 && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-text">
                    Rubric scoring
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setGradeField("grade", String(rubricEarnedTotal))
                    }
                    className="text-xs font-semibold text-orange hover:underline"
                  >
                    Use rubric total ({rubricEarnedTotal})
                  </button>
                </div>

                {activeRubric.map((item, index) => (
                  <div
                    key={`${item.criterion}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surfaceHigh p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text">
                        {item.criterion}
                      </p>

                      <p className="text-xs text-muted">Out of {item.points}</p>
                    </div>

                    <input
                      type="number"
                      min="0"
                      max={item.points}
                      step="0.01"
                      value={gradeForm.rubricGrades[index]?.pointsEarned ?? ""}
                      onChange={(event) =>
                        updateRubricGrade(index, event.target.value)
                      }
                      placeholder="0"
                      className={`${inputClass} w-24 shrink-0`}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_140px]">
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
                  onChange={(event) =>
                    setGradeField("grade", event.target.value)
                  }
                  placeholder={`Enter grade / ${maxGrade}`}
                  className={inputClass}
                  required
                />
              </Field>

              <Field label="Letter grade" hint="Optional, e.g. A">
                <input
                  type="text"
                  maxLength={3}
                  value={gradeForm.letterGrade}
                  onChange={(event) =>
                    setGradeField(
                      "letterGrade",
                      event.target.value.toUpperCase(),
                    )
                  }
                  placeholder="A"
                  className={inputClass}
                />
              </Field>
            </div>

            <Field
              label="Feedback"
              hint="Give the student useful feedback on their project. Maximum 2,000 characters."
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
                onClick={closeGrading}
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
