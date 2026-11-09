import { useEffect, useState } from "react";
import {
  getEarningsSummary,
  getEarningsHistory,
  requestPayout,
} from "../../services/instructor/earningsService";
import { formatNaira } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import AreaChart from "../../components/charts/AreaChart";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import { SkeletonCard } from "../../components/common/Skeleton";
import Badge from "../../components/common/Badge";
import { toast } from "react-hot-toast";

export default function Earnings() {
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayout, setShowPayout] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    Promise.all([getEarningsSummary(), getEarningsHistory()])
      .then(([s, h]) => {
        setSummary(s.data.data);
        setHistory(h.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handlePayout = async () => {
    if (!payoutAmount || Number(payoutAmount) <= 0)
      return toast.error("Enter a valid amount");
    setRequesting(true);
    try {
      await requestPayout({ amount: Number(payoutAmount) });
      toast.success("Payout requested! We'll process it soon 💰");
      setShowPayout(false);
      setPayoutAmount("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Payout request failed");
    } finally {
      setRequesting(false);
    }
  };

  if (loading)
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );

  const chartData =
    summary?.monthlyRevenue?.map((m) => ({
      name: `${m._id?.month}/${m._id?.year}`,
      revenue: m.revenue,
    })) || [];

  return (
    <div className="space-y-5 fi">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="dsp text-xl font-bold text-text">Earnings</h1>
        <button
          onClick={() => setShowPayout(true)}
          className="bg-orange hover:bg-orange/90 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition"
        >
          Request Payout
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          {
            icon: "💰",
            label: "Total Revenue",
            value: formatNaira(summary?.totalRevenue || 0),
            color: "#34D399",
          },
          {
            icon: "📊",
            label: "Platform Fee",
            value: `${summary?.platformFeePercent || 30}%`,
            color: "#F87171",
          },
          {
            icon: "💵",
            label: "Your Earnings",
            value: formatNaira((summary?.totalRevenue || 0) * 0.7),
            color: "#818CF8",
          },
        ].map(({ icon, label, value, color }) => (
          <div
            key={label}
            className="bg-surface border border-border rounded-2xl p-4"
          >
            <div className="text-2xl mb-2">{icon}</div>
            <div className="dsp text-lg font-extrabold" style={{ color }}>
              {value}
            </div>
            <div className="text-xs text-muted mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      {chartData.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-4">
          <h2 className="dsp text-sm font-bold text-text mb-4">
            Monthly Revenue
          </h2>
          <AreaChart
            data={chartData}
            xKey="name"
            areas={[{ key: "revenue", color: "#FB923C", name: "Revenue" }]}
            height={200}
          />
        </div>
      )}

      {/* Payment history */}
      {history.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-4">
          <h2 className="dsp text-sm font-bold text-text mb-3">
            Payment History
          </h2>
          <div className="space-y-2">
            {history.map((p) => (
              <div
                key={p._id}
                className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0"
              >
                <div>
                  <p className="text-xs font-medium text-text">{p.invoiceId}</p>
                  <p className="text-[10px] text-muted">
                    {formatDate(p.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-text">
                    {formatNaira(p.finalAmount)}
                  </p>
                  <Badge
                    variant={p.status === "success" ? "green" : "red"}
                    size="xs"
                  >
                    {p.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal
        isOpen={showPayout}
        onClose={() => setShowPayout(false)}
        title="Request Payout"
        size="sm"
      >
        <p className="text-xs text-muted mb-3">
          Available balance:{" "}
          <span className="text-green font-semibold">
            {formatNaira((summary?.totalRevenue || 0) * 0.7)}
          </span>
        </p>
        <Input
          label="Amount (₦)"
          type="number"
          value={payoutAmount}
          onChange={(e) => setPayoutAmount(e.target.value)}
          placeholder="e.g. 50000"
          required
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => setShowPayout(false)}
            className="flex-1 bg-surfaceHigh border border-border text-text text-sm py-2.5 rounded-xl hover:border-orange/40 transition"
          >
            Cancel
          </button>
          <button
            onClick={handlePayout}
            disabled={requesting}
            className="flex-1 bg-orange hover:bg-orange/90 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-50"
          >
            {requesting ? "Requesting..." : "Request Payout"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
