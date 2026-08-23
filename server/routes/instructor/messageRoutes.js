import express from "express";
import {
  getConversations, getMessages, sendMessage, deleteMessage,
} from "../../controllers/instructor/messageController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isInstructor from "../../middlewares/auth/isInstructor.js";

const router = express.Router();
router.use(authenticate, isInstructor);

router.get("/", getConversations);
router.get("/:conversationId", getMessages);
router.post("/send", sendMessage);
router.delete("/:id", deleteMessage);

export default router;