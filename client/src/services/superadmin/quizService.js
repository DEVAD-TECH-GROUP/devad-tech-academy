import api from "../../api/Api";

export const getAllQuizzes = (params) =>
  api.get("/superadmin/quizzes", { params });

export const getQuiz = (id) =>
  api.get(`/superadmin/quizzes/${id}`);

export const getQuizResults = () =>
  api.get("/superadmin/quizzes/results");

export const getIntegrityFlags = () =>
  api.get("/superadmin/quizzes/integrity-flags");

export const flagAttempt = (id, reason) =>
  api.post(`/superadmin/quizzes/${id}/flag`, { reason });

export const getQuestionBank = (params) =>
  api.get("/superadmin/quizzes/question-bank", { params });