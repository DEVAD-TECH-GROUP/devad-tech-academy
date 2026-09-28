import api from "../../api/Api";

export const getMyCertificates = () =>
  api.get("/instructor/certificates");

export const issueCertificate = (studentId, payload) =>
  api.post(`/instructor/certificates/issue/${studentId}`, payload);

export const getPendingCertificates = () =>
  api.get("/instructor/certificates/pending");