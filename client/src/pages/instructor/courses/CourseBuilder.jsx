import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Edit3,
  FileText,
  HelpCircle,
  Loader2,
  Plus,
  PlayCircle,
  RefreshCw,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { getCourse } from "../../../services/instructor/courseService";

import {
  getModules,
  createModule,
  deleteModule,
} from "../../../services/instructor/moduleService";

import {
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  uploadVideo,
} from "../../../services/instructor/lessonService";

import Input from "../../../components/common/Input";
import Select from "../../../components/common/Select";
import Modal from "../../../components/common/Modal";
import { SkeletonCard } from "../../../components/common/Skeleton";

const INITIAL_LESSON_FORM = {
  title: "",
  description: "",
  type: "video",
  duration: 0,
  content: "",
  notes: "",
  isFreePreview: false,
};

const LESSON_TYPES = [
  {
    value: "video",
    label: "Video",
  },
  {
    value: "text",
    label: "Text / Article",
  },
  {
    value: "quiz",
    label: "Quiz",
  },
  {
    value: "assignment",
    label: "Assignment",
  },
  {
    value: "live",
    label: "Live Class",
  },
];

const getLessonIcon = (type) => {
  switch (type) {
    case "video":
      return PlayCircle;

    case "text":
      return FileText;

    case "quiz":
      return HelpCircle;

    case "assignment":
      return BookOpen;

    case "live":
      return Video;

    default:
      return FileText;
  }
};

const getLessonDuration = (lesson) => {
  const duration = Number(
    lesson?.video?.duration ?? lesson?.duration ?? 0
  );

  if (!Number.isFinite(duration) || duration < 0) {
    return 0;
  }

  return duration;
};

export default function CourseBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState({});

  const [loading, setLoading] = useState(true);
  const [loadingLessons, setLoadingLessons] = useState({});

  const [expanded, setExpanded] = useState(null);

  /* Module */
  const [addingModule, setAddingModule] = useState(false);
  const [moduleTitle, setModuleTitle] = useState("");
  const [savingModule, setSavingModule] = useState(false);
  const [deletingModule, setDeletingModule] = useState(null);

  /* Lesson */
  const [addingLesson, setAddingLesson] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [deletingLesson, setDeletingLesson] = useState(null);

  const [lessonForm, setLessonForm] = useState(
    INITIAL_LESSON_FORM
  );

  const [savingLesson, setSavingLesson] = useState(false);

  /* Video */
  const [uploadingVideo, setUploadingVideo] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  /* -----------------------------------------------------------
     LOAD COURSE
  ----------------------------------------------------------- */

  useEffect(() => {
    let mounted = true;

    const loadCourse = async () => {
      try {
        setLoading(true);

        const [courseResponse, modulesResponse] =
          await Promise.all([
            getCourse(id),
            getModules(id),
          ]);

        if (!mounted) return;

        setCourse(courseResponse?.data?.data || null);
        setModules(modulesResponse?.data?.data || []);
      } catch (error) {
        console.error("COURSE BUILDER LOAD ERROR:", error);

        if (mounted) {
          toast.error(
            error?.response?.data?.message ||
              "Failed to load course"
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      loadCourse();
    }

    return () => {
      mounted = false;
    };
  }, [id]);

  /* -----------------------------------------------------------
     LOAD LESSONS
  ----------------------------------------------------------- */

  const loadLessons = async (moduleId, force = false) => {
    if (!moduleId) return;

    if (!force && lessons[moduleId]) {
      return;
    }

    try {
      setLoadingLessons((current) => ({
        ...current,
        [moduleId]: true,
      }));

      const response = await getLessons(moduleId);

      setLessons((current) => ({
        ...current,
        [moduleId]: response?.data?.data || [],
      }));
    } catch (error) {
      console.error("LOAD LESSONS ERROR:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to load lessons"
      );
    } finally {
      setLoadingLessons((current) => ({
        ...current,
        [moduleId]: false,
      }));
    }
  };

  const handleExpand = async (moduleId) => {
    if (expanded === moduleId) {
      setExpanded(null);
      return;
    }

    setExpanded(moduleId);

    await loadLessons(moduleId);
  };

  /* -----------------------------------------------------------
     MODULE
  ----------------------------------------------------------- */

  const handleAddModule = async () => {
    const title = moduleTitle.trim();

    if (!title) {
      toast.error("Module title required");
      return;
    }

    try {
      setSavingModule(true);

      const response = await createModule(id, {
        title,
        order: modules.length + 1,
      });

      const newModule = response?.data?.data;

      if (!newModule) {
        throw new Error("Invalid module response");
      }

      setModules((current) => [
        ...current,
        newModule,
      ]);

      setModuleTitle("");
      setAddingModule(false);

      toast.success("Module added successfully");
    } catch (error) {
      console.error("CREATE MODULE ERROR:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to add module"
      );
    } finally {
      setSavingModule(false);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    const module = modules.find(
      (item) => item._id === moduleId
    );

    const confirmed = window.confirm(
      `Delete "${module?.title || "this module"}"? This may also delete its lessons.`
    );

    if (!confirmed) return;

    try {
      setDeletingModule(moduleId);

      await deleteModule(id, moduleId);

      setModules((current) =>
        current.filter(
          (item) => item._id !== moduleId
        )
      );

      setLessons((current) => {
        const next = { ...current };
        delete next[moduleId];
        return next;
      });

      if (expanded === moduleId) {
        setExpanded(null);
      }

      toast.success("Module deleted successfully");
    } catch (error) {
      console.error("DELETE MODULE ERROR:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to delete module"
      );
    } finally {
      setDeletingModule(null);
    }
  };

  /* -----------------------------------------------------------
     LESSON MODALS
  ----------------------------------------------------------- */

  const resetLessonForm = () => {
    setLessonForm(INITIAL_LESSON_FORM);
    setSelectedVideo(null);
  };

  const handleOpenAddLesson = (moduleId) => {
    resetLessonForm();
    setEditingLesson(null);
    setAddingLesson(moduleId);
  };

  const handleOpenEditLesson = (moduleId, lesson) => {
    setAddingLesson(null);
    setEditingLesson({
      moduleId,
      lesson,
    });

    setLessonForm({
      title: lesson?.title || "",
      description: lesson?.description || "",
      type: lesson?.type || "video",
      duration: getLessonDuration(lesson),
      content: lesson?.content || "",
      notes: lesson?.notes || "",
      isFreePreview: !!lesson?.isFreePreview,
    });

    setSelectedVideo(null);
  };

  const handleCloseLessonModal = () => {
    if (savingLesson) return;

    setAddingLesson(null);
    setEditingLesson(null);

    resetLessonForm();
  };

  /* -----------------------------------------------------------
     CREATE LESSON
  ----------------------------------------------------------- */

  const handleAddLesson = async () => {
    if (!addingLesson) {
      toast.error("Select a module first");
      return;
    }

    const title = lessonForm.title.trim();

    if (!title) {
      toast.error("Lesson title required");
      return;
    }

    const duration = Number(lessonForm.duration);

    if (!Number.isFinite(duration) || duration < 0) {
      toast.error("Duration must be a valid number");
      return;
    }

    const currentLessons =
      lessons[addingLesson] || [];

    try {
      setSavingLesson(true);

      const response = await createLesson(
        addingLesson,
        {
          title,
          description:
            lessonForm.description.trim() || undefined,
          type: lessonForm.type,
          duration,
          content:
            lessonForm.content.trim() || undefined,
          notes:
            lessonForm.notes.trim() || undefined,
          isFreePreview:
            lessonForm.isFreePreview,
          order: currentLessons.length + 1,
        }
      );

      const newLesson = response?.data?.data;

      if (!newLesson) {
        throw new Error("Invalid lesson response");
      }

      setLessons((current) => ({
        ...current,
        [addingLesson]: [
          ...(current[addingLesson] || []),
          newLesson,
        ],
      }));

      setModules((current) =>
        current.map((module) =>
          module._id === addingLesson
            ? {
                ...module,
                totalLessons:
                  Number(module.totalLessons || 0) + 1,
              }
            : module
        )
      );

      toast.success("Lesson added successfully");

      handleCloseLessonModal();
    } catch (error) {
      console.error("CREATE LESSON ERROR:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to add lesson"
      );
    } finally {
      setSavingLesson(false);
    }
  };

  /* -----------------------------------------------------------
     UPDATE LESSON
  ----------------------------------------------------------- */

  const handleUpdateLesson = async () => {
    if (!editingLesson) return;

    const {
      moduleId,
      lesson,
    } = editingLesson;

    const title = lessonForm.title.trim();

    if (!title) {
      toast.error("Lesson title required");
      return;
    }

    const duration = Number(lessonForm.duration);

    if (!Number.isFinite(duration) || duration < 0) {
      toast.error("Duration must be a valid number");
      return;
    }

    try {
      setSavingLesson(true);

      const response = await updateLesson(
        moduleId,
        lesson._id,
        {
          title,
          description:
            lessonForm.description.trim() || "",
          type: lessonForm.type,
          duration,
          content:
            lessonForm.content.trim() || "",
          notes:
            lessonForm.notes.trim() || "",
          isFreePreview:
            lessonForm.isFreePreview,
        }
      );

      const updatedLesson =
        response?.data?.data;

      if (!updatedLesson) {
        throw new Error(
          "Invalid lesson update response"
        );
      }

      setLessons((current) => ({
        ...current,
        [moduleId]: (
          current[moduleId] || []
        ).map((item) =>
          item._id === lesson._id
            ? updatedLesson
            : item
        ),
      }));

      toast.success(
        "Lesson updated successfully"
      );

      handleCloseLessonModal();
    } catch (error) {
      console.error("UPDATE LESSON ERROR:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to update lesson"
      );
    } finally {
      setSavingLesson(false);
    }
  };

  /* -----------------------------------------------------------
     DELETE LESSON
  ----------------------------------------------------------- */

  const handleDeleteLesson = async (
    moduleId,
    lessonId
  ) => {
    const moduleLessons =
      lessons[moduleId] || [];

    const lesson = moduleLessons.find(
      (item) => item._id === lessonId
    );

    const confirmed = window.confirm(
      `Delete "${lesson?.title || "this lesson"}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingLesson(lessonId);

      await deleteLesson(
        moduleId,
        lessonId
      );

      setLessons((current) => ({
        ...current,
        [moduleId]: (
          current[moduleId] || []
        ).filter(
          (item) => item._id !== lessonId
        ),
      }));

      setModules((current) =>
        current.map((module) =>
          module._id === moduleId
            ? {
                ...module,
                totalLessons: Math.max(
                  0,
                  Number(
                    module.totalLessons || 0
                  ) - 1
                ),
              }
            : module
        )
      );

      toast.success(
        "Lesson deleted successfully"
      );
    } catch (error) {
      console.error("DELETE LESSON ERROR:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to delete lesson"
      );
    } finally {
      setDeletingLesson(null);
    }
  };

  /* -----------------------------------------------------------
     VIDEO SELECTION
  ----------------------------------------------------------- */

  const handleVideoSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file");
      event.target.value = "";
      return;
    }

    setSelectedVideo(file);

    /*
      Read video duration from the selected file.
      This lets us send the actual duration to the backend.
    */
    const videoElement =
      document.createElement("video");

    videoElement.preload = "metadata";

    videoElement.onloadedmetadata = () => {
      window.URL.revokeObjectURL(
        videoElement.src
      );

      const duration = Math.round(
        videoElement.duration / 60
      );

      setLessonForm((current) => ({
        ...current,
        duration:
          Number.isFinite(duration)
            ? duration
            : current.duration,
      }));
    };

    videoElement.onerror = () => {
      window.URL.revokeObjectURL(
        videoElement.src
      );
    };

    videoElement.src =
      window.URL.createObjectURL(file);
  };

  /* -----------------------------------------------------------
     VIDEO UPLOAD
  ----------------------------------------------------------- */

  const handleUploadVideo = async (
    lessonId
  ) => {
    if (!selectedVideo) {
      toast.error("Select a video first");
      return;
    }

    try {
      setUploadingVideo(lessonId);

      const formData = new FormData();

      formData.append(
        "video",
        selectedVideo
      );

      formData.append(
        "duration",
        String(lessonForm.duration || 0)
      );

      const response = await uploadVideo(
        lessonId,
        formData
      );

      const updatedLesson =
        response?.data?.data;

      /*
        If backend returns the updated lesson,
        update local state immediately.
      */
      if (updatedLesson) {
        setLessons((current) => {
          const next = { ...current };

          Object.keys(next).forEach(
            (moduleId) => {
              next[moduleId] = (
                next[moduleId] || []
              ).map((lesson) =>
                lesson._id === lessonId
                  ? updatedLesson
                  : lesson
              );
            }
          );

          return next;
        });
      }

      toast.success(
        "Video uploaded successfully"
      );

      setSelectedVideo(null);

      /*
        Refresh the current module so we
        always have the latest Cloudinary data.
      */
      if (editingLesson?.moduleId) {
        await loadLessons(
          editingLesson.moduleId,
          true
        );
      }
    } catch (error) {
      console.error(
        "UPLOAD VIDEO ERROR:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to upload video"
      );
    } finally {
      setUploadingVideo(null);
    }
  };

  /* -----------------------------------------------------------
     LOADING
  ----------------------------------------------------------- */

  if (loading) {
    return (
      <div className="space-y-4 fi">
        {[...Array(3)].map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  /* -----------------------------------------------------------
     COURSE NOT FOUND
  ----------------------------------------------------------- */

  if (!course) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-10 h-10 text-muted mx-auto mb-3" />

          <h2 className="text-sm font-semibold text-text">
            Course not found
          </h2>

          <p className="text-xs text-muted mt-1">
            The course may have been deleted or
            you may not have access to it.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/instructor/courses"
              )
            }
            className="mt-4 inline-flex items-center gap-2 bg-orange hover:bg-orange/90 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const currentEditingLesson =
    editingLesson?.lesson || null;

  return (
    <div className="space-y-5 fi">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/instructor/courses"
              )
            }
            className="inline-flex items-center gap-1.5 text-muted hover:text-text transition text-sm shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Courses
          </button>

          <div className="h-5 w-px bg-border" />

          <div className="min-w-0">
            <h1 className="dsp text-xl font-bold text-text truncate">
              {course.title}
            </h1>

            {course.subtitle && (
              <p className="text-xs text-muted mt-0.5 truncate max-w-xl">
                {course.subtitle}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setAddingModule(true)
          }
          className="inline-flex items-center gap-2 text-xs bg-orange/10 text-orange border border-orange/20 px-3.5 py-2 rounded-xl hover:bg-orange/20 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Module
        </button>
      </div>

      {/* =====================================================
          COURSE CONTENT
      ====================================================== */}

      <div className="bg-surface border border-border rounded-2xl overflow-visible">

        <div className="flex items-center justify-between gap-4 p-4 border-b border-border">
          <div>
            <h2 className="dsp text-sm font-bold text-text">
              Course Content
            </h2>

            <p className="text-xs text-muted mt-1">
              Build and organize your course
              modules and lessons.
            </p>
          </div>

          <div className="text-xs text-muted">
            {modules.length}{" "}
            {modules.length === 1
              ? "module"
              : "modules"}
          </div>
        </div>

        {/* EMPTY MODULES */}

        {modules.length === 0 ? (
          <div className="py-14 px-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-orange/10 border border-orange/20 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-5 h-5 text-orange" />
            </div>

            <h3 className="text-sm font-semibold text-text">
              No modules yet
            </h3>

            <p className="text-xs text-muted mt-1.5 max-w-sm mx-auto">
              Start building your course by
              adding your first module.
            </p>

            <button
              type="button"
              onClick={() =>
                setAddingModule(true)
              }
              className="inline-flex items-center gap-2 mt-5 bg-orange hover:bg-orange/90 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition"
            >
              <Plus className="w-4 h-4" />
              Add First Module
            </button>
          </div>
        ) : (
          <div className="p-3 space-y-2">

            {modules.map(
              (module, index) => {
                const isExpanded =
                  expanded === module._id;

                const moduleLessons =
                  lessons[module._id] || [];

                const isLoadingLessons =
                  !!loadingLessons[
                    module._id
                  ];

                const isDeletingModule =
                  deletingModule ===
                  module._id;

                return (
                  <div
                    key={module._id}
                    className="border border-border rounded-xl overflow-visible bg-surface"
                  >

                    {/* MODULE HEADER */}

                    <div
                      className={`flex items-center justify-between gap-3 p-3 transition ${
                        isExpanded
                          ? "bg-surfaceHigh"
                          : "hover:bg-surfaceHigh"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleExpand(
                            module._id
                          )
                        }
                        className="flex items-center gap-3 min-w-0 flex-1 text-left"
                      >
                        <span className="w-6 h-6 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0">
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5 text-muted" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-muted" />
                          )}
                        </span>

                        <span className="w-7 h-7 rounded-lg bg-orange/10 text-orange border border-orange/20 flex items-center justify-center text-[10px] font-bold shrink-0">
                          {String(
                            index + 1
                          ).padStart(2, "0")}
                        </span>

                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-text truncate">
                            {module.title}
                          </span>

                          <span className="block text-[10px] text-muted mt-0.5">
                            {module.totalLessons ||
                              0}{" "}
                            {Number(
                              module.totalLessons ||
                                0
                            ) === 1
                              ? "lesson"
                              : "lessons"}
                          </span>
                        </span>
                      </button>

                      <button
                        type="button"
                        disabled={
                          isDeletingModule
                        }
                        onClick={() =>
                          handleDeleteModule(
                            module._id
                          )
                        }
                        className="inline-flex items-center gap-1.5 text-muted hover:text-red disabled:opacity-50 disabled:cursor-not-allowed transition text-xs px-2 py-1.5 rounded-lg hover:bg-red/10 shrink-0"
                      >
                        {isDeletingModule ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}

                        <span className="hidden sm:inline">
                          Delete
                        </span>
                      </button>
                    </div>

                    {/* LESSONS */}

                    {isExpanded && (
                      <div className="border-t border-border bg-surfaceHigh/60 p-3">

                        {isLoadingLessons ? (
                          <div className="py-6 flex items-center justify-center gap-2 text-xs text-muted">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading lessons...
                          </div>
                        ) : moduleLessons.length ===
                          0 ? (
                          <div className="py-8 text-center">
                            <FileText className="w-7 h-7 text-muted mx-auto mb-2" />

                            <p className="text-xs text-muted">
                              No lessons in this
                              module yet.
                            </p>

                            <button
                              type="button"
                              onClick={() =>
                                handleOpenAddLesson(
                                  module._id
                                )
                              }
                              className="inline-flex items-center gap-1.5 mt-3 text-xs text-orange hover:text-orange/80 transition"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Add Lesson
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1.5">

                            {moduleLessons.map(
                              (
                                lesson,
                                lessonIndex
                              ) => {
                                const LessonIcon =
                                  getLessonIcon(
                                    lesson.type
                                  );

                                const duration =
                                  getLessonDuration(
                                    lesson
                                  );

                                const isDeleting =
                                  deletingLesson ===
                                  lesson._id;

                                const hasVideo =
                                  !!lesson
                                    ?.video?.url;

                                return (
                                  <div
                                    key={
                                      lesson._id
                                    }
                                    className="group flex items-center gap-3 p-2.5 rounded-xl border border-transparent hover:border-border hover:bg-surface transition"
                                  >

                                    <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0">
                                      <LessonIcon className="w-4 h-4 text-muted" />
                                    </div>

                                    <div className="min-w-0 flex-1">

                                      <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-[10px] text-muted shrink-0">
                                          {lessonIndex +
                                            1}
                                          .
                                        </span>

                                        <span className="text-xs font-medium text-text truncate">
                                          {
                                            lesson.title
                                          }
                                        </span>

                                        {hasVideo &&
                                          lesson.type ===
                                            "video" && (
                                            <span className="text-[9px] text-green-400 shrink-0">
                                              Video
                                            </span>
                                          )}
                                      </div>

                                      <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] text-muted capitalize">
                                          {
                                            lesson.type
                                          }
                                        </span>

                                        <span className="w-1 h-1 rounded-full bg-muted" />

                                        <span className="text-[10px] text-muted">
                                          {duration}m
                                        </span>

                                        {lesson.isFreePreview && (
                                          <>
                                            <span className="w-1 h-1 rounded-full bg-muted" />

                                            <span className="text-[10px] text-orange">
                                              Free Preview
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">

                                      {/* EDIT */}

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleOpenEditLesson(
                                            module._id,
                                            lesson
                                          )
                                        }
                                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-muted hover:text-text hover:bg-surfaceHigh transition"
                                        title="Edit lesson"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>

                                      {/* DELETE */}

                                      <button
                                        type="button"
                                        disabled={
                                          isDeleting
                                        }
                                        onClick={() =>
                                          handleDeleteLesson(
                                            module._id,
                                            lesson._id
                                          )
                                        }
                                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-muted hover:text-red hover:bg-red/10 disabled:opacity-50 transition"
                                        title="Delete lesson"
                                      >
                                        {isDeleting ? (
                                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                          <Trash2 className="w-3.5 h-3.5" />
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                );
                              }
                            )}

                            <div className="pt-2 flex items-center justify-between gap-3">

                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenAddLesson(
                                    module._id
                                  )
                                }
                                className="inline-flex items-center gap-1.5 text-xs text-orange hover:text-orange/80 transition"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Add Lesson
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  loadLessons(
                                    module._id,
                                    true
                                  )
                                }
                                className="inline-flex items-center gap-1.5 text-[10px] text-muted hover:text-text transition"
                              >
                                <RefreshCw className="w-3 h-3" />
                                Refresh
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* =====================================================
          ADD MODULE
      ====================================================== */}

      <Modal
        isOpen={addingModule}
        onClose={() => {
          if (!savingModule) {
            setAddingModule(false);
          }
        }}
        title="Add Module"
        size="sm"
      >
        <div className="space-y-4">

          <Input
            label="Module Title"
            value={moduleTitle}
            onChange={(event) =>
              setModuleTitle(
                event.target.value
              )
            }
            placeholder="e.g. Introduction to React"
            required
            disabled={savingModule}
          />

          <div className="flex gap-3">

            <button
              type="button"
              disabled={savingModule}
              onClick={() =>
                setAddingModule(false)
              }
              className="flex-1 inline-flex items-center justify-center gap-2 bg-surfaceHigh border border-border text-text text-sm py-2.5 rounded-xl hover:border-orange/40 disabled:opacity-50 transition"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>

            <button
              type="button"
              disabled={savingModule}
              onClick={handleAddModule}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-orange hover:bg-orange/90 text-white text-sm font-semibold py-2.5 rounded-xl disabled:opacity-50 transition"
            >
              {savingModule ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Module
                </>
              )}
            </button>

          </div>
        </div>
      </Modal>

      {/* =====================================================
          ADD / EDIT LESSON
      ====================================================== */}

{/* =====================================================
    ADD / EDIT LESSON MODAL
====================================================== */}

<Modal
  isOpen={!!addingLesson || !!editingLesson}
  onClose={handleCloseLessonModal}
  title={editingLesson ? "Edit Lesson" : "Add Lesson"}
  size="sm"
>
  <div className="max-h-[70vh] overflow-y-auto pr-1">
    <div className="space-y-3">

      {/* LESSON TITLE */}

      <Input
        label="Lesson Title"
        value={lessonForm.title}
        onChange={(event) =>
          setLessonForm((current) => ({
            ...current,
            title: event.target.value,
          }))
        }
        placeholder="e.g. What is React?"
        required
        disabled={savingLesson}
      />

      {/* LESSON TYPE + DURATION */}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select
          label="Lesson Type"
          value={lessonForm.type}
          onChange={(event) =>
            setLessonForm((current) => ({
              ...current,
              type: event.target.value,
            }))
          }
          options={LESSON_TYPES}
          disabled={savingLesson}
        />

        <Input
          label="Duration (minutes)"
          type="number"
          min="0"
          step="1"
          value={lessonForm.duration}
          onChange={(event) =>
            setLessonForm((current) => ({
              ...current,
              duration:
                event.target.value === ""
                  ? ""
                  : Number(event.target.value),
            }))
          }
          disabled={savingLesson}
        />
      </div>

      {/* DESCRIPTION */}

      <div>
        <label className="block text-xs font-medium text-text mb-1.5">
          Description
        </label>

        <textarea
          value={lessonForm.description}
          onChange={(event) =>
            setLessonForm((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
          placeholder="Brief description of this lesson..."
          rows={2}
          disabled={savingLesson}
          className="w-full bg-surfaceHigh border border-border rounded-xl px-3 py-2 text-xs text-text placeholder:text-muted outline-none focus:border-orange/50 transition resize-none"
        />
      </div>

      {/* CONTENT */}

      {(lessonForm.type === "text" ||
        lessonForm.type === "assignment") && (
        <div>
          <label className="block text-xs font-medium text-text mb-1.5">
            Lesson Content
          </label>

          <textarea
            value={lessonForm.content}
            onChange={(event) =>
              setLessonForm((current) => ({
                ...current,
                content: event.target.value,
              }))
            }
            placeholder="Enter lesson content..."
            rows={4}
            disabled={savingLesson}
            className="w-full bg-surfaceHigh border border-border rounded-xl px-3 py-2 text-xs text-text placeholder:text-muted outline-none focus:border-orange/50 transition resize-y"
          />
        </div>
      )}

      {/* INSTRUCTOR NOTES */}

      <div>
        <label className="block text-xs font-medium text-text mb-1.5">
          Instructor Notes
        </label>

        <textarea
          value={lessonForm.notes}
          onChange={(event) =>
            setLessonForm((current) => ({
              ...current,
              notes: event.target.value,
            }))
          }
          placeholder="Private notes for this lesson..."
          rows={2}
          disabled={savingLesson}
          className="w-full bg-surfaceHigh border border-border rounded-xl px-3 py-2 text-xs text-text placeholder:text-muted outline-none focus:border-orange/50 transition resize-none"
        />
      </div>

      {/* FREE PREVIEW */}

      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={lessonForm.isFreePreview}
          onChange={(event) =>
            setLessonForm((current) => ({
              ...current,
              isFreePreview: event.target.checked,
            }))
          }
          disabled={savingLesson}
          className="w-4 h-4 accent-orange"
        />

        <div>
          <span className="block text-xs font-medium text-text">
            Free Preview
          </span>

          <span className="block text-[10px] text-muted">
            Students can access this lesson before enrollment.
          </span>
        </div>
      </label>

      {/* VIDEO */}

      {lessonForm.type === "video" && (
        <div className="border border-border rounded-xl p-3 bg-surfaceHigh">

          <div className="flex items-center justify-between gap-2 mb-2">
            <div>
              <p className="text-xs font-semibold text-text">
                Lesson Video
              </p>

              <p className="text-[10px] text-muted">
                Upload or replace the lesson video.
              </p>
            </div>

            {currentEditingLesson?.video?.url && (
              <span className="text-[10px] text-green-400">
                Uploaded
              </span>
            )}
          </div>

          {/* EXISTING VIDEO */}

          {currentEditingLesson?.video?.url && (
            <video
              src={currentEditingLesson.video.url}
              controls
              className="w-full max-h-36 rounded-lg bg-black object-contain mb-2"
            />
          )}

          {/* FILE SELECT */}

          <label className="flex items-center gap-2.5 border border-dashed border-border hover:border-orange/40 rounded-lg px-3 py-2.5 cursor-pointer transition">

            <Upload className="w-4 h-4 text-muted shrink-0" />

            <div className="min-w-0">
              <p className="text-xs font-medium text-text truncate">
                {selectedVideo
                  ? selectedVideo.name
                  : "Choose video file"}
              </p>

              <p className="text-[9px] text-muted">
                MP4, MOV, WebM or other supported format
              </p>
            </div>

            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleVideoSelect}
              disabled={
                savingLesson || !!uploadingVideo
              }
            />
          </label>

          {/* UPLOAD */}

          {selectedVideo && editingLesson && (
            <button
              type="button"
              disabled={
                uploadingVideo ===
                currentEditingLesson?._id
              }
              onClick={() =>
                handleUploadVideo(
                  currentEditingLesson._id
                )
              }
              className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-orange hover:bg-orange/90 text-white text-xs font-semibold py-2 rounded-lg disabled:opacity-50 transition"
            >
              {uploadingVideo ===
              currentEditingLesson?._id ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  Upload Video
                </>
              )}
            </button>
          )}

          {!editingLesson && selectedVideo && (
            <p className="text-[10px] text-muted mt-2">
              Save the lesson first, then upload the video from Edit.
            </p>
          )}
        </div>
      )}

      {/* ACTIONS */}

      <div className="flex gap-2 pt-1 sticky bottom-0 bg-surface pb-1">

        <button
          type="button"
          disabled={savingLesson}
          onClick={handleCloseLessonModal}
          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-surfaceHigh border border-border text-text text-xs py-2.5 rounded-xl hover:border-orange/40 disabled:opacity-50 transition"
        >
          <X className="w-3.5 h-3.5" />
          Cancel
        </button>

        <button
          type="button"
          disabled={savingLesson}
          onClick={
            editingLesson
              ? handleUpdateLesson
              : handleAddLesson
          }
          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-orange hover:bg-orange/90 text-white text-xs font-semibold py-2.5 rounded-xl disabled:opacity-50 transition"
        >
          {savingLesson ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {editingLesson
                ? "Saving..."
                : "Adding..."}
            </>
          ) : editingLesson ? (
            <>
              <Edit3 className="w-3.5 h-3.5" />
              Save Changes
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              Add Lesson
            </>
          )}
        </button>

      </div>
    </div>
  </div>
</Modal>
    </div>
  );
}
