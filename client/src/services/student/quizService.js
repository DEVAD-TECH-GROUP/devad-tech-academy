import api from "../../api/Api";

export const getMyQuizzes = () =>
  api.get("/student/quizzes");

export const getQuiz = (id) =>
  api.get(`/student/quizzes/${id}`);

export const startQuiz = (id) =>
  api.post(`/student/quizzes/${id}/start`);

export const submitQuiz = (id, payload) =>
  api.post(`/student/quizzes/${id}/submit`, payload);

export const getQuizResults = (id) =>
  api.get(`/student/quizzes/${id}/results`);

export const reviewQuiz = (id) =>
  api.get(`/student/quizzes/${id}/review`);
