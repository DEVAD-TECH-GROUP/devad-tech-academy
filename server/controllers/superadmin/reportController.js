import User from "../../models/user/User.js";
import Course from "../../models/course/Course.js";
import Enrollment from "../../models/learning/Enrollment.js";
import Payment from "../../models/payment/Payment.js";
import Attendance from "../../models/live/Attendance.js";
import Certificate from "../../models/certificate/Certificate.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import { generateStudentReport } from "../../services/report/pdfGenerator.js";
import { generateStudentExcel } from "../../services/report/excelGenerator.js";
import { generateStudentCSV } from "../../services/report/csvGenerator.js";

export const getStudentReport = asyncHandler(async (req, res) => {
  const students = await User.find({ role: "student" })
    .select("firstName lastName email status createdAt lastLogin");

  sendResponse(res, 200, "Student report retrieved", {
    total: students.length,
    students,
  });
});

export const getInstructorReport = asyncHandler(async (req, res) => {
  const instructors = await User.find({ role: "instructor" })
    .select("firstName lastName email status createdAt");

  sendResponse(res, 200, "Instructor report retrieved", {
    total: instructors.length,
    instructors,
  });
});

export const getFinancialReport = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ status: "success" });
  sendResponse(res, 200, "Financial report retrieved", payments);
});

export const getCourseReport = asyncHandler(async (req, res) => {
  const courses = await Course.find()
    .populate("instructor", "firstName lastName")
    .populate("category", "name");

  sendResponse(res, 200, "Course report retrieved", courses);
});

export const getAttendanceReport = asyncHandler(async (req, res) => {
  const attendance = await Attendance.find()
    .populate("liveClass", "title")
    .populate("student", "firstName lastName");

  sendResponse(res, 200, "Attendance report retrieved", attendance);
});

export const getCertificateReport = asyncHandler(async (req, res) => {
  const certificates = await Certificate.find()
    .populate("student", "firstName lastName")
    .populate("course", "title");

  sendResponse(res, 200, "Certificate report retrieved", certificates);
});

export const exportReport = asyncHandler(async (req, res) => {
  const { type, format = "pdf" } = req.query;

  const students = await User.find({ role: "student" });
  const data = {
    total: students.length,
    students: students.map((s) => ({
      fullName: s.firstName + " " + s.lastName,
      email: s.email,
      role: s.role,
      status: s.status,
      totalCoursesEnrolled: 0,
      createdAt: s.createdAt,
      lastLogin: s.lastLogin,
    })),
  };

  if (format === "excel") {
    const buffer = await generateStudentExcel(data);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=${type}-report.xlsx`);
    return res.send(buffer);
  }

  if (format === "csv") {
    const csv = generateStudentCSV(data);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=${type}-report.csv`);
    return res.send(csv);
  }

  const pdf = await generateStudentReport(data);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${type}-report.pdf`);
  res.send(pdf);
});