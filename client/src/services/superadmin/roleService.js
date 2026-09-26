import api from "../../api/Api";

export const getRoles = () =>
  api.get("/superadmin/roles");

export const createRole = (payload) =>
  api.post("/superadmin/roles", payload);

export const updateRole = (id, payload) =>
  api.put(`/superadmin/roles/${id}`, payload);

export const deleteRole = (id) =>
  api.delete(`/superadmin/roles/${id}`);

export const getPermissions = () =>
  api.get("/superadmin/roles/permissions");