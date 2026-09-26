import { useEffect, useState } from "react";
import { getAllCertificates, verifyCertificate } from "../../services/superadmin/certificateService";
import { formatDate } from "../../utils/formatDate";
import Pagination from "../../components/common/Pagination";
import { SkeletonCard } from "../../components/common/Skeleton";
import Badge from "../../components/common/Badge";
import Input from "../../components/common/Input";
import { toast } from "react-hot-toast";

export default function AdminCertificates() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [verifyId, setVerifyId] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await getAllCertificates({ page, limit: 20 });
      setCerts(r.data.data?.data || []);
      setTotalPages(r.data.data?.totalPages || 1);
    } catch {
      toast.error("Failed to load certificates");
    }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  const handleVerify = async () => {
    if (!verifyId.trim()) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const r = await verifyCertificate(verifyId.trim());
      setVerifyResult(r.data.data);
    } catch { toast.error("Certificate not found"); }
    finally { setVerifying(false); }
  };

  return (
    <div className="space-y-5 fi">
      <h1 className="dsp text-xl font-bold text-text">Certificates</h1>

      {/* Verify */}
      <div className="bg-surface border border-border rounded-2xl p-4">
        <h2 className="dsp text-sm font-bold text-text mb-3">Verify Certificate</h2>
        <div className="flex gap-2">
          <Input
            value={verifyId}
            onChange={(e) => setVerifyId(e.target.value)}
            placeholder="Enter Certificate ID..."
            className="flex-1"
          />
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="bg-purple hover:bg-purple/90 text-white text-sm px-4 rounded-xl transition disabled:opacity-50"
          >
            {verifying ? "..." : "Verify"}
          </button>
        </div>
        {verifyResult && (
          <div className="mt-3 bg-green/10 border border-green/20 rounded-xl p-3">
            <p className="text-xs text-green font-semibold mb-1">✅ Valid Certificate</p>
            <p className="text-xs text-text">{verifyResult.certificate?.student?.firstName} {verifyResult.certificate?.student?.lastName}</p>
            <p className="text-xs text-muted">{verifyResult.certificate?.course?.title}</p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : (
        <div className="space-y-2">
          {certs.length === 0 && <p className="text-center text-muted text-sm py-16">No certificates issued yet</p>}
          {certs.map((c) => (
            <div key={c._id} className="bg-surface border border-border rounded-2xl p-4 fi">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-semibold text-text">
                    {c.student?.firstName} {c.student?.lastName}
                  </p>
                  <p className="text-xs text-muted">{c.course?.title}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] text-muted font-mono">{c.certificateId}</span>
                    <span className="text-[10px] text-muted">{formatDate(c.issuedAt)}</span>
                  </div>
                </div>
                <div className="text-right">
                  {c.grade && <p className="text-xs text-green font-semibold">{c.grade}</p>}
                  <Badge variant="green" size="xs">Issued</Badge>
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