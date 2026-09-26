import { useEffect, useState } from "react";
import {
  getStudentReport,
  getInstructorReport,
  getCourseReport,
  exportReport,
} from "../../services/superadmin/reportService";
import Tabs from "../../components/common/Tabs";
import { SkeletonCard } from "../../components/common/Skeleton";
import { toast } from "react-hot-toast";

export default function Reports() {
  const [tab, setTab] = useState("students");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const loaders = {
    students: getStudentReport,
    instructors: getInstructorReport,
    courses: getCourseReport,
  };

  useEffect(() => {
    setLoading(true);
    loaders[tab]()
      .then((r) => setData(r.data.data?.students || r.data.data?.instructors || r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab]);

  const handleExport = async (format) => {
    setExporting(true);
    try {
      await exportReport(tab, format);
      toast.success("Report exported!");
    } catch { toast.error("Export failed"); }
    finally { setExporting(false); }
  };

  return (
    <div className="space-y-5 fi">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="dsp text-xl font-bold text-text">Reports</h1>
        <div className="flex gap-2">
          {["pdf", "excel", "csv"].map((f) => (
            <button
              key={f}
              onClick={() => handleExport(f)}
              disabled={exporting}
              className="text-xs bg-surfaceHigh border border-border text-muted px-3 py-1.5 rounded-xl hover:text-text transition disabled:opacity-50 uppercase"
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <Tabs
        tabs={[
          { key: "students", label: "Students" },
          { key: "instructors", label: "Instructors" },
          { key: "courses", label: "Courses" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : (
        <div className="bg-surface border border-border rounded-2xl p-4">
          <p className="text-xs text-muted mb-3">{Array.isArray(data) ? data.length : 0} records</p>
          <div className="space-y-2">
            {(Array.isArray(data) ? data : []).slice(0, 20).map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0 text-xs">
                <span className="text-text">
                  {item.firstName && `${item.firstName} ${item.lastName}`}
                  {item.title && item.title}
                  {item.email && !item.firstName && item.email}
                </span>
                <span className="text-muted">{item.status || item.role || item.level}</span>
              </div>
            ))}
            {(!data || data.length === 0) && (
              <p className="text-xs text-muted text-center py-8">No data</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}