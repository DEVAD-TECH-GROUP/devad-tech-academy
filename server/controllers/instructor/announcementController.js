import Announcement from "../../models/communication/Announcement.js";
import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import { notifyCourseStudents } from "../../services/notification/inAppService.js";
import { NOTIFICATION_TYPES } from "../../utils/constants.js";

export const getMyAnnouncements = asyncHandler(async (req, res) => {
  const result = await paginate(
    Announcement,
    { createdBy: req.user._id },
    {
      page: req.query.page,
      limit: req.query.limit,
      sort: { createdAt: -1 },
    }
  );
  sendResponse(res, 200, "Announcements retrieved", result);
});

export const createAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.create({
    ...req.body,
    createdBy: req.user._id,
    publishedAt: new Date(),
    status: "published",
  });

  if (req.body.course) {
    await notifyCourseStudents({
      courseId: req.body.course,
      senderId: req.user._id,
      type: NOTIFICATION_TYPES.ANNOUNCEMENT,
      title: req.body.title,
      message: req.body.message.slice(0, 100),
      actionUrl: `/courses/${req.body.course}`,
    });
  }

  sendResponse(res, 201, "Announcement created", announcement);
});

export const updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findOneAndUpdate(
    { _id: req.params.id, createdBy: req.user._id },
    req.body,
    { new: true }
  );

  if (!announcement) return sendResponse(res, 404, "Announcement not found");
  sendResponse(res, 200, "Announcement updated", announcement);
});

export const deleteAnnouncement = asyncHandler(async (req, res) => {
  await Announcement.findOneAndDelete({
    _id: req.params.id,
    createdBy: req.user._id,
  });
  sendResponse(res, 200, "Announcement deleted");
});