import Certificate from "../../models/certificate/Certificate.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

export const getMyCertificates = asyncHandler(async (req, res) => {
  const certificates = await Certificate.find({
    student: req.user._id,
    status: "issued",
  })
    .populate("course", "title thumbnail")
    .populate("template")
    .sort({ issuedAt: -1 });

  sendResponse(res, 200, "Certificates retrieved", certificates);
});

export const getCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findOne({
    _id: req.params.id,
    student: req.user._id,
  })
    .populate("course", "title")
    .populate("template");

  if (!certificate) return sendResponse(res, 404, "Certificate not found");
  sendResponse(res, 200, "Certificate retrieved", certificate);
});

export const downloadCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findOne({
    _id: req.params.id,
    student: req.user._id,
  });

  if (!certificate) return sendResponse(res, 404, "Certificate not found");

  await Certificate.findByIdAndUpdate(req.params.id, {
    $inc: { totalDownloads: 1 },
  });

  sendResponse(res, 200, "Download URL retrieved", {
    url: certificate.file.url,
  });
});

export const verifyCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findOne({
    certificateId: req.params.id,
    status: "issued",
  })
    .populate("student", "firstName lastName")
    .populate("course", "title");

  if (!certificate) {
    return sendResponse(res, 404, "Certificate not found or invalid");
  }

  sendResponse(res, 200, "Certificate verified", {
    isValid: true,
    certificate,
  });
});

export const shareCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findOneAndUpdate(
    { _id: req.params.id, student: req.user._id },
    { $inc: { totalShares: 1 } },
    { new: true }
  );

  if (!certificate) return sendResponse(res, 404, "Certificate not found");

  sendResponse(res, 200, "Certificate shared", {
    shareUrl: `${process.env.CLIENT_URL}/verify/${certificate.certificateId}`,
    linkedInUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${process.env.CLIENT_URL}/verify/${certificate.certificateId}`,
  });
});