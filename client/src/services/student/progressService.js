import api from "../../api/Api";

export const getMyProgress = () =>
  api.get("/student/progress");

export const getCourseProgress = (courseId) =>
  api.get(`/student/progress/${courseId}`);

export const getLearningPathProgress = () =>
  api.get("/student/progress/learning-path");