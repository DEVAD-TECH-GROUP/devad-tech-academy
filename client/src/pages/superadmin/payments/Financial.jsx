import { useEffect, useState } from "react";
import { getRevenueSummary, exportFinancial } from "../../../services/superadmin/financialService";
import { formatNaira } from "../../../utils/formatCurrency";
import AreaChart from "../../../components/charts/AreaChart";
import { SkeletonCard } from "../../../components/common/Skeleton";
import { toast } from "react-hot-toast";

export default function Financial() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    getRevenueSummary()
      .then((r) => setSummary(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const r = await exportFinancial(format);
      const url = URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `financial-report.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported! 📊");
    } catch { toast.error("Export failed"); }
    finally { setExporting(false); }
  };

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>;

  const total = summary?.summary?.totalRevenue || 0;
  const chartData = summary?.monthly?.map((m) => ({
    name: `${m._id?.month}/${m._id?.year}`,
    revenue: m.revenue,
  })) || [];

  return (
    <div className="space-y-5 fi">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="dsp text-xl font-bold text-text">Financial Reports</h1>
        <div className="flex gap-2">
          {["pdf", "excel", "csv"].map((f) => (
            <button
              key={f}
              onClick={() => handleExport(f)}
              disabled={exporting}
              className="text-xs bg-surfaceHigh border border-border text-muted px-3 py-1.5 rounded-xl hover:text-text hover:border-purple/40 transition disabled:opacity-50 uppercase"
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "Total Revenue", value: formatNaira(total), color: "#34D399" },
          { label: "Platform Fees (30%)", value: formatNaira(total * 0.3), color: "#818CF8" },
          { label: "Instructor Payouts", value: formatNaira(total * 0.7), color: "#FB923C" },
          { label: "Total Transactions", value: summary?.summary?.totalTransactions || 0, color: "#FBBF24" },
          { label: "Monthly Revenue", value: formatNaira(chartData[chartData.length - 1]?.revenue || 0), color: "#60A5FA" },
          { label: "Avg per Transaction", value: formatNaira(summary?.summary?.totalTransactions ? total / summary?.summary?.totalTransactions : 0), color: "#F472B6" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-surface border border-border rounded-2xl p-4">
            <div className="dsp text-lg font-extrabold" style={{ color }}>{value}</div>
            <div className="text-xs text-muted mt-1">{label}</div>
          </div>
        ))}
      </div>

      {chartData.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-4">
          <h2 className="dsp text-sm font-bold text-text mb-4">Revenue Trend</h2>
          <AreaChart
            data={chartData}
            xKey="name"
            areas={[{ key: "revenue", color: "#818CF8", name: "Revenue" }]}
            height={220}
          />
        </div>
      )}
    </div>
  );
}
