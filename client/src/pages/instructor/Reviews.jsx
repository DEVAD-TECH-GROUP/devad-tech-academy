import { useEffect, useState } from "react";
import {
  getMyReviews,
  replyToReview,
} from "../../services/instructor/reviewService";
import Avatar from "../../components/common/Avatar";
import Rating from "../../components/common/Rating";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";
import Textarea from "../../components/common/Textarea";
import { timeAgo } from "../../utils/formatDate";
import { toast } from "react-hot-toast";
import { SkeletonCard } from "../../components/common/Skeleton";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replying, setReplying] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getMyReviews()
      .then((r) => setReviews(r.data.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleReply = async () => {
    if (!replyContent.trim()) return toast.error("Reply cannot be empty");
    setSubmitting(true);
    try {
      await replyToReview(replying._id, replyContent);
      setReviews((r) =>
        r.map((x) =>
          x._id === replying._id
            ? { ...x, instructorReply: { content: replyContent } }
            : x,
        ),
      );
      setReplying(null);
      setReplyContent("");
      toast.success("Reply posted! ✅");
    } catch {
      toast.error("Failed to post reply");
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
      <h1 className="dsp text-xl font-bold text-text">Reviews</h1>
      {reviews.length === 0 ? (
        <EmptyState
          icon="⭐"
          title="No reviews yet"
          message="Reviews from your students will appear here"
        />
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div
              key={r._id}
              className="bg-surface border border-border rounded-2xl p-4 fi"
            >
              <div className="flex items-start gap-3">
                <Avatar user={r.student} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-semibold text-text">
                      {r.student?.firstName} {r.student?.lastName}
                    </p>
                    <Rating value={r.rating} readonly size="sm" />
                  </div>
                  <p className="text-xs text-muted mb-1">{r.course?.title}</p>
                  <p className="text-sm text-text mb-2">{r.review}</p>
                  <p className="text-[10px] text-muted">
                    {timeAgo(r.createdAt)}
                  </p>
                  {r.instructorReply ? (
                    <div className="mt-2 bg-orange/10 border border-orange/20 rounded-xl p-3">
                      <p className="text-xs text-orange font-semibold mb-1">
                        Your reply:
                      </p>
                      <p className="text-xs text-text">
                        {r.instructorReply.content}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplying(r)}
                      className="mt-2 text-xs text-orange hover:underline"
                    >
                      Reply to review
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!replying}
        onClose={() => setReplying(null)}
        title="Reply to Review"
        size="sm"
      >
        <p className="text-xs text-muted mb-3">"{replying?.review}"</p>
        <Textarea
          label="Your Reply"
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          placeholder="Write your response..."
          rows={4}
          required
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
