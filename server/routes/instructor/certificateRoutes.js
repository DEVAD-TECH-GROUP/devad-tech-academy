import express from "express";
import {
  getMyCertificates, issueCertificate, getPendingCertificates,
} from "../../controllers/instructor/certificateController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isInstructor from "../../middlewares/auth/isInstructor.js";

const router = express.Router();
router.use(authenticate, isInstructor);

router.get("/", getMyCertificates);
router.post("/issue/:studentId", issueCertificate);
router.get("/pending", getPendingCertificates);

export default router;