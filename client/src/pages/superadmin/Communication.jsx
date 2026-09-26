import { useState } from "react";
import {
  createAnnouncement,
  sendEmailCampaign,
  sendSMSBlast,
  sendPushNotification,
} from "../../services/superadmin/communicationService";
import Tabs from "../../components/common/Tabs";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import Select from "../../components/common/Select";
import { toast } from "react-hot-toast";

export default function Communication() {
  const [tab, setTab] = useState("announce");
  const [form, setForm] = useState({ title: "", message: "", targetAudience: "all" });
  const [sending, setSending] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handlers = {
    announce: () => createAnnouncement({ ...form, sendPushNotification: true, sendEmail: true }),
    email: () => sendEmailCampaign({ subject: form.title, message: form.message, targetAudience: form.targetAudience }),
    sms: () => sendSMSBlast({ message: form.message, targetAudience: form.targetAudience }),
    push: () => sendPushNotification({ title: form.title, message: form.message }),
  };

  const handleSend = async () => {
    if (!form.title.trim() || !form.message.trim()) return toast.error("Fill all fields");
    setSending(true);
    try {
      await handlers[tab]();
      toast.success("Sent successfully! 📢");
      setForm({ title: "", message: "", targetAudience: "all" });
    } catch { toast.error("Failed to send"); }
    finally { setSending(false); }
  };

  return (
    <div className="space-y-5 fi max-w-2xl">
      <h1 className="dsp text-xl font-bold text-text">Communication</h1>

      <Tabs
        tabs={[
          { key: "announce", label: "Announce", icon: "📢" },
          { key: "email", label: "Email", icon: "✉️" },
          { key: "sms", label: "SMS", icon: "📱" },
          { key: "push", label: "Push", icon: "🔔" },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
        <Input
          label="Title / Subject *"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Message title"
          required
        />
        <Textarea
          label="Message *"
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          placeholder="Your message..."
          rows={5}
          required
        />
        {["announce", "email", "sms"].includes(tab) && (
          <Select
            label="Target Audience"
            value={form.targetAudience}
            onChange={(e) => set("targetAudience", e.target.value)}
            options={[
              { value: "all", label: "All Users" },
              { value: "student", label: "Students Only" },
              { value: "instructor", label: "Instructors Only" },
            ]}
          />
        )}
        <button
          onClick={handleSend}
          disabled={sending}
          className="w-full bg-purple hover:bg-purple/90 text-white font-semibold py-3 rounded-xl text-sm transition disabled:opacity-50"
        >
          {sending ? "Sending..." : "Send Now"}
        </button>
      </div>
    </div>
  );
}