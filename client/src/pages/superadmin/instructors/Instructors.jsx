import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllInstructors,
  getInstructorApplications,
  approveInstructor,
  rejectInstructor,
} from "../../../services/superadmin/instructorService";
import Tabs from "../../../components/common/Tabs";
import Avatar from "../../../components/common/Avatar";
import Badge from "../../../components/common/Badge";
import SearchBar from "../../../components/common/SearchBar";
import { SkeletonCard } from "../../../components/common/Skeleton";
import { toast } from "react-hot-toast";

export default function Instructors() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("all");
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const fn = tab === "applications" ? getInstructorApplications : getAllInstructors;
      const r = await fn({ search });
      setInstructors(r.data.data?.data || r.data.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [tab, search]);

  const handleApprove = async (userId) => {
    setActionLoading(userId);
    try {
      await approveInstructor(userId);
      toast.success("Instructor approved! 🎉");
      load();
    } catch { toast.error("Failed"); }
    finally { setActionLoading(null); }
  };

  const handleReject = async (userId) => {
    setActionLoading(userId);
    try {
      await rejectInstructor(userId, "Application did not meet our current requirements");
      toast.success("Application rejected");
      load();
    } catch { toast.error("Failed"); }
    finally { setActionLoading(null); }
  };

  return (
    <div className="space-y-5 fi">
      <h1 className="dsp text-xl font-bold text-text">Instructors</h1>

      <Tabs
        tabs={[
          { key: "all", label: "All Instructors", icon: "👨‍🏫" },
          { key: "applications", label: "Applications", icon: "📋" },
        ]}
        active={tab}
        onChange={setTab}
      />

      <SearchBar onSearch={setSearch} placeholder="Search instructors..." />

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : (
        <div className="space-y-3">
          {instructors.length === 0 && (
            <div className="text-center py-16 text-muted text-sm">No instructors found</div>
          )}
          {instructors.map((item) => {
            const user = item.user || item;
            const instructor = item.user ? item : null;
            return (
              <div key={item._id} className="bg-surface border border-border rounded-2xl p-4 fi">
                <div className="flex items-center gap-3">
                  <Avatar user={user} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-muted">{user.email}</p>
                    {instructor && (
                      <Badge
                        variant={
                          instructor.applicationStatus === "approved" ? "green" :
                          instructor.applicationStatus === "pending" ? "yellow" : "red"
                        }
                        size="xs"
                      >
                        {instructor.applicationStatus}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {tab === "applications" && instructor?.applicationStatus === "pending" && (
                      <>
                        <button
                          onClick={() => handleApprove(user._id)}
                          disabled={actionLoading === user._id}
                          className="text-xs bg-green/10 text-green border border-green/20 px-3 py-1.5 rounded-xl hover:bg-green/20 transition disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(user._id)}
                          disabled={actionLoading === user._id}
                          className="text-xs bg-red/10 text-red border border-red/20 px-3 py-1.5 rounded-xl hover:bg-red/20 transition disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => navigate(`/admin/instructors/${user._id}`)}
                      className="text-xs text-muted hover:text-text border border-border px-3 py-1.5 rounded-xl hover:border-purple/40 transition"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
