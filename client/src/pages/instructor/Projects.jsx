// src/pages/instructor/Projects.jsx
import { useEffect, useState } from "react";
import {
  getMyProjects,
  getProjectSubmissions,
  gradeProjectSubmission,
} from "../../services/instructor/projectService";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";
import { SkeletonCard } from "../../components/common/Skeleton";
import { formatDate } from "../../utils/formatDate";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyProjects()
      .then((r) => setProjects(r.data.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );

  return (
    <div className="space-y-5 fi">
      <h1 className="dsp text-xl font-bold text-text">Projects</h1>
      {projects.length === 0 ? (
        <EmptyState
          icon="🛠️"
          title="No projects"
          message="No projects created yet"
        />
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <div
              key={p._id}
              className="bg-surface border border-border rounded-2xl p-4 fi"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-text mb-1">
                    {p.title}
                  </p>
                  <p className="text-xs text-muted mb-2">{p.course?.title}</p>
                  <div className="flex gap-2 text-xs text-muted">
                    <span>📅 Due: {formatDate(p.dueDate)}</span>
                    <span>📤 {p.totalSubmissions || 0} submissions</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
