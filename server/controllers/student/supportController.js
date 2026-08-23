import SupportTicket from "../../models/support/SupportTicket.js";
import FAQ from "../../models/content/FAQ.js";
import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import { generateTicketId } from "../../utils/generateCode.js";

export const getMyTickets = asyncHandler(async (req, res) => {
  const result = await paginate(
    SupportTicket,
    { user: req.user._id },
    { page: req.query.page, limit: req.query.limit, sort: { createdAt: -1 } }
  );
  sendResponse(res, 200, "Tickets retrieved", result);
});

export const createTicket = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.create({
    ...req.body,
    user: req.user._id,
    ticketId: generateTicketId(),
  });
  sendResponse(res, 201, "Ticket created", ticket);
});

export const getTicket = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!ticket) return sendResponse(res, 404, "Ticket not found");
  sendResponse(res, 200, "Ticket retrieved", ticket);
});

export const getFAQs = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const query = { isActive: true };
  if (category) query.category = category;

  const faqs = await FAQ.find(query).sort({ order: 1 });
  sendResponse(res, 200, "FAQs retrieved", faqs);
});