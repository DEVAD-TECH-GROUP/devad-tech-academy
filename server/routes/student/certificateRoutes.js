import express from "express";
import {
  getMyCertificates, getCertificate, downloadCertificate,
  verifyCertificate, shareCertificate,
} from "../../controllers/student/certificateController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isStudent from "../../middlewares/auth/isStudent.js";

const router = express.Router();
router.use(authenticate, isStudent);

router.get("/", getMyCertificates);
router.get("/:id", getCertificate);
router.get("/:id/download", downloadCertificate);
router.get("/:id/verify", verifyCertificate);
router.post("/:id/share", shareCertificate);

export default router;