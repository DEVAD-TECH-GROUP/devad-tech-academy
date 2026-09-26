import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUser, suspendUser, activateUser } from "../../../services/superadmin/userService";
import Avatar from "../../../components/common/Avatar";
import Badge from "../../../components/common/Badge";
import { formatDate } from "../../../utils/formatDate";
import { SkeletonCard } from "../../../components/common/Skeleton";
import { toast } from "react-hot-toast";

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);

  useEffect(() => {
    getUser(id)
      .then((r) => setUser(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleSuspend = async () => {
    setActioning(true);
    try {
      await suspendUser(id);
      setUser((u) => ({ ...u, status: "suspended" }));
      toast.success("User suspended");
    } catch { toast.error("Failed"); }
    finally { setActioning(false); }
  };

  const handleActivate = async () => {
    setActioning(true);
    try {
      await activateUser(id);
      setUser((u) => ({ ...u, status: "active" }));
      toast.success("User activated");
    } catch { toast.error("Failed"); }
    finally { setActioning(false); }
  };

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>;
  if (!user) return <p className="text-muted text-sm">User not found</p>;

  const roleVariant = { super_admin: "purple", instructor: "orange", student: "accent" }[user.role] || "default";
console.log("user", user.avatar)
  return (
    <div className="space-y-5 fi max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/admin/users")} className="text-muted hover:text-text text-sm transition">← Users</button>
        <h1 className="dsp text-xl font-bold text-text">User Detail</h1>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-5">
        <div className="flex items-center gap-4 mb-5">
          <Avatar user={user} size="lg" />
          <div>
            <p className="dsp text-lg font-bold text-text">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-muted mb-2">{user.email}</p>
            <div className="flex gap-2 flex-wrap">
              <Badge variant={roleVariant}>{user.role}</Badge>
              <Badge variant={user.status === "active" ? "green" : "red"}>{user.status}</Badge>
              {user.isEmailVerified && <Badge variant="green" size="xs">✅ Verified</Badge>}
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-5">
          {[
            ["Phone", user.phone || "N/A"],
            ["Referral Code", user.referralCode || "N/A"],
            ["Joined", formatDate(user.createdAt)],
            ["Last Login", user.lastLogin ? formatDate(user.lastLogin) : "Never"],
            ["Email Verified", user.isEmailVerified ? "Yes ✅" : "No ❌"],
            ["Google Auth", user.isGoogleAuth ? "Yes" : "No"],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between py-2 border-b border-border/50 last:border-0">
              <span className="text-xs text-muted">{label}</span>
              <span className="text-xs text-text">{value}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          {user.status === "active" ? (
            <button
              onClick={handleSuspend}
              disabled={actioning}
              className="flex-1 bg-red/10 text-red border border-red/20 font-semibold py-2.5 rounded-xl text-sm hover:bg-red/20 transition disabled:opacity-50"
            >
              {actioning ? "..." : "Suspend User"}
            </button>
          ) : (
            <button
              onClick={handleActivate}
              disabled={actioning}
              className="flex-1 bg-green/10 text-green border border-green/20 font-semibold py-2.5 rounded-xl text-sm hover:bg-green/20 transition disabled:opacity-50"
            >
              {actioning ? "..." : "Activate User"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
