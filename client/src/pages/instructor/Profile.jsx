import useAuthStore from "../../store/authStore";
import api from "../../api/Api";
import Input from "../../components/common/Input";
import Avatar from "../../components/common/Avatar";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function InstructorProfile() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    headline: user?.headline || "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const r = await api.put("/instructor/profile", form);
      updateUser(r.data.data);
      toast.success("Profile updated! ✅");
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 fi max-w-2xl">
      <h1 className="dsp text-xl font-bold text-text">Profile</h1>
      <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-4">
          <Avatar user={user} size="lg" />
          <div>
            <p className="text-sm font-semibold text-text">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-orange">Instructor</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            value={form.firstName}
            onChange={(e) => set("firstName", e.target.value)}
          />
          <Input
            label="Last Name"
            value={form.lastName}
            onChange={(e) => set("lastName", e.target.value)}
          />
        </div>
        <Input
          label="Phone"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
        />
        <Input
          label="Headline"
          value={form.headline}
          onChange={(e) => set("headline", e.target.value)}
          placeholder="e.g. Senior React Developer"
        />
        <div>
          <label className="text-xs text-mutedLight font-medium mb-1.5 block">
            Bio
          </label>
          <textarea
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
            rows={4}
            className="w-full bg-surfaceHigh border border-border rounded-xl px-4 py-3 text-sm text-text placeholder-muted focus:outline-none focus:border-orange transition resize-none"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-orange hover:bg-orange/90 text-white font-semibold py-3 rounded-xl text-sm transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}
