import express from "express";
import {
  getLessons, createLesson, updateLesson,
  deleteLesson, uploadVideo, uploadResource,
} from "../../controllers/instructor/lessonController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isInstructor from "../../middlewares/auth/isInstructor.js";
import videoUpload from "../../middlewares/upload/videoUpload.js";
import documentUpload from "../../middlewares/upload/documentUpload.js";

const router = express.Router();
router.use(authenticate, isInstructor);

router.get("/:moduleId/lessons", getLessons);
router.post("/:moduleId/lessons", createLesson);
router.put("/:moduleId/lessons/:id", updateLesson);
router.delete("/:moduleId/lessons/:id", deleteLesson);
router.post("/:id/upload-video", videoUpload.single("video"), uploadVideo);
router.post("/:id/upload-resource", documentUpload.single("resource"), uploadResource);

export default router;