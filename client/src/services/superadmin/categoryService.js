import api from "../../api/Api";

export const getCategories = () =>
  api.get("/superadmin/categories");

export const createCategory = (payload) =>
  api.post("/superadmin/categories", payload);

export const updateCategory = (id, payload) =>
  api.put(`/superadmin/categories/${id}`, payload);

export const deleteCategory = (id) =>
  api.delete(`/superadmin/categories/${id}`);