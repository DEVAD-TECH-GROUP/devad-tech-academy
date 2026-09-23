import api from "../../api/Api";

export const getConversations = () =>
  api.get("/student/messages");

export const getMessages = (conversationId) =>
  api.get(`/student/messages/${conversationId}`);

export const sendMessage = (recipientId, content) =>
  api.post("/student/messages/send", { recipientId, content });