import api from "../../api/Api";

export const getIntegrations = () =>
  api.get("/superadmin/integrations");

export const updateIntegration = (name, payload) =>
  api.put(`/superadmin/integrations/${name}`, payload);

export const getAPIKeys = () =>
  api.get("/superadmin/integrations/api-keys");

export const createAPIKey = (payload) =>
  api.post("/superadmin/integrations/api-keys", payload);

export const deleteAPIKey = (id) =>
  api.delete(`/superadmin/integrations/api-keys/${id}`);

export const getWebhooks = () =>
  api.get("/superadmin/integrations/webhooks");

export const createWebhook = (payload) =>
  api.post("/superadmin/integrations/webhooks", payload);