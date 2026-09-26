import { useEffect, useState } from "react";
import { getRoles, getPermissions } from "../../services/superadmin/roleService";
import Badge from "../../components/common/Badge";
import { SkeletonCard } from "../../components/common/Skeleton";

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getRoles(), getPermissions()])
      .then(([r, p]) => { setRoles(r.data.data || []); setPermissions(p.data.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const roleColor = (n) => ({ super_admin: "purple", instructor: "orange", student: "accent" }[n] || "default");

  if (loading) return <div className="space-y-3">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>;

  return (
    <div className="space-y-5 fi">
      <h1 className="dsp text-xl font-bold text-text">Roles & Permissions</h1>

      <div className="space-y-4">
        {roles.map((r) => (
          <div key={r.name} className="bg-surface border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={roleColor(r.name)}>{r.label}</Badge>
            </div>
            <p className="text-xs text-muted mb-3">{r.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {r.permissions?.map((p) => (
                <span key={p} className="text-[10px] bg-surfaceHigh text-muted px-2 py-1 rounded-lg border border-border">
                  {p}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {permissions.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-4">
          <h2 className="dsp text-sm font-bold text-text mb-3">All Platform Permissions</h2>
          <div className="flex flex-wrap gap-1.5">
            {permissions.map((p) => (
              <span key={p} className="text-[10px] bg-surfaceHigh text-muted px-2 py-1 rounded-lg border border-border">
                {p}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
