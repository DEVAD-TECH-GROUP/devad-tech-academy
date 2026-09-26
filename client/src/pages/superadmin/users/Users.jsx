import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers, suspendUser, activateUser, deleteUser } from "../../../services/superadmin/userService";
import SearchBar from "../../../components/common/SearchBar";
import Badge from "../../../components/common/Badge";
import Avatar from "../../../components/common/Avatar";
import Dropdown from "../../../components/common/Dropdown";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import Pagination from "../../../components/common/Pagination";
import { SkeletonCard } from "../../../components/common/Skeleton";
import { formatDate } from "../../../utils/formatDate";
import { toast } from "react-hot-toast";

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await getAllUsers({ search, page, limit: 20 });
      setUsers(r.data.data?.data || []);
      setTotalPages(r.data.data?.totalPages || 1);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, page]);

  const handleAction = async () => {
    setActionLoading(true);
    const { type, user } = confirmAction;
    try {
      if (type === "suspend")  await suspendUser(user._id);
      if (type === "activate") await activateUser(user._id);
      if (type === "delete")   await deleteUser(user._id);
      toast.success(`User ${type}d`);
      load();
    } catch { toast.error("Action failed"); }
    finally { setActionLoading(false); setConfirmAction(null); }
  };

  const roleVariant   = { super_admin: "purple", instructor: "orange", student: "accent" };
  const statusVariant = { active: "green", suspended: "red", inactive: "default" };

  return (
    <div className="space-y-5 fi">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="dsp text-xl font-bold text-text">Users</h1>
        <span className="text-xs text-muted">Manage all platform users</span>
      </div>

      <SearchBar onSearch={setSearch} placeholder="Search by name or email..." />

      {loading
        ? <div className="space-y-3">{[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}</div>
        : (
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u._id} className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-3 fi">
                <Avatar user={u} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-text">{u.firstName} {u.lastName}</p>
                    <Badge variant={roleVariant[u.role] || "default"} size="xs">{u.role}</Badge>
                    <Badge variant={statusVariant[u.status] || "default"} size="xs">{u.status}</Badge>
                  </div>
                  <p className="text-xs text-muted">{u.email}</p>
                  <p className="text-[10px] text-muted">Joined: {formatDate(u.createdAt)}</p>
                </div>
                <Dropdown
                  trigger={<button className="text-muted hover:text-text p-1">⋮</button>}
                  items={[
                    { label: "View Details", icon: "👁️", onClick: () => navigate(`/admin/users/${u._id}`) },
                    u.status === "active"
                      ? { label: "Suspend", icon: "🚫", onClick: () => setConfirmAction({ type: "suspend", user: u }), danger: true }
                      : { label: "Activate", icon: "✅", onClick: () => setConfirmAction({ type: "activate", user: u }) },
                    { label: "Delete", icon: "🗑️", onClick: () => setConfirmAction({ type: "delete", user: u }), danger: true },
                  ]}
                />
              </div>
            ))}
            {users.length === 0 && (
              <div className="text-center py-16 text-muted text-sm">No users found</div>
            )}
          </div>
        )}

      <Pagination page={page} totalPages={totalPages}
        onNext={() => setPage(p => p + 1)}
        onPrev={() => setPage(p => p - 1)}
        onGoTo={setPage} />

      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleAction}
        title={`${confirmAction?.type === "delete" ? "Delete" : confirmAction?.type === "suspend" ? "Suspend" : "Activate"} User`}
        message={`Are you sure you want to ${confirmAction?.type} ${confirmAction?.user?.firstName}?`}
        loading={actionLoading}
        variant={confirmAction?.type === "delete" || confirmAction?.type === "suspend" ? "danger" : "success"}
      />
    </div>
  );
}


