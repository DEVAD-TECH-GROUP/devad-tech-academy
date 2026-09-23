import api from "../../api/Api";

export const browseCourses = (params) =>
  api.get("/student/courses", { params });

export const getEnrolledCourses = () =>
  api.get("/student/courses/enrolled");

export const getCompletedCourses = () =>
  api.get("/student/courses/completed");

export const getWishlist = () =>
  api.get("/student/courses/wishlist");

export const getCourse = (id) =>
  api.get(`/student/courses/${id}`);

export const enrollCourse = (id) =>
  api.post(`/student/courses/${id}/enroll`);

export const addToWishlist = (id) =>
  api.post(`/student/courses/${id}/wishlist`);

export const removeFromWishlist = (id) =>
  api.delete(`/student/courses/${id}/wishlist`);