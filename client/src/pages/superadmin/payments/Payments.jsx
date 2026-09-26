import { useEffect, useState } from "react";
import { getAllTransactions } from "../../../services/superadmin/paymentService";
import Badge from "../../../components/common/Badge";
import Pagination from "../../../components/common/Pagination";
import { formatNaira } from "../../../utils/formatCurrency";
import { formatDate } from "../../../utils/formatDate";
import { SkeletonCard } from "../../../components/common/Skeleton";

export default function Payments() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const r = await getAllTransactions({ page, limit: 20 });
      setTransactions(r.data.data?.data || []);
      setTotalPages(r.data.data?.totalPages || 1);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  return (
    <div className="space-y-5 fi">
      <h1 className="dsp text-xl font-bold text-text">Payments</h1>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : (
        <div className="space-y-2">
          {transactions.length === 0 && (
            <div className="text-center py-16 text-muted text-sm">No transactions yet</div>
          )}
          {transactions.map((t) => (
            <div key={t._id} className="bg-surface border border-border rounded-2xl p-4 fi">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-xs font-semibold text-text mb-0.5">{t.invoiceId}</p>
                  <p className="text-xs text-muted">
                    {t.student?.firstName} {t.student?.lastName}
                  </p>
                  <p className="text-[10px] text-muted">{formatDate(t.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-text">{formatNaira(t.finalAmount)}</p>
                  <Badge
                    variant={t.status === "success" ? "green" : t.status === "pending" ? "yellow" : "red"}
                    size="xs"
                  >
                    {t.status}
                  </Badge>
                  <p className="text-[10px] text-muted capitalize mt-0.5">{t.gateway}</p>
                </div>
              </div>
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
