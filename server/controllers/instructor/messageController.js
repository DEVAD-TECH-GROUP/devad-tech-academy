import Conversation from "../../models/communication/Conversation.js";
import Message from "../../models/communication/Message.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

export const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
    isActive: true,
  })
    .populate("participants", "firstName lastName avatar role")
    .populate("lastMessage")
    .sort({ lastMessageAt: -1 });

  sendResponse(res, 200, "Conversations retrieved", conversations);
});

export const getMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({
    conversation: req.params.conversationId,
    isDeleted: false,
  })
    .populate("sender", "firstName lastName avatar")
    .sort({ createdAt: 1 });

  sendResponse(res, 200, "Messages retrieved", messages);
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { recipientId, content } = req.body;

  let conversation = await Conversation.findOne({
    participants: { $all: [req.user._id, recipientId] },
    type: "direct",
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [req.user._id, recipientId],
      type: "direct",
    });
  }

  const message = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    content,
    readBy: [{ user: req.user._id }],
  });

  await Conversation.findByIdAndUpdate(conversation._id, {
    lastMessage: message._id,
    lastMessageAt: new Date(),
    lastMessageText: content?.slice(0, 50),
  });

  const io = req.app.get("io");
  io.to(`user_${recipientId}`).emit("new_message", message);

  sendResponse(res, 201, "Message sent", message);
});

export const deleteMessage = asyncHandler(async (req, res) => {
  await Message.findOneAndUpdate(
    { _id: req.params.id, sender: req.user._id },
    { isDeleted: true, deletedAt: new Date(), deletedBy: req.user._id, content: null }
  );
  sendResponse(res, 200, "Message deleted");
});