import api from "../../api/Api";

export const getAIConfig = () =>
  api.get("/superadmin/ai/config");

export const updateAIConfig = (payload) =>
  api.put("/superadmin/ai/config", payload);

export const getAIUsage = (params) =>
  api.get("/superadmin/ai/usage", { params });

export const getAITemplates = () =>
  api.get("/superadmin/ai/templates");

export const createAITemplate = (payload) =>
  api.post("/superadmin/ai/templates", payload);

export const updateAITemplate = (id, payload) =>
  api.put(`/superadmin/ai/templates/${id}`, payload);