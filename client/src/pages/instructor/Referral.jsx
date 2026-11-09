import { useEffect, useState } from "react";
import {
  getReferralStats,
  getReferralList,
} from "../../services/instructor/referralService";
import { toast } from "react-hot-toast";
import { formatDate } from "../../utils/formatDate";
import { SkeletonCard } from "../../components/common/Skeleton";

export default function InstructorReferral() {
  const [stats, setStats] = useState(null);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getReferralStats(), getReferralList()])
      .then(([s, l]) => {
        setStats(s.data.data);
        setList(l.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );

  return (
    <div className="space-y-5 fi">
      <h1 className="dsp text-xl font-bold text-text">Referral Program</h1>

      <div className="bg-surface border border-border rounded-2xl p-5">
        <h2 className="dsp text-sm font-bold text-text mb-1">
          Your Referral Code
        </h2>
        <p className="text-xs text-muted mb-4">
          Earn 10% discount per referral — up to 50% off
        </p>
        <div className="flex gap-2">
          <div className="flex-1 bg-surfaceHigh border border-border rounded-xl px-4 py-3 text-sm font-mono text-orange">
            {stats?.referralCode || "..."}
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(stats?.shareUrl || "");
              toast.success("Copied! 🎁");
            }}
            className="bg-orange hover:bg-orange/90 text-white text-xs font-semibold px-4 rounded-xl transition"
          >
            Copy
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: stats?.total || 0, color: "#FB923C" },
          { label: "Active", value: stats?.active || 0, color: "#34D399" },
          {
            label: "Discount",
            value: `${stats?.discountPercent || 0}%`,
            color: "#FBBF24",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-surface border border-border rounded-2xl p-4 text-center"
          >
            <div className="dsp text-xl font-extrabold" style={{ color }}>
              {value}
            </div>
            <div className="text-xs text-muted mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {list.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-4">
          <h2 className="dsp text-sm font-bold text-text mb-3">
            Your Referrals
          </h2>
          <div className="space-y-2">
            {list.map((r) => (
              <div
                key={r._id}
                className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
              >
                <div>
                  <p className="text-xs font-medium text-text">
                    {r.referee?.firstName} {r.referee?.lastName}
                  </p>
                  <p className="text-[10px] text-muted">
                    {formatDate(r.createdAt)}
                  </p>
                </div>
                <span className="text-xs text-green font-medium">+10%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
