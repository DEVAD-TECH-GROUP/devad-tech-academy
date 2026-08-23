import Certificate from "../../models/certificate/Certificate.js";
import CertificateTemplate from "../../models/certificate/CertificateTemplate.js";
import Enrollment from "../../models/learning/Enrollment.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import { generateCertificate } from "../../services/certificate/certificateGenerator.js";
import { generateCertificateId } from "../../utils/generateCode.js";
import { formatDate } from "../../utils/dateHelpers.js";
import { createNotification } from "../../services/notification/inAppService.js";
import { NOTIFICATION_TYPES } from "../../utils/constants.js";

export const getMyCertificates = asyncHandler(async (req, res) => {
  const certificates = await Certificate.find({ issuedBy: req.user._id })
    .populate("student", "firstName lastName")
    .populate("course", "title")
    .sort({ issuedAt: -1 });

  sendResponse(res, 200, "Certificates retrieved", certificates);
});

export const issueCertificate = asyncHandler(async (req, res) => {
  const { studentId, courseId, grade } = req.body;

  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
  });

  if (!enrollment) return sendResponse(res, 404, "Enrollment not found");

  const template = await CertificateTemplate.findOne({ isDefault: true });
  if (!template) return sendResponse(res, 404, "No default template found");

  const certId = generateCertificateId("DEVAD");

  const file = await generateCertificate({
    studentName: req.body.studentName,
    courseName: req.body.courseName,
    instructorName: `${req.user.firstName} ${req.user.lastName}`,
    certificateId: certId,
    completionDate: formatDate(new Date()),
    grade,
  });

  const certificate = await Certificate.create({
    student: studentId,
    course: courseId,
    enrollment: enrollment._id,
    template: template._id,
    issuedBy: req.user._id,
    certificateId: certId,
    file,
    grade,
    completionDate: new Date(),
    verificationUrl: `${process.env.CLIENT_URL}/verify/${certId}`,
  });

  enrollment.certificateIssued = true;
  enrollment.certificate = certificate._id;
  await enrollment.save();

  await createNotification({
    recipientId: studentId,
    senderId: req.user._id,
    type: NOTIFICATION_TYPES.CERTIFICATE,
    title: "Certificate Issued! 🏅",
    message: `Your certificate for "${req.body.courseName}" is ready!`,
    actionUrl: `/certificates/${certificate._id}`,
  });

  sendResponse(res, 201, "Certificate issued", certificate);
});

export const getPendingCertificates = asyncHandler(async (req, res) => {
  const completedEnrollments = await Enrollment.find({
    course: { $in: await import("../../models/course/Course.js").then((m) => m.default.find({ instructor: req.user._id }).distinct("_id")) },
    isCompleted: true,
    certificateIssued: false,
  })
    .populate("student", "firstName lastName email")
    .populate("course", "title");

  sendResponse(res, 200, "Pending certificates retrieved", completedEnrollments);
});