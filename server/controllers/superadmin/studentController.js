import User from "../../models/user/User.js";
import Student from "../../models/user/Student.js";
import Enrollment from "../../models/learning/Enrollment.js";
import Certificate from "../../models/certificate/Certificate.js";
import Payment from "../../models/payment/Payment.js";
import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import { generateOTP } from "../../utils/generateCode.js";

// ── Get all students ──────────────────────────────────────
export const getAllStudents = asyncHandler(async (req, res) => {
  const { page, limit, status, search } = req.query;

  const query = { role: "student" };
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const result = await paginate(User, query, { page, limit });
  sendResponse(res, 200, "Students retrieved", result);
});

// ── Get single student ────────────────────────────────────
export const getStudent = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return sendResponse(res, 404, "Student not found");

  const student = await Student.findOne({ user: req.params.id });
  sendResponse(res, 200, "Student retrieved", { user, student });
});

// ── Get student progress ──────────────────────────────────
export const getStudentProgress = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({
    student: req.params.id,
  }).populate("course", "title thumbnail");

  sendResponse(res, 200, "Student progress retrieved", enrollments);
});

// ── Get student enrollments ───────────────────────────────
export const getStudentEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({
    student: req.params.id,
  }).populate("course");

  sendResponse(res, 200, "Student enrollments retrieved", enrollments);
});

// ── Get student certificates ──────────────────────────────
export const getStudentCertificates = asyncHandler(async (req, res) => {
  const certificates = await Certificate.find({
    student: req.params.id,
  }).populate("course", "title");

  sendResponse(res, 200, "Student certificates retrieved", certificates);
});

// ── Get student payments ──────────────────────────────────
export const getStudentPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({
    student: req.params.id,
  }).sort({ createdAt: -1 });

  sendResponse(res, 200, "Student payments retrieved", payments);
});

// ── Reset student password ────────────────────────────────
export const resetStudentPassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return sendResponse(res, 404, "Student not found");

  const tempPassword = generateOTP();
  user.password = tempPassword;
  await user.save();

  sendResponse(res, 200, "Password reset", { tempPassword });
});

// ── Update student status ─────────────────────────────────
export const updateStudentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (!user) return sendResponse(res, 404, "Student not found");
  sendResponse(res, 200, "Student status updated", user);
});