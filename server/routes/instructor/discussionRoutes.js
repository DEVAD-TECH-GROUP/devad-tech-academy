import express from "express";
import {
  getCourseDiscussions, replyToDiscussion,
  pinDiscussion, deleteDiscussion,
} from "../../controllers/instructor/discussionController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isInstructor from "../../middlewares/auth/isInstructor.js";

const router = express.Router();
router.use(authenticate, isInstructor);

router.get("/", getCourseDiscussions);
router.post("/:id/reply", replyToDiscussion);
router.put("/:id/pin", pinDiscussion);
router.delete("/:id", deleteDiscussion);

export default router;