import express from "express";
import {
  getAllInstructors, getInstructorApplications,
  getInstructor, approveInstructor, rejectInstructor,
  getInstructorPerformance, getInstructorEarnings,
  getInstructorActivity,
} from "../../controllers/superadmin/instructorController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isSuperAdmin from "../../middlewares/auth/isSuperAdmin.js";

const router = express.Router();
router.use(authenticate, isSuperAdmin);

router.get("/", getAllInstructors);
router.get("/applications", getInstructorApplications);
router.get("/:id", getInstructor);
router.put("/:id/approve", approveInstructor);
router.put("/:id/reject", rejectInstructor);
router.get("/:id/performance", getInstructorPerformance);
router.get("/:id/earnings", getInstructorEarnings);
router.get("/:id/activity", getInstructorActivity);

export default router;