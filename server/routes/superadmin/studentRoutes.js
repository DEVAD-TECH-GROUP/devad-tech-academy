import express from "express";
import {
  getAllStudents, getStudent, getStudentProgress,
  getStudentEnrollments, getStudentCertificates,
  getStudentPayments, resetStudentPassword, updateStudentStatus,
} from "../../controllers/superadmin/studentController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isSuperAdmin from "../../middlewares/auth/isSuperAdmin.js";

const router = express.Router();
router.use(authenticate, isSuperAdmin);

router.get("/", getAllStudents);
router.get("/:id", getStudent);
router.get("/:id/progress", getStudentProgress);
router.get("/:id/enrollments", getStudentEnrollments);
router.get("/:id/certificates", getStudentCertificates);
router.get("/:id/payments", getStudentPayments);
router.put("/:id/reset-password", resetStudentPassword);
router.put("/:id/status", updateStudentStatus);

export default router;