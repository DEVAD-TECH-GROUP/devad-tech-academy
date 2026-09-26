import api from "../../api/Api";

export const getAllUsers = (params) =>
  api.get("/superadmin/users", { params });

export const getUser = (id) =>
  api.get(`/superadmin/users/${id}`);

export const createUser = (payload) =>
  api.post("/superadmin/users", payload);

export const updateUser = (id, payload) =>
  api.put(`/superadmin/users/${id}`, payload);

export const deleteUser = (id) =>
  api.delete(`/superadmin/users/${id}`);

export const suspendUser = (id) =>
  api.put(`/superadmin/users/${id}/suspend`);

export const activateUser = (id) =>
  api.put(`/superadmin/users/${id}/activate`);

export const changeUserRole = (id, role) =>
  api.put(`/superadmin/users/${id}/role`, { role });

export const exportUsers = () =>
  api.get("/superadmin/users/export");
