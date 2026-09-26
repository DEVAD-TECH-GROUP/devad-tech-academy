import api from "../../api/Api";

export const getSettings = () =>
  api.get("/superadmin/settings");

export const updateSettings = (payload) =>
  api.put("/superadmin/settings", payload);

export const updateBranding = (payload) =>
  api.put("/superadmin/settings/branding", payload);

export const toggleMaintenance = (payload) =>
  api.put("/superadmin/settings/maintenance", payload);

export const backupNow = () =>
  api.post("/superadmin/settings/backup");

export const updateSecuritySettings = (payload) =>
  api.put("/superadmin/settings/security", payload);
