import api from "../../api/Api";

export const getAllDiscussions = (params) =>
  api.get("/superadmin/community/discussions", { params });

export const deleteDiscussion = (id) =>
  api.delete(`/superadmin/community/discussions/${id}`);

export const pinDiscussion = (id) =>
  api.put(`/superadmin/community/discussions/${id}/pin`);

export const getFlaggedContent = () =>
  api.get("/superadmin/community/flagged");

export const removeFlaggedContent = (id) =>
  api.put(`/superadmin/community/flagged/${id}/remove`);

export const getStudyGroups = (params) =>
  api.get("/superadmin/community/groups", { params });

export const getCommunityEvents = () =>
  api.get("/superadmin/community/events");