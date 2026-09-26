import api from "../../api/Api";

export const getBlogPosts = (params) =>
  api.get("/superadmin/content/blog", { params });

export const createBlogPost = (payload) =>
  api.post("/superadmin/content/blog", payload);

export const updateBlogPost = (id, payload) =>
  api.put(`/superadmin/content/blog/${id}`, payload);

export const deleteBlogPost = (id) =>
  api.delete(`/superadmin/content/blog/${id}`);

export const getBanners = () =>
  api.get("/superadmin/content/banners");

export const createBanner = (payload) =>
  api.post("/superadmin/content/banners", payload);

export const updateBanner = (id, payload) =>
  api.put(`/superadmin/content/banners/${id}`, payload);

export const getFAQs = () =>
  api.get("/superadmin/content/faqs");

export const createFAQ = (payload) =>
  api.post("/superadmin/content/faqs", payload);

export const updateFAQ = (id, payload) =>
  api.put(`/superadmin/content/faqs/${id}`, payload);

export const deleteFAQ = (id) =>
  api.delete(`/superadmin/content/faqs/${id}`);

export const getTestimonials = () =>
  api.get("/superadmin/content/testimonials");

export const createTestimonial = (payload) =>
  api.post("/superadmin/content/testimonials", payload);