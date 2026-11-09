import { useEffect, useState } from "react";
import {
  getCourseDiscussions,
  replyToDiscussion,
} from "../../services/instructor/discussionService";
import Avatar from "../../components/common/Avatar";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";
import Textarea from "../../components/common/Textarea";
import { timeAgo } from "../../utils/formatDate";
import { toast } from "react-hot-toast";
import { SkeletonCard } from "../../components/common/Skeleton";

export default function Discussions() {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replying, setReplying] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCourseDiscussions()
      .then((r) => setDiscussions(r.data.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setSubmitting(true);
    try {
      await replyToDiscussion(replying._id, replyContent);
      toast.success("Reply posted! ✅");
      setReplying(null);
      setReplyContent("");
    } catch {
      toast.error("Failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );

  return (
    <div className="space-y-5 fi">
      <h1 className="dsp text-xl font-bold text-text">Discussions</h1>
      {discussions.length === 0 ? (
        <EmptyState
          icon="💬"
          title="No discussions"
          message="Student discussions will appear here"
        />
      ) : (
        <div className="space-y-3">
          {discussions.map((d) => (
            <div
              key={d._id}
              className="bg-surface border border-border rounded-2xl p-4 fi"
            >
              <div className="flex items-start gap-3">
                <Avatar user={d.author} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text mb-0.5">
                    {d.title}
                  </p>
                  <p className="text-xs text-muted mb-2 line-clamp-2">
                    {d.content}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span>{timeAgo(d.createdAt)}</span>
                    <span>💬 {d.totalReplies || 0} replies</span>
                    <button
                      onClick={() => setReplying(d)}
                      className="text-orange hover:underline"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!replying}
        onClose={() => setReplying(null)}
        title="Reply to Discussion"
        size="sm"
      >
        <p className="text-xs text-muted mb-3 font-medium">
          "{replying?.title}"
        </p>
        <Textarea
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          placeholder="Your instructor reply..."
          rows={4}
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => setReplying(null)}
            className="flex-1 bg-surfaceHigh border border-border text-text text-sm py-2.5 rounded-xl hover:border-orange/40 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleReply}
            disabled={submitting}
            className="flex-1 bg-orange hover:bg-orange/90 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-50"
          >
            {submitting ? "Posting..." : "Post Reply"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
