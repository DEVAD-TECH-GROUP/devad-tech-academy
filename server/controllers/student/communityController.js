import StudyGroup from "../../models/community/StudyGroup.js";
import Event from "../../models/community/Event.js";
import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

export const getStudyGroups = asyncHandler(async (req, res) => {
  const result = await paginate(StudyGroup, { isActive: true }, {
    page: req.query.page,
    limit: req.query.limit,
    sort: { lastActivityAt: -1 },
  });
  sendResponse(res, 200, "Study groups retrieved", result);
});

export const joinStudyGroup = asyncHandler(async (req, res) => {
  const group = await StudyGroup.findById(req.params.id);
  if (!group) return sendResponse(res, 404, "Group not found");

  const isMember = group.members.some(
    (m) => m.user.toString() === req.user._id.toString()
  );

  if (isMember) return sendResponse(res, 400, "Already a member");

  if (group.totalMembers >= group.maxMembers) {
    return sendResponse(res, 400, "Group is full");
  }

  await StudyGroup.findByIdAndUpdate(req.params.id, {
    $push: { members: { user: req.user._id, role: "member" } },
    $inc: { totalMembers: 1 },
  });

  sendResponse(res, 200, "Joined study group");
});

export const getEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({
    startDate: { $gte: new Date() },
    status: { $in: ["upcoming", "ongoing"] },
  })
    .sort({ startDate: 1 })
    .populate("createdBy", "firstName lastName");

  sendResponse(res, 200, "Events retrieved", events);
});

export const rsvpEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return sendResponse(res, 404, "Event not found");

  const hasRSVP = event.attendees.some(
    (a) => a.user.toString() === req.user._id.toString()
  );

  if (hasRSVP) return sendResponse(res, 400, "Already RSVPd");

  await Event.findByIdAndUpdate(req.params.id, {
    $push: { attendees: { user: req.user._id } },
    $inc: { totalAttendees: 1 },
  });

  sendResponse(res, 200, "RSVP successful");
});