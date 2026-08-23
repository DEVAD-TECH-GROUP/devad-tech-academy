import SupportTicket from "../../models/support/SupportTicket.js";
import KnowledgeBase from "../../models/support/KnowledgeBase.js";
import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

export const getAllTickets = asyncHandler(async (req, res) => {
  const { page, limit, status, priority } = req.query;

  const query = {};
  if (status) query.status = status;
  if (priority) query.priority = priority;

  const result = await paginate(SupportTicket, query, {
    page, limit,
    populate: "user assignedTo",
    sort: { createdAt: -1 },
  });

  sendResponse(res, 200, "Tickets retrieved", result);
});

export const getTicket = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findById(req.params.id)
    .populate("user", "firstName lastName email")
    .populate("assignedTo", "firstName lastName");

  if (!ticket) return sendResponse(res, 404, "Ticket not found");
  sendResponse(res, 200, "Ticket retrieved", ticket);
});

export const respondToTicket = asyncHandler(async (req, res) => {
  const { message } = req.body;

  const ticket = await SupportTicket.findByIdAndUpdate(
    req.params.id,
    {
      $push: {
        replies: {
          sender: req.user._id,
          message,
          isStaffReply: true,
          createdAt: new Date(),
        },
      },
      status: "in_progress",
    },
    { new: true }
  );

  if (!ticket) return sendResponse(res, 404, "Ticket not found");
  sendResponse(res, 200, "Reply sent", ticket);
});

export const closeTicket = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findByIdAndUpdate(
    req.params.id,
    {
      status: "resolved",
      resolvedBy: req.user._id,
      resolvedAt: new Date(),
    },
    { new: true }
  );

  if (!ticket) return sendResponse(res, 404, "Ticket not found");
  sendResponse(res, 200, "Ticket closed", ticket);
});

export const getKnowledgeBase = asyncHandler(async (req, res) => {
  const articles = await KnowledgeBase.find({ isActive: true })
    .sort({ order: 1 });

  sendResponse(res, 200, "Knowledge base retrieved", articles);
});

export const createKBArticle = asyncHandler(async (req, res) => {
  const article = await KnowledgeBase.create({
    ...req.body,
    createdBy: req.user._id,
  });
  sendResponse(res, 201, "Article created", article);
});

export const updateKBArticle = asyncHandler(async (req, res) => {
  const article = await KnowledgeBase.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  if (!article) return sendResponse(res, 404, "Article not found");
  sendResponse(res, 200, "Article updated", article);
});