// src/pages/instructor/Certificates.jsx
import { useEffect, useState } from "react";
import {
  getMyCertificates,
  getPendingCertificates,
} from "../../services/instructor/certificateService";
import Tabs from "../../components/common/Tabs";
import { formatDate } from "../../utils/formatDate";
import { SkeletonCard } from "../../components/common/Skeleton";
import EmptyState from "../../components/common/EmptyState";

export default function Certificates() {
  const [tab, setTab] = useState("issued");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fn = tab === "issued" ? getMyCertificates : getPendingCertificates;
    fn()
      .then((r) => setData(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <div className="space-y-5 fi">
      <h1 className="dsp text-xl font-bold text-text">Certificates</h1>
      <Tabs
        tabs={[
          { key: "issued", label: "Issued", icon: "🏅" },
          { key: "pending", label: "Pending", icon: "⏳" },
        ]}
        active={tab}
        onChange={setTab}
      />
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState icon="🏅" title={`No ${tab} certificates`} message="" />
      ) : (
        <div className="space-y-3">
          {data.map((c) => (
            <div
              key={c._id}
              className="bg-surface border border-border rounded-2xl p-4"
            >
              <p className="text-sm font-semibold text-text">
                {c.student?.firstName} {c.student?.lastName} {c.course?.title}
              </p>
              <p className="text-xs text-muted">
                {tab === "issued"
                  ? `Issued: ${formatDate(c.issuedAt)}`
                  : "Awaiting certificate"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
