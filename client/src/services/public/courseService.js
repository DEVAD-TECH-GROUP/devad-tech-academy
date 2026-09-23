import api from "../../api/Api";

// Get all public courses
export const getCourses = (params = {}) =>
  api.get("/courses", { params });

// Get a single public course
export const getCourse = (id) =>
  api.get(`/courses/${id}`);
