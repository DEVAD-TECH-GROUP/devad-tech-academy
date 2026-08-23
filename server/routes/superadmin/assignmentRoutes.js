import express from "express";
import {
  getAllAssignments, getAssignment,
  getAssignmentAnalytics, getLateSubmissions,
} from "../../controllers/superadmin/assignmentController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isSuperAdmin from "../../middlewares/auth/isSuperAdmin.js";

const router = express.Router();
router.use(authenticate, isSuperAdmin);

router.get("/", getAllAssignments);
router.get("/analytics", getAssignmentAnalytics);
router.get("/late-submissions", getLateSubmissions);
router.get("/:id", getAssignment);

export default router;