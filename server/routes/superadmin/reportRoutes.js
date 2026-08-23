import express from "express";
import {
  getStudentReport, getInstructorReport, getFinancialReport,
  getCourseReport, getAttendanceReport, getCertificateReport,
  exportReport,
} from "../../controllers/superadmin/reportController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isSuperAdmin from "../../middlewares/auth/isSuperAdmin.js";

const router = express.Router();
router.use(authenticate, isSuperAdmin);

router.get("/students", getStudentReport);
router.get("/instructors", getInstructorReport);
router.get("/financial", getFinancialReport);
router.get("/courses", getCourseReport);
router.get("/attendance", getAttendanceReport);
router.get("/certificates", getCertificateReport);
router.post("/export", exportReport);

export default router;