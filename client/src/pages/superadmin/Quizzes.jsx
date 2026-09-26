import { useEffect, useState } from "react";
import {
  getAllQuizzes,
  getQuizResults,
  getIntegrityFlags,
  flagAttempt,
} from "../../services/superadmin/quizService";
import Tabs from "../../components/common/Tabs";
import Badge from "../../components/common/Badge";
import { SkeletonCard } from "../../components/common/Skeleton";
import { toast } from "react-hot-toast";

export default function AdminQuizzes() {
  const [tab, setTab] = useState("all");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loaders = {
    all: getAllQuizzes,
    results: getQuizResults,
    flags: getIntegrityFlags,
  };

  useEffect(() => {
    setLoading(true);
    loaders[tab]()
      .then((r) => setData(r.data.data?.data || r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab]);

  const handleFlag = async (id) => {
    try {
      await flagAttempt(id, "Suspicious activity detected by admin");
      toast.success("Attempt flagged");
      setData((d) => d.filter((x) => x._id !== id));
    } catch { toast.error("Failed"); }
  };

  return (
    <div className="space-y-5 fi">
      <h1 className="dsp text-xl font-bold text-text">Quizzes</h1>

      <Tabs
        tabs={[
          { key: "all", label: "All Quizzes" },
          { key: "results", label: "Results" },
          { key: "flags", label: "Integrity Flags", icon: "🚩" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : data.length === 0 ? (
        <p className="text-center text-muted text-sm py-16">No data</p>
      ) : (
        <div className="space-y-3">
          {data.map((item) => (
            <div key={item._id} className="bg-surface border border-border rounded-2xl p-4 fi">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text mb-1">
                    {item.title || `${item.student?.firstName} ${item.student?.lastName}`}
                  </p>
                  {item.quiz?.title && <p className="text-xs text-muted">{item.quiz.title}</p>}
                  {item.course?.title && <p className="text-xs text-muted">{item.course.title}</p>}
                  {item.score !== undefined && (
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs text-muted">Score: {item.score}</span>
                      <span className="text-xs text-muted">{item.percentage}%</span>
                      <Badge variant={item.isPassed ? "green" : "red"} size="xs">
                        {item.isPassed ? "Pass" : "Fail"}
                      </Badge>
                    </div>
                  )}
                  {item.isFlagged && <Badge variant="red" size="xs">🚩 Flagged</Badge>}
                </div>
                {tab === "results" && !item.isFlagged && (
                  <button
                    onClick={() => handleFlag(item._id)}
                    className="text-xs text-red border border-red/20 bg-red/10 px-2 py-1 rounded-lg hover:bg-red/20 transition shrink-0"
                  >
                    Flag
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
