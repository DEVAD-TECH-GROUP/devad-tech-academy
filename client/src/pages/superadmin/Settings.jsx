import { useEffect, useState } from "react";
import {
  getSettings,
  updateSettings,
  toggleMaintenance,
  backupNow,
} from "../../services/superadmin/settingService";
import Input from "../../components/common/Input";
import Toggle from "../../components/common/Toggle";
import Tabs from "../../components/common/Tabs";
import { SkeletonCard } from "../../components/common/Skeleton";
import { toast } from "react-hot-toast";

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [backing, setBacking] = useState(false);

  useEffect(() => {
    getSettings()
      .then((r) => setSettings(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setSettings((s) => ({ ...s, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try { await updateSettings(settings); toast.success("Settings saved! ✅"); }
    catch { toast.error("Failed"); }
    finally { setSaving(false); }
  };

  const handleMaintenance = async (val) => {
    try {
      await toggleMaintenance({ isEnabled: val, message: "Platform under maintenance. Back soon!" });
      setSettings((s) => ({ ...s, maintenance: { ...s?.maintenance, isEnabled: val } }));
      toast.success(`Maintenance mode ${val ? "enabled" : "disabled"}`);
    } catch { toast.error("Failed"); }
  };

  const handleBackup = async () => {
    setBacking(true);
    try { await backupNow(); toast.success("Backup initiated! 💾"); }
    catch { toast.error("Backup failed"); }
    finally { setBacking(false); }
  };

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>;

  return (
    <div className="space-y-5 fi max-w-2xl">
      <h1 className="dsp text-xl font-bold text-text">Platform Settings</h1>

      <Tabs
        tabs={[
          { key: "general", label: "General", icon: "⚙️" },
          { key: "maintenance", label: "Maintenance", icon: "🔧" },
          { key: "backup", label: "Backup", icon: "💾" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "general" && (
        <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
          <h2 className="dsp text-sm font-bold text-text">General Settings</h2>
          <Input
            label="Platform Name"
            value={settings?.platformName || "Devad Tech Academy"}
            onChange={(e) => set("platformName", e.target.value)}
          />
          <Input
            label="Support Email"
            type="email"
            value={settings?.supportEmail || ""}
            onChange={(e) => set("supportEmail", e.target.value)}
            placeholder="support@devadacademy.com"
          />
          <Input
            label="Contact Phone"
            type="tel"
            value={settings?.contactPhone || ""}
            onChange={(e) => set("contactPhone", e.target.value)}
            placeholder="+234..."
          />
          <Input
            label="Platform URL"
            value={settings?.platformUrl || ""}
            onChange={(e) => set("platformUrl", e.target.value)}
            placeholder="https://devadacademy.com"
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-purple hover:bg-purple/90 text-white font-semibold py-3 rounded-xl text-sm transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      )}

      {tab === "maintenance" && (
        <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
          <h2 className="dsp text-sm font-bold text-text">Maintenance Mode</h2>
          <p className="text-xs text-muted">
            When enabled, only super admins can access the platform. All other users will see a maintenance message.
          </p>
          <div className={`p-4 rounded-2xl border ${settings?.maintenance?.isEnabled ? "bg-red/10 border-red/20" : "bg-surfaceHigh border-border"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text">Maintenance Mode</p>
                <p className="text-xs text-muted mt-0.5">
                  {settings?.maintenance?.isEnabled ? "🔴 Currently enabled" : "🟢 Platform is live"}
                </p>
              </div>
              <Toggle
                checked={settings?.maintenance?.isEnabled || false}
                onChange={handleMaintenance}
              />
            </div>
            {settings?.maintenance?.isEnabled && (
              <p className="text-xs text-red mt-3">⚠️ Users cannot access the platform right now.</p>
            )}
          </div>
        </div>
      )}

      {tab === "backup" && (
        <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
          <h2 className="dsp text-sm font-bold text-text">Database Backup</h2>
          <p className="text-xs text-muted">
            Create a manual backup of all platform data. Backups run automatically every day at 2:00 AM.
          </p>
          <div className="bg-surfaceHigh border border-border rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted">Last Backup</span>
              <span className="text-text">Automatic daily</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted">Storage</span>
              <span className="text-text">MongoDB Atlas</span>
            </div>
          </div>
          <button
            onClick={handleBackup}
            disabled={backing}
            className="w-full bg-green/10 text-green border border-green/20 font-semibold py-3 rounded-xl text-sm hover:bg-green/20 transition disabled:opacity-50"
          >
            {backing ? "Backing up..." : "💾 Backup Now"}
          </button>
        </div>
      )}
    </div>
  );
}
