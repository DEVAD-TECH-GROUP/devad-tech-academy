import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Plus,
  MoreVertical,
  Pencil,
  Wrench,
  BarChart3,
  Rocket,
  Trash2,
  Users,
  Star,
  FileText,
} from "lucide-react";

import {
  getMyCourses,
  deleteCourse,
  publishCourse,
} from "../../../services/instructor/courseService";

import Badge from "../../../components/common/Badge";
import SearchBar from "../../../components/common/SearchBar";
import EmptyState from "../../../components/common/EmptyState";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import Dropdown from "../../../components/common/Dropdown";
import { SkeletonCard } from "../../../components/common/Skeleton";
import { toast } from "react-hot-toast";

export default function Courses() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadCourses = async () => {
      setLoading(true);

      try {
        const response = await getMyCourses({ search });

        if (!mounted) return;

        setCourses(response.data?.data?.data || []);
      } catch (error) {
        if (!mounted) return;

        toast.error(
          error.response?.data?.message ||
            "Failed to load courses"
        );

        setCourses([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadCourses();

    return () => {
      mounted = false;
    };
  }, [search]);

  // ============================================================
  // DELETE COURSE
  // ============================================================

  const handleDelete = async () => {
    if (!confirmDelete?._id) return;

    const courseId = confirmDelete._id;

    setDeleting(courseId);

    try {
      await deleteCourse(courseId);

      setCourses((currentCourses) =>
        currentCourses.filter(
          (course) => course._id !== courseId
        )
      );

      toast.success("Course deleted");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Delete failed"
      );
    } finally {
      setDeleting(null);
      setConfirmDelete(null);
    }
  };

  // ============================================================
  // SUBMIT FOR REVIEW
  // ============================================================

  const handlePublish = async (id) => {
    try {
      await publishCourse(id);

      setCourses((currentCourses) =>
        currentCourses.map((course) =>
          course._id === id
            ? {
                ...course,
                status: "pending_review",
              }
            : course
        )
      );

      toast.success("Submitted for review!");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Submission failed"
      );
    }
  };

  // ============================================================
  // STATUS
  // ============================================================

  const statusVariant = (status) =>
    ({
      published: "green",
      draft: "default",
      pending_review: "yellow",
      rejected: "red",
      archived: "default",
    }[status] || "default");

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="space-y-5 fi">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-surfaceHigh rounded-lg animate-pulse" />

          <div className="h-10 w-32 bg-surfaceHigh rounded-xl animate-pulse" />
        </div>

        <div className="h-10 w-full bg-surfaceHigh rounded-xl animate-pulse" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="space-y-5 fi">
      {/* ========================================================
          HEADER
      ======================================================== */}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="dsp text-xl font-bold text-text">
            My Courses
          </h1>

          <p className="text-xs text-muted mt-1">
            Create, manage and monitor your courses.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/instructor/courses/create")
          }
          className="
            bg-orange
            hover:bg-orange/90
            text-white
            text-xs
            font-semibold
            px-4
            py-2.5
            rounded-xl
            transition
            flex
            items-center
            gap-1.5
          "
        >
          <Plus
            size={15}
            strokeWidth={2}
          />

          New Course
        </button>
      </div>

      {/* ========================================================
          SEARCH
      ======================================================== */}

      <SearchBar
        onSearch={setSearch}
        placeholder="Search courses..."
      />

      {/* ========================================================
          EMPTY STATE
      ======================================================== */}

      {courses.length === 0 ? (
        <EmptyState
          icon={
            <BookOpen
              size={32}
              strokeWidth={1.7}
            />
          }
          title="No courses yet"
          message="Create your first course and start teaching!"
          action={() =>
            navigate("/instructor/courses/create")
          }
          actionLabel="Create Course"
        />
      ) : (
        /* ======================================================
           COURSE GRID

           IMPORTANT:
           overflow-visible allows the Dropdown menu to escape
           the course card instead of being clipped.
           ====================================================== */

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {courses.map((course) => (
            <div
              key={course._id}
              className="
                relative
                bg-surface
                border border-border
                rounded-2xl
                overflow-visible
                fi
              "
            >
              {/* ==================================================
                  COURSE COVER
                  ================================================== */}

              <div
                className="
                  h-32
                  bg-accentDim
                  rounded-t-2xl
                  flex
                  items-center
                  justify-center
                "
              >
                <BookOpen
                  size={46}
                  strokeWidth={1.5}
                  className="text-orange/70"
                />
              </div>

              {/* ==================================================
                  COURSE CONTENT
                  ================================================== */}

              <div className="p-4">
                {/* ==================================================
                    TITLE + MENU
                    ================================================== */}

                <div className="relative flex items-start justify-between gap-2 mb-2">
                  <p
                    className="
                      text-sm
                      font-semibold
                      text-text
                      flex-1
                      line-clamp-2
                      min-w-0
                    "
                  >
                    {course.title}
                  </p>

                  {/* DROPDOWN */}

                  <div className="relative shrink-0 z-50 -mt-24">
                    <Dropdown
                      trigger={
                        <button
                          type="button"
                          className="
                            text-muted
                            hover:text-text
                            p-1.5
                            rounded-lg
                            hover:bg-surfaceHigh
                            transition
                            flex
                            items-center
                            justify-center
                          "
                          aria-label="Course actions"
                        >
                          <MoreVertical
                            size={17}
                            strokeWidth={1.8}
                          />
                        </button>
                      }
                      items={[
                        {
                          label: "Edit",
                          icon: (
                            <Pencil
                              size={15}
                              strokeWidth={1.8}
                            />
                          ),
                          onClick: () =>
                            navigate(
                              `/instructor/courses/${course._id}/edit`
                            ),
                        },

                        {
                          label: "Build Content",
                          icon: (
                            <Wrench
                              size={15}
                              strokeWidth={1.8}
                            />
                          ),
                          onClick: () =>
                            navigate(
                              `/instructor/courses/${course._id}/build`
                            ),
                        },

                        {
                          label: "View Analytics",
                          icon: (
                            <BarChart3
                              size={15}
                              strokeWidth={1.8}
                            />
                          ),
                          onClick: () =>
                            navigate(
                              "/instructor/analytics"
                            ),
                        },

                        ...(course.status === "draft"
                          ? [
                              {
                                label:
                                  "Submit for Review",
                                icon: (
                                  <Rocket
                                    size={15}
                                    strokeWidth={1.8}
                                  />
                                ),
                                onClick: () =>
                                  handlePublish(
                                    course._id
                                  ),
                              },
                            ]
                          : []),

                        {
                          label: "Delete",
                          icon: (
                            <Trash2
                              size={15}
                              strokeWidth={1.8}
                            />
                          ),
                          onClick: () =>
                            setConfirmDelete(course),
                          danger: true,
                        },
                      ]}
                    />
                  </div>
                </div>

                {/* ==================================================
                    STATUS
                    ================================================== */}

                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <Badge
                    variant={statusVariant(
                      course.status
                    )}
                  >
                    {course.status
                      ?.replace(/_/g, " ")
                      ?.replace(/\b\w/g, (letter) =>
                        letter.toUpperCase()
                      )}
                  </Badge>

                  {course.category?.name && (
                    <span className="text-[11px] text-muted truncate">
                      {course.category.name}
                    </span>
                  )}
                </div>

                {/* ==================================================
                    COURSE STATS
                    ================================================== */}

                <div className="flex items-center gap-3 text-xs text-muted flex-wrap">
                  <span className="flex items-center gap-1">
                    <Users
                      size={13}
                      strokeWidth={1.8}
                    />

                    {course.totalStudents || 0}
                  </span>

                  <span className="flex items-center gap-1">
                    <Star
                      size={13}
                      strokeWidth={1.8}
                    />

                    {course.averageRating > 0
                      ? course.averageRating
                      : "New"}
                  </span>

                  <span className="flex items-center gap-1">
                    <FileText
                      size={13}
                      strokeWidth={1.8}
                    />

                    {course.totalLessons || 0} lessons
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ==========================================================
          DELETE CONFIRMATION
          ========================================================== */}

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() =>
          setConfirmDelete(null)
        }
        onConfirm={handleDelete}
        title="Delete Course"
        message={
          confirmDelete
            ? `Are you sure you want to delete "${confirmDelete.title}"? This cannot be undone.`
            : ""
        }
        loading={!!deleting}
      />
    </div>
  );
}