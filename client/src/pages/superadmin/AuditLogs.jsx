import { useEffect, useState } from "react";
import {
  getAuditLogs,
  getSecurityLogs,
  getPaymentLogs,
} from "../../services/superadmin/auditService";
import Badge from "../../components/common/Badge";
import Tabs from "../../components/common/Tabs";
import Pagination from "../../components/common/Pagination";
import { timeAgo } from "../../utils/formatDate";
import { SkeletonCard } from "../../components/common/Skeleton";

export default function AuditLogs() {
  const [tab, setTab] = useState("all");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loaders = {
    all: getAuditLogs,
    security: getSecurityLogs,
    payments: getPaymentLogs,
  };

  const load = async () => {
    setLoading(true);
    try {
      const r = await loaders[tab]({ page, limit: 20 });
      setLogs(r.data.data?.data || []);
      setTotalPages(r.data.data?.totalPages || 1);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [tab, page]);

  const typeVariant = (t) => ({
    auth: "blue", user: "accent", content: "green",
    security: "red", payment: "yellow", config: "purple", system: "default",
  }[t] || "default");

  return (
    <div className="space-y-5 fi">
      <h1 className="dsp text-xl font-bold text-text">Audit Logs</h1>

      <Tabs
        tabs={[
          { key: "all", label: "All Logs" },
          { key: "security", label: "Security", icon: "🔐" },
          { key: "payments", label: "Payments", icon: "💰" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : (
        <div className="space-y-2">
          {logs.length === 0 && <p className="text-center text-muted text-sm py-16">No logs</p>}
          {logs.map((l) => (
            <div key={l._id} className="bg-surface border border-border rounded-2xl p-3 fi">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text line-clamp-1">{l.action}</p>
                  {l.actor && (
                    <p className="text-[10px] text-muted">
                      {l.actor.firstName} {l.actor.lastName} · {l.actor.role}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={typeVariant(l.type)} size="xs">{l.type}</Badge>
                  <span className="text-[10px] text-muted">{timeAgo(l.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onNext={() => setPage((p) => p + 1)} onPrev={() => setPage((p) => p - 1)} onGoTo={setPage} />
    </div>
  );
}
