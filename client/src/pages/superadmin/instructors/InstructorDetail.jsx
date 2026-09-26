import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInstructor } from "../../../services/superadmin/instructorService";
import Avatar from "../../../components/common/Avatar";
import Badge from "../../../components/common/Badge";
import { formatNaira } from "../../../utils/formatCurrency";
import { SkeletonCard } from "../../../components/common/Skeleton";

export default function InstructorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInstructor(id)
      .then((r) => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>;
  if (!data) return <p className="text-muted text-sm">Instructor not found</p>;

  const user = data.user || {};

  return (
    <div className="space-y-5 fi max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/admin/instructors")} className="text-muted hover:text-text text-sm transition">← Instructors</button>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-5">
        <div className="flex items-center gap-4 mb-4">
          <Avatar user={user} size="lg" />
          <div>
            <p className="dsp text-lg font-bold text-text">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-muted mb-2">{user.email}</p>
            <Badge
              variant={
                data.applicationStatus === "approved" ? "green" :
                data.applicationStatus === "pending" ? "yellow" : "red"
              }
            >
              {data.applicationStatus}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: "Total Courses", value: data.totalCourses || 0, color: "#818CF8" },
            { label: "Total Students", value: data.totalStudents || 0, color: "#34D399" },
            { label: "Total Revenue", value: formatNaira(data.totalRevenue || 0), color: "#FBBF24" },
            { label: "Avg Rating", value: data.averageRating?.toFixed(1) || "N/A", color: "#FB923C" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-surfaceHigh rounded-xl p-3 text-center">
              <p className="dsp text-lg font-bold" style={{ color }}>{value}</p>
              <p className="text-xs text-muted">{label}</p>
            </div>
          ))}
        </div>

        {data.bio && (
          <div className="bg-surfaceHigh rounded-xl p-3">
            <p className="text-xs text-muted mb-1">Bio</p>
            <p className="text-sm text-text">{data.bio}</p>
          </div>
        )}
      </div>
    </div>
  );
}
