import api from "../../api/Api";

export const getConversations = () =>
  api.get("/instructor/messages");

export const getMessages = (conversationId) =>
  api.get(`/instructor/messages/${conversationId}`);

export const sendMessage = (recipientId, content) =>
  api.post("/instructor/messages/send", { recipientId, content });

export const deleteMessage = (id) =>
  api.delete(`/instructor/messages/${id}`);