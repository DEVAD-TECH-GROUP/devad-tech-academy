import api from "../../api/Api";

export const getMyCertificates = () =>
  api.get("/student/certificates");

export const getCertificate = (id) =>
  api.get(`/student/certificates/${id}`);

export const downloadCertificate = (id) =>
  api.get(`/student/certificates/${id}/download`);

export const verifyCertificate = (id) =>
  api.get(`/student/certificates/${id}/verify`);

export const shareCertificate = (id) =>
  api.post(`/student/certificates/${id}/share`);