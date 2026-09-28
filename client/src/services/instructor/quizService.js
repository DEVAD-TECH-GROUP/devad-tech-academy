import api from "../../api/Api";

export const getMyQuizzes = (params) =>
  api.get("/instructor/quizzes", { params });

export const createQuiz = (payload) =>
  api.post("/instructor/quizzes", payload);

export const getQuiz = (id) =>
  api.get(`/instructor/quizzes/${id}`);

export const updateQuiz = (id, payload) =>
  api.put(`/instructor/quizzes/${id}`, payload);

export const deleteQuiz = (id) =>
  api.delete(`/instructor/quizzes/${id}`);

export const addQuestion = (id, payload) =>
  api.post(`/instructor/quizzes/${id}/questions`, payload);

export const updateQuestion = (id, qId, payload) =>
  api.put(`/instructor/quizzes/${id}/questions/${qId}`, payload);

export const deleteQuestion = (id, qId) =>
  api.delete(`/instructor/quizzes/${id}/questions/${qId}`);

export const getQuizResults = (id) =>
  api.get(`/instructor/quizzes/${id}/results`);
