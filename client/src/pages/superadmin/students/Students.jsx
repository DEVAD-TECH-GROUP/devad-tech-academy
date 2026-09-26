import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllStudents, updateStudentStatus } from "../../../services/superadmin/studentService";
import SearchBar from "../../../components/common/SearchBar";
import Avatar from "../../../components/common/Avatar";
import Badge from "../../../components/common/Badge";
import Dropdown from "../../../components/common/Dropdown";
import Pagination from "../../../components/common/Pagination";
import { SkeletonCard } from "../../../components/common/Skeleton";
import { formatDate } from "../../../utils/formatDate";
import { toast } from "react-hot-toast";

export default function Students() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const r = await getAllStudents({ search, page, limit: 20 });
      setStudents(r.data.data?.data || []);
      setTotalPages(r.data.data?.totalPages || 1);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, page]);

  const handleStatus = async (id, status) => {
    try {
      await updateStudentStatus(id, status);
      toast.success(`Student ${status}`);
      load();
    } catch { toast.error("Failed"); }
  };

  return (
    <div className="space-y-5 fi">
      <h1 className="dsp text-xl font-bold text-text">Students</h1>
      <SearchBar onSearch={setSearch} placeholder="Search students..." />

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : (
        <div className="space-y-2">
          {students.length === 0 && (
            <div className="text-center py-16 text-muted text-sm">No students found</div>
          )}
          {students.map((s) => (
            <div key={s._id} className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-3 fi">
              <Avatar user={s} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text">{s.firstName} {s.lastName}</p>
                <p className="text-xs text-muted">{s.email}</p>
                <div className="flex gap-2 mt-0.5">
                  <Badge variant={s.status === "active" ? "green" : "red"} size="xs">{s.status}</Badge>
                  <span className="text-[10px] text-muted">{formatDate(s.createdAt)}</span>
                </div>
              </div>
              <Dropdown
                trigger={<button className="text-muted hover:text-text p-1 shrink-0">⋮</button>}
                items={[
                  { label: "View Details", icon: "👁️", onClick: () => navigate(`/admin/students/${s._id}`) },
                  s.status === "active"
                    ? { label: "Suspend", icon: "🚫", onClick: () => handleStatus(s._id, "suspended"), danger: true }
                    : { label: "Activate", icon: "✅", onClick: () => handleStatus(s._id, "active") },
                ]}
              />
            </div>
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        onNext={() => setPage((p) => p + 1)}
        onPrev={() => setPage((p) => p - 1)}
        onGoTo={setPage}
      />
    </div>
  );
}
