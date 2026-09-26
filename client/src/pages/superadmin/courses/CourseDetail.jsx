import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getCourse,
  approveCourse,
  rejectCourse,
} from "../../../services/superadmin/courseService";
import Badge from "../../../components/common/Badge";
import { SkeletonCard } from "../../../components/common/Skeleton";
import { toast } from "react-hot-toast";

export default function AdminCourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(null);

  useEffect(() => {
    getCourse(id)
      .then((r) => setCourse(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleApprove = async () => {
    setActioning("approve");
    try {
      await approveCourse(id);
      setCourse((c) => ({ ...c, status: "published" }));
      toast.success("Course approved! ✅");
    } catch { toast.error("Failed"); }
    finally { setActioning(null); }
  };

  const handleReject = async () => {
    setActioning("reject");
    try {
      await rejectCourse(id, "Does not meet quality standards");
      setCourse((c) => ({ ...c, status: "rejected" }));
      toast.success("Course rejected");
    } catch { toast.error("Failed"); }
    finally { setActioning(null); }
  };

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>;
  if (!course) return null;

  const statusVariant = { published: "green", pending_review: "yellow", rejected: "red", draft: "default" }[course.status] || "default";

  return (
    <div className="space-y-5 fi max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/admin/courses")} className="text-muted hover:text-text text-sm transition">← Courses</button>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-5">
        <div className="h-36 bg-accentDim rounded-xl flex items-center justify-center text-5xl mb-4">📚</div>

        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h1 className="dsp text-lg font-bold text-text mb-1">{course.title}</h1>
            <p className="text-xs text-muted mb-2 line-clamp-2">{course.description}</p>
            <div className="flex gap-2 flex-wrap">
              <Badge variant={statusVariant}>{course.status?.replace("_", " ")}</Badge>
              <Badge variant="accent" size="xs">{course.level}</Badge>
              <Badge variant="default" size="xs">{course.category?.name}</Badge>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-5">
          {[
            ["Instructor", `${course.instructor?.firstName} ${course.instructor?.lastName}`],
            ["Students", course.totalStudents || 0],
            ["Rating", course.averageRating || "New"],
            ["Lessons", course.totalLessons || 0],
            ["Language", course.language],
            ["Price", course.price === 0 ? "Free" : `₦${course.price?.toLocaleString()}`],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between py-2 border-b border-border/50 last:border-0">
              <span className="text-xs text-muted">{label}</span>
              <span className="text-xs text-text">{value}</span>
            </div>
          ))}
        </div>

        {course.status === "pending_review" && (
          <div className="flex gap-3">
            <button
              onClick={handleApprove}
              disabled={actioning === "approve"}
              className="flex-1 bg-green/10 text-green border border-green/20 font-semibold py-2.5 rounded-xl text-sm hover:bg-green/20 transition disabled:opacity-50"
            >
              {actioning === "approve" ? "..." : "✅ Approve"}
            </button>
            <button
              onClick={handleReject}
              disabled={actioning === "reject"}
              className="flex-1 bg-red/10 text-red border border-red/20 font-semibold py-2.5 rounded-xl text-sm hover:bg-red/20 transition disabled:opacity-50"
            >
              {actioning === "reject" ? "..." : "❌ Reject"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}