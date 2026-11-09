// src/pages/instructor/Resources.jsx
import { useEffect, useState } from "react";
import {
  getResources,
  uploadResource,
  deleteResource,
} from "../../services/instructor/resourceService";
import EmptyState from "../../components/common/EmptyState";
import { SkeletonCard } from "../../components/common/Skeleton";
import api from "../../api/Api";
import { toast } from "react-hot-toast";

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/instructor/resource-library")
      .then((r) => setResources(r.data.data?.data || []))
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
      <h1 className="dsp text-xl font-bold text-text">Resource Library</h1>
      {resources.length === 0 ? (
        <EmptyState
          icon="🗂️"
          title="No resources"
          message="Upload resources for your students"
        />
      ) : (
        <div className="space-y-3">
          {resources.map((r) => (
            <div
              key={r._id}
              className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center text-xl shrink-0">
                📎
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text truncate">
                  {r.title}
                </p>
                <p className="text-[10px] text-muted">{r.type}</p>
              </div>
              <a
                href={r.file?.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-orange hover:underline shrink-0"
              >
                Download
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
