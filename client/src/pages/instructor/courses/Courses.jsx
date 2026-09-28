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
    setLoading(true);

    getMyCourses({ search })
      .then((r) =>
        setCourses(r.data.data?.data || [])
      )
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search]);

  const handleDelete = async () => {
    if (!confirmDelete?._id) return;

    setDeleting(confirmDelete._id);

    try {
      await deleteCourse(confirmDelete._id);

      setCourses((currentCourses) =>
        currentCourses.filter(
          (course) =>
            course._id !== confirmDelete._id
        )
      );

      toast.success("Course deleted");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Delete failed"
      );
    } finally {
      setDeleting(null);
      setConfirmDelete(null);
    }
  };

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
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Publish failed"
      );
    }
  };

  const statusVariant = (status) =>
    ({
      published: "green",
      draft: "default",
      pending_review: "yellow",
      rejected: "red",
      archived: "default",
    }[status] || "default");

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5 fi">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="dsp text-xl font-bold text-text">
          My Courses
        </h1>

        <button
          onClick={() =>
            navigate(
              "/instructor/courses/create"
            )
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

      {/* Search */}
      <SearchBar
        onSearch={setSearch}
        placeholder="Search courses..."
      />

      {/* Empty State */}
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
            navigate(
              "/instructor/courses/create"
            )
          }
          actionLabel="Create Course"
        />
      ) : (
        /* Course Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {courses.map((c) => (
            <div
              key={c._id}
              className="
                bg-surface
                border border-border
                rounded-2xl
                overflow-hidden
                fi
              "
            >
              {/* Course Cover */}
              <div
                className="
                  h-32
                  bg-accentDim
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

              <div className="p-4">
                {/* Title + Menu */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p
                    className="
                      text-sm
                      font-semibold
                      text-text
                      flex-1
                      line-clamp-2
                    "
                  >
                    {c.title}
                  </p>

                  <Dropdown
                    trigger={
                      <button
                        className="
                          text-muted
                          hover:text-text
                          p-1
                          rounded-lg
                          hover:bg-surfaceHigh
                          transition
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
                            `/instructor/courses/${c._id}/edit`
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
                            `/instructor/courses/${c._id}/build`
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

                      ...(c.status === "draft"
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
                                  c._id
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
                          setConfirmDelete(c),
                        danger: true,
                      },
                    ]}
                  />
                </div>

                {/* Status */}
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <Badge
                    variant={statusVariant(
                      c.status
                    )}
                  >
                    {c.status?.replace(
                      "_",
                      " "
                    )}
                  </Badge>
                </div>

                {/* Course Stats */}
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Users
                      size={13}
                      strokeWidth={1.8}
                    />
                    {c.totalStudents || 0}
                  </span>

                  <span className="flex items-center gap-1">
                    <Star
                      size={13}
                      strokeWidth={1.8}
                    />
                    {c.averageRating || "New"}
                  </span>

                  <span className="flex items-center gap-1">
                    <FileText
                      size={13}
                      strokeWidth={1.8}
                    />
                    {c.totalLessons || 0} lessons
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() =>
          setConfirmDelete(null)
        }
        onConfirm={handleDelete}
        title="Delete Course"
        message={`Are you sure you want to delete "${confirmDelete?.title}"? This cannot be undone.`}
        loading={!!deleting}
      />
    </div>
  );
}
