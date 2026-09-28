import api from "../../api/Api";

// Get active categories available to instructors
export const getInstructorCategories = () =>
  api.get("/instructor/categories");