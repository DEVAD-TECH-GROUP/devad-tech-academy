import api from "../../api/Api";

export const getAllTickets = (params) =>
  api.get("/superadmin/support/tickets", { params });

export const getTicket = (id) =>
  api.get(`/superadmin/support/tickets/${id}`);

export const respondToTicket = (id, message) =>
  api.put(`/superadmin/support/tickets/${id}/respond`, { message });

export const closeTicket = (id) =>
  api.put(`/superadmin/support/tickets/${id}/close`);

export const getKnowledgeBase = () =>
  api.get("/superadmin/support/knowledge-base");

export const createKBArticle = (payload) =>
  api.post("/superadmin/support/knowledge-base", payload);

export const updateKBArticle = (id, payload) =>
  api.put(`/superadmin/support/knowledge-base/${id}`, payload);