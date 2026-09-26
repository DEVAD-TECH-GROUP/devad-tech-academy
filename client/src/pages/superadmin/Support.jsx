import { useEffect, useState } from "react";
import {
  getAllTickets,
  respondToTicket,
  closeTicket,
} from "../../services/superadmin/supportService";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import Textarea from "../../components/common/Textarea";
import Tabs from "../../components/common/Tabs";
import { formatDate } from "../../utils/formatDate";
import { SkeletonCard } from "../../components/common/Skeleton";
import { toast } from "react-hot-toast";

export default function AdminSupport() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("open");
  const [replying, setReplying] = useState(null);
  const [replyMsg, setReplyMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const statusMap = { open: "open", progress: "in_progress", resolved: "resolved" };

  const load = async () => {
    setLoading(true);
    try {
      const r = await getAllTickets({ status: statusMap[tab] });
      setTickets(r.data.data?.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [tab]);

  const handleReply = async () => {
    if (!replyMsg.trim()) return;
    setSubmitting(true);
    try {
      await respondToTicket(replying._id, replyMsg);
      toast.success("Reply sent! ✅");
      setReplying(null);
      setReplyMsg("");
      load();
    } catch { toast.error("Failed"); }
    finally { setSubmitting(false); }
  };

  const handleClose = async (id) => {
    try {
      await closeTicket(id);
      toast.success("Ticket closed");
      load();
    } catch { toast.error("Failed"); }
  };

  const statusVariant = (s) => ({ open: "blue", in_progress: "yellow", resolved: "green" }[s] || "default");

  return (
    <div className="space-y-5 fi">
      <h1 className="dsp text-xl font-bold text-text">Support</h1>

      <Tabs
        tabs={[
          { key: "open", label: "Open", icon: "🔵" },
          { key: "progress", label: "In Progress", icon: "🟡" },
          { key: "resolved", label: "Resolved", icon: "🟢" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : (
        <div className="space-y-3">
          {tickets.length === 0 && <p className="text-center text-muted text-sm py-16">No {tab} tickets</p>}
          {tickets.map((t) => (
            <div key={t._id} className="bg-surface border border-border rounded-2xl p-4 fi">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text mb-1">{t.subject}</p>
                  <p className="text-xs text-muted mb-1">
                    {t.user?.firstName} {t.user?.lastName} · {t.ticketId}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant={statusVariant(t.status)} size="xs">{t.status}</Badge>
                    <Badge variant="default" size="xs">{t.priority}</Badge>
                    <span className="text-[10px] text-muted">{formatDate(t.createdAt)}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setReplying(t)}
                    className="text-xs bg-accent/10 text-accent border border-accent/20 px-3 py-1.5 rounded-xl hover:bg-accent/20 transition"
                  >
                    Reply
                  </button>
                  {t.status !== "resolved" && (
                    <button
                      onClick={() => handleClose(t._id)}
                      className="text-xs bg-green/10 text-green border border-green/20 px-3 py-1.5 rounded-xl hover:bg-green/20 transition"
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!replying} onClose={() => setReplying(null)} title="Reply to Ticket" size="sm">
        <p className="text-xs text-muted mb-3 font-medium">{replying?.subject}</p>
        <Textarea value={replyMsg} onChange={(e) => setReplyMsg(e.target.value)} placeholder="Your reply..." rows={4} />
        <div className="flex gap-3 mt-4">
          <button onClick={() => setReplying(null)} className="flex-1 bg-surfaceHigh border border-border text-text text-sm py-2.5 rounded-xl hover:border-purple/40 transition">Cancel</button>
          <button onClick={handleReply} disabled={submitting} className="flex-1 bg-purple hover:bg-purple/90 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-50">
            {submitting ? "Sending..." : "Send Reply"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
