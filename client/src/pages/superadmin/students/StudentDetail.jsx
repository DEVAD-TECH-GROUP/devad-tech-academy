import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getStudent,
  getStudentEnrollments,
  getStudentCertificates,
} from "../../../services/superadmin/studentService";
import Avatar from "../../../components/common/Avatar";
import Badge from "../../../components/common/Badge";
import ProgressBar from "../../../components/common/ProgressBar";
import { formatDate } from "../../../utils/formatDate";
import { SkeletonCard } from "../../../components/common/Skeleton";
import Tabs from "../../../components/common/Tabs";

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("info");

  useEffect(() => {
    Promise.all([
      getStudent(id),
      getStudentEnrollments(id),
      getStudentCertificates(id),
    ])
      .then(([s, e, c]) => {
        setData(s.data.data);
        setEnrollments(e.data.data || []);
        setCerts(c.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>;
  if (!data) return null;

  const user = data.user || {};

  return (
    <div className="space-y-5 fi max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/admin/students")} className="text-muted hover:text-text text-sm transition">← Students</button>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-5">
        <div className="flex items-center gap-4 mb-4">
          <Avatar user={user} size="lg" />
          <div>
            <p className="dsp text-lg font-bold text-text">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-muted">{user.email}</p>
            <Badge variant={user.status === "active" ? "green" : "red"}>{user.status}</Badge>
          </div>
        </div>

        <Tabs
          tabs={[
            { key: "info", label: "Info" },
            { key: "courses", label: `Courses (${enrollments.length})` },
            { key: "certs", label: `Certs (${certs.length})` },
          ]}
          active={tab}
          onChange={setTab}
        />

        <div className="mt-4">
          {tab === "info" && (
            <div className="space-y-2">
              {[
                ["Phone", user.phone || "N/A"],
                ["Joined", formatDate(user.createdAt)],
                ["Last Login", user.lastLogin ? formatDate(user.lastLogin) : "Never"],
                ["Email Verified", user.isEmailVerified ? "Yes ✅" : "No ❌"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-2 border-b border-border/50 last:border-0">
                  <span className="text-xs text-muted">{label}</span>
                  <span className="text-xs text-text">{value}</span>
                </div>
              ))}
            </div>
          )}

          {tab === "courses" && (
            <div className="space-y-2">
              {enrollments.length === 0
                ? <p className="text-xs text-muted text-center py-6">No enrollments</p>
                : enrollments.map((e) => (
                  <div key={e._id} className="bg-surfaceHigh rounded-xl p-3">
                    <p className="text-xs font-medium text-text mb-1">{e.course?.title}</p>
                    <ProgressBar value={e.progress || 0} max={100} height="xs" label={`${e.progress || 0}%`} />
                  </div>
                ))
              }
            </div>
          )}

          {tab === "certs" && (
            <div className="space-y-2">
              {certs.length === 0
                ? <p className="text-xs text-muted text-center py-6">No certificates</p>
                : certs.map((c) => (
                  <div key={c._id} className="bg-surfaceHigh rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-text">{c.course?.title}</p>
                      <p className="text-[10px] text-muted">{c.certificateId}</p>
                    </div>
                    <Badge variant="green" size="xs">Issued</Badge>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
