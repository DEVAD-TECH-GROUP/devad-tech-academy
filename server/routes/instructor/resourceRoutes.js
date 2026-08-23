import express from "express";
import {
  getLessonResources, addResource, deleteResource,
} from "../../controllers/instructor/resourceController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isInstructor from "../../middlewares/auth/isInstructor.js";

const router = express.Router();
router.use(authenticate, isInstructor);

router.get("/:lessonId", getLessonResources);
router.post("/", addResource);
router.delete("/:id", deleteResource);

export default router;