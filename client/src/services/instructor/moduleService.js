import api from "../../api/Api";

export const getModules = (courseId) =>
  api.get(`/instructor/modules/${courseId}/modules`);

export const createModule = (courseId, payload) =>
  api.post(`/instructor/modules/${courseId}/modules`, payload);

export const updateModule = (courseId, id, payload) =>
  api.put(`/instructor/modules/${courseId}/modules/${id}`, payload);

export const deleteModule = (courseId, id) =>
  api.delete(`/instructor/modules/${courseId}/modules/${id}`);

export const reorderModules = (courseId, modules) =>
  api.put(`/instructor/modules/${courseId}/modules/reorder`, { modules });