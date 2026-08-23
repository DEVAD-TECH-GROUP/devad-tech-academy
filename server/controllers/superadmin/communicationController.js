import Announcement from "../../models/communication/Announcement.js";
import User from "../../models/user/User.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import sendEmail from "../../services/email/emailService.js";
import announcementTemplate from "../../templates/email/announcement.js";
import { sendPushToAll } from "../../services/notification/pushService.js";
import { notifyByRole } from "../../services/notification/inAppService.js";
import { NOTIFICATION_TYPES } from "../../utils/constants.js";
import { sendSMS } from "../../services/sms/smsService.js";

export const createAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.create({
    ...req.body,
    createdBy: req.user._id,
    publishedAt: new Date(),
    status: "published",
  });

  if (req.body.sendPushNotification) {
    await sendPushToAll({
      title: req.body.title,
      message: req.body.message.slice(0, 100),
    });
  }

  if (req.body.sendEmail) {
    const users = await User.find({
      status: "active",
      ...(req.body.targetAudience !== "all" && {
        role: req.body.targetAudience,
      }),
    }).select("email");

    for (const user of users.slice(0, 100)) {
      await sendEmail({
        to: user.email,
        subject: `📢 ${req.body.title}`,
        htmlContent: announcementTemplate({
          title: req.body.title,
          message: req.body.message,
        }),
      });
    }
  }

  sendResponse(res, 201, "Announcement created", announcement);
});

export const sendEmailCampaign = asyncHandler(async (req, res) => {
  const { subject, message, targetAudience } = req.body;

  const query = { status: "active" };
  if (targetAudience !== "all") query.role = targetAudience;

  const users = await User.find(query).select("email firstName");

  for (const user of users.slice(0, 50)) {
    await sendEmail({
      to: user.email,
      subject,
      htmlContent: announcementTemplate({ title: subject, message }),
    });
  }

  sendResponse(res, 200, `Email campaign sent to ${users.length} users`);
});

export const sendSMSBlast = asyncHandler(async (req, res) => {
  const { message, targetAudience } = req.body;

  const query = { status: "active" };
  if (targetAudience !== "all") query.role = targetAudience;

  const users = await User.find(query).select("phone").limit(50);

  for (const user of users) {
    if (user.phone) {
      await sendSMS(user.phone, message);
    }
  }

  sendResponse(res, 200, "SMS blast sent");
});

export const sendPushNotification = asyncHandler(async (req, res) => {
  const { title, message, segment = "All" } = req.body;

  await sendPushToAll({ title, message });
  sendResponse(res, 200, "Push notification sent");
});

export const broadcast = asyncHandler(async (req, res) => {
  const { title, message, channels, targetAudience } = req.body;

  if (channels.includes("email")) {
    const users = await User.find({ status: "active" }).select("email").limit(100);
    for (const user of users) {
      await sendEmail({
        to: user.email,
        subject: title,
        htmlContent: announcementTemplate({ title, message }),
      });
    }
  }

  if (channels.includes("push")) {
    await sendPushToAll({ title, message });
  }

  if (channels.includes("inapp")) {
    await notifyByRole({
      role: targetAudience === "students" ? "student" : "instructor",
      senderId: req.user._id,
      type: NOTIFICATION_TYPES.ANNOUNCEMENT,
      title,
      message,
    });
  }

  sendResponse(res, 200, "Broadcast sent successfully");
});