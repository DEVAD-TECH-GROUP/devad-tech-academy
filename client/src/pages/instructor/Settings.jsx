// src/pages/instructor/Settings.jsx
import { useState } from "react";
import Toggle from "../../components/common/Toggle";
import api from "../../api/Api";
import { toast } from "react-hot-toast";

export default function InstructorSettings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    enrollmentAlerts: true,
    reviewAlerts: true,
  });
  const [saving, setSaving] = useState(false);
  const toggle = (k) => setSettings((s) => ({ ...s, [k]: !s[k] }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/instructor/profile/settings", settings);
      toast.success("Settings saved! ✅");
    } catch {
      toast.error("Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 fi max-w-2xl">
      <h1 className="dsp text-xl font-bold text-text">Settings</h1>
      <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
        <h2 className="dsp text-sm font-bold text-text">Notifications</h2>
        {Object.entries({
          emailNotifications: "Email Notifications",
          pushNotifications: "Push Notifications",
          enrollmentAlerts: "New Enrollment Alerts",
          reviewAlerts: "New Review Alerts",
        }).map(([k, label]) => (
          <div key={k} className="flex items-center justify-between">
            <p className="text-sm text-text">{label}</p>
            <Toggle checked={settings[k]} onChange={() => toggle(k)} />
          </div>
        ))}
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-orange hover:bg-orange/90 text-white font-semibold py-3 rounded-xl text-sm transition disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}
