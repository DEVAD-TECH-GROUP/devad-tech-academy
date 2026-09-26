import api from "../../api/Api";

export const getStudentReport = () =>
  api.get("/superadmin/reports/students");

export const getInstructorReport = () =>
  api.get("/superadmin/reports/instructors");

export const getFinancialReport = () =>
  api.get("/superadmin/reports/financial");

export const getCourseReport = () =>
  api.get("/superadmin/reports/courses");

export const getAttendanceReport = () =>
  api.get("/superadmin/reports/attendance");

export const getCertificateReport = () =>
  api.get("/superadmin/reports/certificates");

export const exportReport = (type, format) =>
  api.post("/superadmin/reports/export", { type, format }, { responseType: "blob" });