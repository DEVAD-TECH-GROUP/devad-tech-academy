import express from "express";
import {
  getConversations, getMessages, sendMessage,
} from "../../controllers/student/messageController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isStudent from "../../middlewares/auth/isStudent.js";

const router = express.Router();
router.use(authenticate, isStudent);

router.get("/", getConversations);
router.get("/:conversationId", getMessages);
router.post("/send", sendMessage);

export default router;