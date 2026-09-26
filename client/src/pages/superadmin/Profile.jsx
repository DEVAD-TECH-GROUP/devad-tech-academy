import useAuthStore from "../../store/authStore";
import Avatar from "../../components/common/Avatar";
import Badge from "../../components/common/Badge";
import { formatDate } from "../../utils/formatDate";

export default function AdminProfile() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-5 fi max-w-2xl">
      <h1 className="dsp text-xl font-bold text-text">Admin Profile</h1>

      <div className="bg-surface border border-border rounded-2xl p-5">
        <div className="flex items-center gap-4 mb-5">
          <Avatar user={user} size="xl" />
          <div>
            <p className="dsp text-xl font-bold text-text">{user?.firstName} {user?.lastName}</p>
            <p className="text-sm text-muted mb-2">{user?.email}</p>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="purple">🔐 Super Admin</Badge>
              <Badge variant={user?.status === "active" ? "green" : "red"}>{user?.status}</Badge>
              {user?.isEmailVerified && <Badge variant="green" size="xs">✅ Verified</Badge>}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {[
            ["Phone", user?.phone || "N/A"],
            ["Referral Code", user?.referralCode || "N/A"],
            ["Member Since", formatDate(user?.createdAt)],
            ["Last Login", user?.lastLogin ? formatDate(user?.lastLogin) : "N/A"],
            ["Email Verified", user?.isEmailVerified ? "Yes ✅" : "No ❌"],
            ["Google Auth", user?.isGoogleAuth ? "Yes" : "No"],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between py-2 border-b border-border/50 last:border-0">
              <span className="text-xs text-muted">{label}</span>
              <span className="text-xs text-text">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}