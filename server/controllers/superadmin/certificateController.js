import Certificate from "../../models/certificate/Certificate.js";
import CertificateTemplate from "../../models/certificate/CertificateTemplate.js";
import Enrollment from "../../models/learning/Enrollment.js";
import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import { generateCertificate } from "../../services/certificate/certificateGenerator.js";
import { generateCertificateId } from "../../utils/generateCode.js";
import { formatDate } from "../../utils/dateHelpers.js";

export const getAllCertificates = asyncHandler(async (req, res) => {
  const result = await paginate(Certificate, {}, {
    page: req.query.page,
    limit: req.query.limit,
    populate: "student course",
  });
  sendResponse(res, 200, "Certificates retrieved", result);
});

export const issueCertificate = asyncHandler(async (req, res) => {
  const { studentId, courseId, templateId, grade } = req.body;

  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
  });

  if (!enrollment) {
    return sendResponse(res, 404, "Enrollment not found");
  }

  const template = await CertificateTemplate.findById(templateId);
  if (!template) return sendResponse(res, 404, "Template not found");

  const certId = generateCertificateId("DEVAD");

  const file = await generateCertificate({
    studentName: req.body.studentName,
    courseName: req.body.courseName,
    instructorName: req.body.instructorName,
    certificateId: certId,
    completionDate: formatDate(new Date()),
    grade,
  });

  const certificate = await Certificate.create({
    student: studentId,
    course: courseId,
    enrollment: enrollment._id,
    template: templateId,
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

  sendResponse(res, 201, "Certificate issued", certificate);
});

export const getCertificateTemplates = asyncHandler(async (req, res) => {
  const templates = await CertificateTemplate.find({ isActive: true });
  sendResponse(res, 200, "Templates retrieved", templates);
});

export const createCertificateTemplate = asyncHandler(async (req, res) => {
  const template = await CertificateTemplate.create({
    ...req.body,
    createdBy: req.user._id,
  });
  sendResponse(res, 201, "Template created", template);
});

export const updateCertificateTemplate = asyncHandler(async (req, res) => {
  const template = await CertificateTemplate.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!template) return sendResponse(res, 404, "Template not found");
  sendResponse(res, 200, "Template updated", template);
});

export const verifyCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findOne({
    certificateId: req.params.certId,
  })
    .populate("student", "firstName lastName")
    .populate("course", "title");

  if (!certificate) {
    return sendResponse(res, 404, "Certificate not found or invalid");
  }

  sendResponse(res, 200, "Certificate verified", {
    isValid: certificate.status === "issued",
    certificate,
  });
});

export const getCertificateLogs = asyncHandler(async (req, res) => {
  const logs = await Certificate.find()
    .populate("student", "firstName lastName")
    .populate("course", "title")
    .sort({ issuedAt: -1 })
    .limit(50);

  sendResponse(res, 200, "Certificate logs retrieved", logs);
});