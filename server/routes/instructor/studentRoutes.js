import express from "express";
import {
  getMyStudents, getStudent, getStudentProgress, messageStudent,
} from "../../controllers/instructor/studentController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isInstructor from "../../middlewares/auth/isInstructor.js";

const router = express.Router();
router.use(authenticate, isInstructor);

router.get("/", getMyStudents);
router.get("/:id", getStudent);
router.get("/:id/progress", getStudentProgress);
router.post("/:id/message", messageStudent);

export default router;