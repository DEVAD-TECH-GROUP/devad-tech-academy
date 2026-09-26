import { useEffect, useState } from "react";
import {
  getAllAssignments,
  getAssignmentAnalytics,
  getLateSubmissions,
} from "../../services/superadmin/assignmentService";
import Tabs from "../../components/common/Tabs";
import { formatDate } from "../../utils/formatDate";
import { SkeletonCard } from "../../components/common/Skeleton";

export default function AdminAssignments() {
  const [tab, setTab] = useState("all");
  const [assignments, setAssignments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (tab === "analytics") {
      getAssignmentAnalytics()
        .then((r) => setAnalytics(r.data.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else if (tab === "late") {
      getLateSubmissions()
        .then((r) => setAssignments(r.data.data || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      getAllAssignments()
        .then((r) => setAssignments(r.data.data?.data || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [tab]);

  return (
    <div className="space-y-5 fi">
      <h1 className="dsp text-xl font-bold text-text">Assignments</h1>

      <Tabs
        tabs={[
          { key: "all", label: "All" },
          { key: "late", label: "Late Submissions", icon: "⚠️" },
          { key: "analytics", label: "Analytics", icon: "📊" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : tab === "analytics" && analytics ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total", value: analytics.total || 0, color: "#818CF8" },
            { label: "Submitted", value: analytics.submitted || 0, color: "#34D399" },
            { label: "Graded", value: analytics.graded || 0, color: "#FBBF24" },
            { label: "Submission Rate", value: `${analytics.submissionRate || 0}%`, color: "#FB923C" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-surface border border-border rounded-2xl p-4 text-center">
              <div className="dsp text-xl font-extrabold" style={{ color }}>{value}</div>
              <div className="text-xs text-muted mt-1">{label}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.length === 0 && <p className="text-center text-muted text-sm py-16">No assignments found</p>}
          {assignments.map((a) => (
            <div key={a._id} className="bg-surface border border-border rounded-2xl p-4 fi">
              <p className="text-sm font-semibold text-text mb-1">
                {a.title || a.assignment?.title}
              </p>
              <p className="text-xs text-muted">
                {a.course?.title || a.assignment?.course?.title}
              </p>
              {(a.dueDate || a.assignment?.dueDate) && (
                <p className="text-xs text-muted">Due: {formatDate(a.dueDate || a.assignment?.dueDate)}</p>
              )}
              {a.student && (
                <p className="text-xs text-red mt-1">
                  Late: {a.student?.firstName} {a.student?.lastName}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}