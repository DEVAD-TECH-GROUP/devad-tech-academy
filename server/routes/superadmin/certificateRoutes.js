import express from "express";
import {
  getAllCertificates, issueCertificate, getCertificateTemplates,
  createCertificateTemplate, updateCertificateTemplate,
  verifyCertificate, getCertificateLogs,
} from "../../controllers/superadmin/certificateController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isSuperAdmin from "../../middlewares/auth/isSuperAdmin.js";

const router = express.Router();
router.use(authenticate, isSuperAdmin);

router.get("/", getAllCertificates);
router.post("/issue", issueCertificate);
router.get("/templates", getCertificateTemplates);
router.post("/templates", createCertificateTemplate);
router.put("/templates/:id", updateCertificateTemplate);
router.get("/logs", getCertificateLogs);
router.get("/verify/:certId", verifyCertificate);

export default router;