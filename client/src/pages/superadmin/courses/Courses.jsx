import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllCourses,
  approveCourse,
  rejectCourse,
  featureCourse,
  deleteCourse,
} from "../../../services/superadmin/courseService";
import Tabs from "../../../components/common/Tabs";
import SearchBar from "../../../components/common/SearchBar";
import Badge from "../../../components/common/Badge";
import Dropdown from "../../../components/common/Dropdown";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import Pagination from "../../../components/common/Pagination";
import { SkeletonCard } from "../../../components/common/Skeleton";
import { toast } from "react-hot-toast";

export default function AdminCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const statusMap = {
    all: undefined,
    pending: "pending_review",
    published: "published",
    rejected: "rejected",
  };

  const load = async () => {
    setLoading(true);
    try {
      const r = await getAllCourses({ search, status: statusMap[tab], page, limit: 20 });
      setCourses(r.data.data?.data || []);
      setTotalPages(r.data.data?.totalPages || 1);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [tab, search, page]);

  const handleApprove = async (id) => {
    try { await approveCourse(id); toast.success("Course approved! ✅"); load(); }
    catch { toast.error("Failed"); }
  };

  const handleReject = async (id) => {
    try { await rejectCourse(id, "Does not meet quality standards"); toast.success("Course rejected"); load(); }
    catch { toast.error("Failed"); }
  };

  const handleFeature = async (course) => {
    try { await featureCourse(course._id, !course.isFeatured); load(); }
    catch { toast.error("Failed"); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCourse(confirmDelete._id);
      toast.success("Course deleted");
      setConfirmDelete(null);
      load();
    } catch { toast.error("Failed"); }
    finally { setDeleting(false); }
  };

  const statusVariant = (s) => ({
    published: "green", draft: "default",
    pending_review: "yellow", rejected: "red",
  }[s] || "default");

  return (
    <div className="space-y-5 fi">
      <h1 className="dsp text-xl font-bold text-text">Courses</h1>

      <Tabs
        tabs={[
          { key: "all", label: "All" },
          { key: "pending", label: "Pending", icon: "⏳" },
          { key: "published", label: "Published", icon: "✅" },
          { key: "rejected", label: "Rejected", icon: "❌" },
        ]}
        active={tab}
        onChange={setTab}
      />

      <SearchBar onSearch={setSearch} placeholder="Search courses..." />

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : (
        <div className="space-y-3">
          {courses.length === 0 && (
            <div className="text-center py-16 text-muted text-sm">No courses found</div>
          )}
          {courses.map((c) => (
            <div key={c._id} className="bg-surface border border-border rounded-2xl p-4 fi">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-semibold text-text truncate">{c.title}</p>
                    <Badge variant={statusVariant(c.status)} size="xs">{c.status?.replace("_", " ")}</Badge>
                    {c.isFeatured && <Badge variant="yellow" size="xs">⭐ Featured</Badge>}
                  </div>
                  <p className="text-xs text-muted mb-1">
                    {c.instructor?.firstName} {c.instructor?.lastName} · {c.category?.name}
                  </p>
                  <div className="flex gap-3 text-xs text-muted">
                    <span>👥 {c.totalStudents || 0}</span>
                    <span>⭐ {c.averageRating || "New"}</span>
                    <span>📚 {c.totalLessons || 0} lessons</span>
                  </div>
                </div>
                <Dropdown
                  trigger={<button className="text-muted hover:text-text p-1 shrink-0">⋮</button>}
                  items={[
                    { label: "View Detail", icon: "👁️", onClick: () => navigate(`/admin/courses/${c._id}`) },
                    ...(c.status === "pending_review" ? [
                      { label: "Approve", icon: "✅", onClick: () => handleApprove(c._id) },
                      { label: "Reject", icon: "❌", onClick: () => handleReject(c._id), danger: true },
                    ] : []),
                    { label: c.isFeatured ? "Unfeature" : "Feature ⭐", icon: "⭐", onClick: () => handleFeature(c) },
                    { label: "Delete", icon: "🗑️", onClick: () => setConfirmDelete(c), danger: true },
                  ]}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onNext={() => setPage((p) => p + 1)} onPrev={() => setPage((p) => p - 1)} onGoTo={setPage} />

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Delete Course"
        message={`Delete "${confirmDelete?.title}"? This cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}
