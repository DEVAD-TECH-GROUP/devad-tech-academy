import express from "express";
import {
  getDiscussions, createDiscussion, getDiscussion,
  replyToDiscussion, likeDiscussion, reportDiscussion,
} from "../../controllers/student/discussionController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isStudent from "../../middlewares/auth/isStudent.js";

const router = express.Router();
router.use(authenticate, isStudent);

router.get("/", getDiscussions);
router.post("/", createDiscussion);
router.get("/:id", getDiscussion);
router.post("/:id/reply", replyToDiscussion);
router.put("/:id/like", likeDiscussion);
router.post("/:id/report", reportDiscussion);

export default router;