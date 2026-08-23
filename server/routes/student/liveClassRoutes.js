import express from "express";
import {
  getMyLiveClasses, getLiveClass,
  joinLiveClass, getLiveClassRecording,
} from "../../controllers/student/liveClassController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isStudent from "../../middlewares/auth/isStudent.js";

const router = express.Router();
router.use(authenticate, isStudent);

router.get("/", getMyLiveClasses);
router.get("/:id", getLiveClass);
router.post("/:id/join", joinLiveClass);
router.get("/:id/recording", getLiveClassRecording);

export default router;