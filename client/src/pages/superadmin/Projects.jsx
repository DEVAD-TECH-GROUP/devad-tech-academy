import { useEffect, useState } from "react";
import { getAllProjects, getProjectAnalytics } from "../../services/superadmin/projectService";
import { SkeletonCard } from "../../components/common/Skeleton";

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllProjects(), getProjectAnalytics()])
      .then(([p, a]) => { setProjects(p.data.data?.data || []); setAnalytics(a.data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-3">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>;

  return (
    <div className="space-y-5 fi">
      <h1 className="dsp text-xl font-bold text-text">Projects</h1>

      {analytics && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Projects", value: analytics.total || 0, color: "#818CF8" },
            { label: "Submissions", value: analytics.submitted || 0, color: "#34D399" },
            { label: "Graded", value: analytics.graded || 0, color: "#FBBF24" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-surface border border-border rounded-2xl p-4 text-center">
              <div className="dsp text-xl font-extrabold" style={{ color }}>{value}</div>
              <div className="text-xs text-muted mt-1">{label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {projects.length === 0 && <p className="text-center text-muted text-sm py-16">No projects</p>}
        {projects.map((p) => (
          <div key={p._id} className="bg-surface border border-border rounded-2xl p-4 fi">
            <p className="text-sm font-semibold text-text mb-1">{p.title}</p>
            <p className="text-xs text-muted">{p.course?.title}</p>
            <div className="flex gap-3 text-xs text-muted mt-1">
              <span>👨‍🏫 {p.instructor?.firstName} {p.instructor?.lastName}</span>
              <span>📤 {p.totalSubmissions || 0} submissions</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
