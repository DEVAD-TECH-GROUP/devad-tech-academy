// src/pages/instructor/Messages.jsx
import { useEffect, useState } from "react";
import {
  getConversations,
  getMessages,
  sendMessage,
} from "../../services/instructor/messageService";
import Avatar from "../../components/common/Avatar";
import Input from "../../components/common/Input";
import { timeAgo } from "../../utils/formatDate";
import useAuthStore from "../../store/authStore";
import { toast } from "react-hot-toast";

export default function InstructorMessages() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConversations()
      .then((r) => setConversations(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    getMessages(selected._id)
      .then((r) => setMessages(r.data.data || []))
      .catch(() => {});
  }, [selected]);

  const handleSend = async () => {
    if (!content.trim() || !selected) return;
    const recipient = selected.participants?.find((p) => p._id !== user?._id);
    if (!recipient) return;
    setSending(true);
    try {
      const r = await sendMessage(recipient._id, content);
      setMessages((m) => [...m, r.data.data]);
      setContent("");
    } catch {
      toast.error("Failed to send");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fi">
      <h1 className="dsp text-xl font-bold text-text mb-5">Messages</h1>
      <div
        className="bg-surface border border-border rounded-2xl overflow-hidden flex"
        style={{ height: "65vh" }}
      >
        <div className="w-64 shrink-0 border-r border-border flex flex-col">
          <div className="p-3 border-b border-border">
            <p className="text-xs font-semibold text-muted">Conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((c) => {
              const other = c.participants?.find((p) => p._id !== user?._id);
              return (
                <div
                  key={c._id}
                  onClick={() => setSelected(c)}
                  className={`flex items-center gap-2 p-3 cursor-pointer hover:bg-surfaceHigh transition ${selected?._id === c._id ? "bg-surfaceHigh border-l-2 border-orange" : ""}`}
                >
                  <Avatar user={other} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-text truncate">
                      {other?.firstName} {other?.lastName}
                    </p>
                    <p className="text-[10px] text-muted truncate">
                      {c.lastMessageText}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          {selected ? (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m) => {
                  const isMe =
                    m.sender?._id === user?._id || m.sender === user?._id;
                  return (
                    <div
                      key={m._id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-2xl text-xs ${isMe ? "bg-orange text-white" : "bg-surfaceHigh text-text"}`}
                      >
                        <p>{m.content}</p>
                        <p
                          className={`text-[10px] mt-1 ${isMe ? "text-white/60" : "text-muted"}`}
                        >
                          {timeAgo(m.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-3 border-t border-border flex gap-2 shrink-0">
                <Input
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !content.trim()}
                  className="bg-orange hover:bg-orange/90 text-white text-sm px-4 rounded-xl disabled:opacity-50 transition"
                >
                  {sending ? "..." : "Send"}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted text-sm">
              Select a conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
