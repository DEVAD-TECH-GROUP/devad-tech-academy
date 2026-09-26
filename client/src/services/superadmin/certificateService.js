import api from "../../api/Api";

export const getAllCertificates = (params) =>
  api.get("/superadmin/certificates", { params });

export const issueCertificate = (payload) =>
  api.post("/superadmin/certificates/issue", payload);

export const getCertificateTemplates = () =>
  api.get("/superadmin/certificates/templates");

export const createCertificateTemplate = (payload) =>
  api.post("/superadmin/certificates/templates", payload);

export const updateCertificateTemplate = (id, payload) =>
  api.put(`/superadmin/certificates/templates/${id}`, payload);

export const verifyCertificate = (certId) =>
  api.get(`/superadmin/certificates/verify/${certId}`);

export const getCertificateLogs = () =>
  api.get("/superadmin/certificates/logs");