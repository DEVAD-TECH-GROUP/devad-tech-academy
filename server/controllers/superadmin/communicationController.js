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

// ============================================================
// DEVAD COMMUNICATION CONTROLLER LOGGER
// ============================================================

const DEBUG = true;

const log = (...args) => {
  if (!DEBUG) return;

  console.log(
    "%c[DEVAD COMMUNICATION CONTROLLER]",
    "color:#8b5cf6;font-weight:bold;",
    ...args
  );
};

const logInfo = (...args) => {
  if (!DEBUG) return;

  console.log(
    "%c[DEVAD COMMUNICATION CONTROLLER INFO]",
    "color:#3b82f6;font-weight:bold;",
    ...args
  );
};

const logSuccess = (...args) => {
  if (!DEBUG) return;

  console.log(
    "%c[DEVAD COMMUNICATION CONTROLLER SUCCESS]",
    "color:#22c55e;font-weight:bold;",
    ...args
  );
};

const logWarn = (...args) => {
  if (!DEBUG) return;

  console.warn(
    "%c[DEVAD COMMUNICATION CONTROLLER WARNING]",
    "color:#f59e0b;font-weight:bold;",
    ...args
  );
};

const logError = (...args) => {
  if (!DEBUG) return;

  console.error(
    "%c[DEVAD COMMUNICATION CONTROLLER ERROR]",
    "color:#ef4444;font-weight:bold;",
    ...args
  );
};

// ============================================================
// SAFE ERROR LOGGER
// ============================================================

const logServiceError = (serviceName, error) => {
  logError(`${serviceName} failed.`);

  logError("Error name:", error?.name);
  logError("Error message:", error?.message);
  logError("Error code:", error?.code);

  if (error?.response) {
    logError(`${serviceName} response status:`, error.response.status);
    logError(
      `${serviceName} response status text:`,
      error.response.statusText
    );

    logError(
      `${serviceName} response data:`,
      error.response.data
    );

    logError(
      `${serviceName} response headers:`,
      error.response.headers
    );
  }

  if (error?.request) {
    logError(
      `${serviceName} request exists:`,
      error.request
    );
  }

  if (error?.stack) {
    logError(`${serviceName} stack:`, error.stack);
  }
};

// ============================================================
// CREATE ANNOUNCEMENT
// ============================================================

export const createAnnouncement = asyncHandler(async (req, res) => {
  const requestStartedAt = Date.now();

  log("============================================================");
  log("CREATE ANNOUNCEMENT STARTED");
  log("============================================================");

  logInfo("Method:", req.method);
  logInfo("URL:", req.originalUrl);
  logInfo("User ID:", req.user?._id);
  logInfo("User role:", req.user?.role);

  logInfo("Request body:", {
    ...req.body,
    message:
      typeof req.body?.message === "string"
        ? `[${req.body.message.length} characters]`
        : req.body?.message,
  });

  // ----------------------------------------------------------
  // VALIDATION
  // ----------------------------------------------------------

  const {
    title,
    message,
    targetAudience = "all",
    sendPushNotification = false,
    sendEmail: shouldSendEmail = false,
  } = req.body;

  logInfo("Parsed announcement values:", {
    title,
    messageLength:
      typeof message === "string" ? message.length : 0,
    targetAudience,
    sendPushNotification,
    sendEmail: shouldSendEmail,
  });

  if (!title || !title.trim()) {
    logWarn("Announcement rejected: title is missing.");

    return sendResponse(
      res,
      400,
      "Announcement title is required"
    );
  }

  if (!message || !message.trim()) {
    logWarn("Announcement rejected: message is missing.");

    return sendResponse(
      res,
      400,
      "Announcement message is required"
    );
  }

  // ----------------------------------------------------------
  // CREATE DATABASE RECORD
  // ----------------------------------------------------------

  log("Creating announcement in MongoDB...");

  let announcement;

  try {
    announcement = await Announcement.create({
      ...req.body,

      createdBy: req.user._id,

      publishedAt: new Date(),

      status: "published",
    });

    logSuccess("Announcement created successfully.");

    logInfo("Announcement ID:", announcement?._id);
  } catch (error) {
    logServiceError(
      "Announcement MongoDB creation",
      error
    );

    throw error;
  }

  // ----------------------------------------------------------
  // PUSH NOTIFICATION
  // ----------------------------------------------------------

  if (sendPushNotification) {
    log("============================================================");
    log("PUSH NOTIFICATION ENABLED");
    log("============================================================");

    const pushPayload = {
      title,
      message: message.slice(0, 100),
    };

    logInfo("Push payload:", pushPayload);

    try {
      log("Calling sendPushToAll()...");

      const pushStartedAt = Date.now();

      const pushResult = await sendPushToAll(pushPayload);

      const pushDuration = Date.now() - pushStartedAt;

      logSuccess("sendPushToAll() completed successfully.");

      logInfo(
        "Push duration:",
        `${pushDuration}ms`
      );

      logInfo("Push result:", pushResult);
    } catch (error) {
      logServiceError(
        "sendPushToAll",
        error
      );

      /*
       * IMPORTANT:
       *
       * We do NOT destroy the whole announcement operation
       * because the announcement itself was already created.
       *
       * The push failure is logged and the announcement remains
       * published.
       */

      logWarn(
        "Push notification failed, but announcement remains created."
      );
    }
  } else {
    logInfo(
      "Push notification disabled for this announcement."
    );
  }

  // ----------------------------------------------------------
  // EMAIL
  // ----------------------------------------------------------

  if (shouldSendEmail) {
    log("============================================================");
    log("EMAIL NOTIFICATION ENABLED");
    log("============================================================");

    const emailQuery = {
      status: "active",

      ...(targetAudience !== "all" && {
        role: targetAudience,
      }),
    };

    logInfo("Email user query:", emailQuery);

    try {
      const users = await User.find(emailQuery)
        .select("email");

      logInfo(
        "Users found for email:",
        users.length
      );

      const usersToEmail = users.slice(0, 100);

      logInfo(
        "Users limited for email:",
        usersToEmail.length
      );

      let emailSuccessCount = 0;
      let emailFailureCount = 0;

      for (const user of usersToEmail) {
        if (!user.email) {
          logWarn(
            "Skipping user without email:",
            user._id
          );

          continue;
        }

        try {
          log(
            "Sending announcement email to:",
            user.email
          );

          await sendEmail({
            to: user.email,

            subject: `📢 ${title}`,

            htmlContent: announcementTemplate({
              title,
              message,
            }),
          });

          emailSuccessCount++;

          logSuccess(
            "Email sent:",
            user.email
          );
        } catch (error) {
          emailFailureCount++;

          logServiceError(
            `Email to ${user.email}`,
            error
          );

          // Continue sending to the remaining users.
        }
      }

      logSuccess("Email campaign processing completed.");

      logInfo("Email success count:", emailSuccessCount);
      logInfo("Email failure count:", emailFailureCount);
    } catch (error) {
      logServiceError(
        "Email user lookup",
        error
      );
    }
  } else {
    logInfo(
      "Email notification disabled for this announcement."
    );
  }

  // ----------------------------------------------------------
  // FINAL RESPONSE
  // ----------------------------------------------------------

  const duration = Date.now() - requestStartedAt;

  log("============================================================");
  logSuccess("CREATE ANNOUNCEMENT COMPLETED");
  log("============================================================");

  logSuccess("Announcement ID:", announcement?._id);
  logSuccess("Duration:", `${duration}ms`);

  return sendResponse(
    res,
    201,
    "Announcement created",
    announcement
  );
});

// ============================================================
// EMAIL CAMPAIGN
// ============================================================

export const sendEmailCampaign = asyncHandler(
  async (req, res) => {
    const requestStartedAt = Date.now();

    log("============================================================");
    log("EMAIL CAMPAIGN STARTED");
    log("============================================================");

    const {
      subject,
      message,
      targetAudience = "all",
    } = req.body;

    logInfo("Email campaign data:", {
      subject,
      messageLength:
        typeof message === "string"
          ? message.length
          : 0,
      targetAudience,
    });

    if (!subject?.trim()) {
      return sendResponse(
        res,
        400,
        "Email subject is required"
      );
    }

    if (!message?.trim()) {
      return sendResponse(
        res,
        400,
        "Email message is required"
      );
    }

    const query = {
      status: "active",
    };

    if (targetAudience !== "all") {
      query.role = targetAudience;
    }

    logInfo("Email campaign user query:", query);

    const users = await User.find(query)
      .select("email firstName");

    logInfo(
      "Email campaign users found:",
      users.length
    );

    const usersToEmail = users.slice(0, 50);

    let successCount = 0;
    let failureCount = 0;

    for (const user of usersToEmail) {
      if (!user.email) {
        logWarn(
          "Skipping user without email:",
          user._id
        );

        continue;
      }

      try {
        await sendEmail({
          to: user.email,

          subject,

          htmlContent: announcementTemplate({
            title: subject,
            message,
          }),
        });

        successCount++;

        logSuccess(
          "Campaign email sent:",
          user.email
        );
      } catch (error) {
        failureCount++;

        logServiceError(
          `Campaign email to ${user.email}`,
          error
        );
      }
    }

    const duration = Date.now() - requestStartedAt;

    logSuccess("Email campaign completed.");

    logInfo("Success:", successCount);
    logInfo("Failures:", failureCount);
    logInfo("Duration:", `${duration}ms`);

    return sendResponse(
      res,
      200,
      `Email campaign processed for ${usersToEmail.length} users`
    );
  }
);

// ============================================================
// SMS BLAST
// ============================================================

export const sendSMSBlast = asyncHandler(
  async (req, res) => {
    const requestStartedAt = Date.now();

    log("============================================================");
    log("SMS BLAST STARTED");
    log("============================================================");

    const {
      message,
      targetAudience = "all",
    } = req.body;

    logInfo("SMS blast:", {
      messageLength:
        typeof message === "string"
          ? message.length
          : 0,
      targetAudience,
    });

    if (!message?.trim()) {
      return sendResponse(
        res,
        400,
        "SMS message is required"
      );
    }

    const query = {
      status: "active",
    };

    if (targetAudience !== "all") {
      query.role = targetAudience;
    }

    logInfo("SMS user query:", query);

    const users = await User.find(query)
      .select("phone")
      .limit(50);

    logInfo(
      "SMS users found:",
      users.length
    );

    let successCount = 0;
    let failureCount = 0;

    for (const user of users) {
      if (!user.phone) {
        logWarn(
          "Skipping user without phone:",
          user._id
        );

        continue;
      }

      try {
        log(
          "Sending SMS to:",
          user.phone
        );

        await sendSMS(
          user.phone,
          message
        );

        successCount++;

        logSuccess(
          "SMS sent:",
          user.phone
        );
      } catch (error) {
        failureCount++;

        logServiceError(
          `SMS to ${user.phone}`,
          error
        );
      }
    }

    const duration = Date.now() - requestStartedAt;

    logSuccess("SMS blast completed.");

    logInfo("Success:", successCount);
    logInfo("Failures:", failureCount);
    logInfo("Duration:", `${duration}ms`);

    return sendResponse(
      res,
      200,
      `SMS blast processed for ${users.length} users`
    );
  }
);

// ============================================================
// PUSH NOTIFICATION
// ============================================================

export const sendPushNotification = asyncHandler(
  async (req, res) => {
    const requestStartedAt = Date.now();

    log("============================================================");
    log("PUSH NOTIFICATION STARTED");
    log("============================================================");

    const {
      title,
      message,
      segment = "All",
    } = req.body;

    logInfo("Push notification request:", {
      title,
      messageLength:
        typeof message === "string"
          ? message.length
          : 0,
      segment,
    });

    if (!title?.trim()) {
      return sendResponse(
        res,
        400,
        "Push notification title is required"
      );
    }

    if (!message?.trim()) {
      return sendResponse(
        res,
        400,
        "Push notification message is required"
      );
    }

    const pushPayload = {
      title,
      message,
    };

    logInfo(
      "Calling sendPushToAll() with:",
      pushPayload
    );

    try {
      const result = await sendPushToAll(
        pushPayload
      );

      const duration =
        Date.now() - requestStartedAt;

      logSuccess(
        "Push notification completed."
      );

      logInfo(
        "Push result:",
        result
      );

      logInfo(
        "Duration:",
        `${duration}ms`
      );

      return sendResponse(
        res,
        200,
        "Push notification sent",
        result
      );
    } catch (error) {
      logServiceError(
        "Push notification",
        error
      );

      throw error;
    }
  }
);

// ============================================================
// BROADCAST
// ============================================================

export const broadcast = asyncHandler(
  async (req, res) => {
    const requestStartedAt = Date.now();

    log("============================================================");
    log("BROADCAST STARTED");
    log("============================================================");

    const {
      title,
      message,
      channels = [],
      targetAudience = "all",
    } = req.body;

    logInfo("Broadcast:", {
      title,
      messageLength:
        typeof message === "string"
          ? message.length
          : 0,
      channels,
      targetAudience,
    });

    if (!title?.trim()) {
      return sendResponse(
        res,
        400,
        "Broadcast title is required"
      );
    }

    if (!message?.trim()) {
      return sendResponse(
        res,
        400,
        "Broadcast message is required"
      );
    }

    if (!Array.isArray(channels) || channels.length === 0) {
      return sendResponse(
        res,
        400,
        "At least one broadcast channel is required"
      );
    }

    // --------------------------------------------------------
    // EMAIL
    // --------------------------------------------------------

    if (channels.includes("email")) {
      log("Broadcast email channel enabled.");

      const query = {
        status: "active",
      };

      if (targetAudience !== "all") {
        query.role = targetAudience;
      }

      const users = await User.find(query)
        .select("email")
        .limit(100);

      logInfo(
        "Broadcast email users:",
        users.length
      );

      for (const user of users) {
        if (!user.email) continue;

        try {
          await sendEmail({
            to: user.email,

            subject: title,

            htmlContent: announcementTemplate({
              title,
              message,
            }),
          });
        } catch (error) {
          logServiceError(
            `Broadcast email to ${user.email}`,
            error
          );
        }
      }
    }

    // --------------------------------------------------------
    // PUSH
    // --------------------------------------------------------

    if (channels.includes("push")) {
      log("Broadcast push channel enabled.");

      try {
        await sendPushToAll({
          title,
          message,
        });

        logSuccess(
          "Broadcast push completed."
        );
      } catch (error) {
        logServiceError(
          "Broadcast push",
          error
        );
      }
    }

    // --------------------------------------------------------
    // IN-APP
    // --------------------------------------------------------

    if (channels.includes("inapp")) {
      log("Broadcast in-app channel enabled.");

      let role;

      if (targetAudience === "students") {
        role = "student";
      } else if (targetAudience === "instructors") {
        role = "instructor";
      }

      if (role) {
        try {
          await notifyByRole({
            role,

            senderId: req.user._id,

            type: NOTIFICATION_TYPES.ANNOUNCEMENT,

            title,

            message,
          });

          logSuccess(
            "Broadcast in-app notification completed."
          );
        } catch (error) {
          logServiceError(
            "Broadcast in-app notification",
            error
          );
        }
      } else {
        logWarn(
          "In-app broadcast skipped because target audience does not map to a role."
        );
      }
    }

    const duration =
      Date.now() - requestStartedAt;

    logSuccess("============================================================");
    logSuccess("BROADCAST COMPLETED");
    logSuccess("============================================================");

    logInfo(
      "Duration:",
      `${duration}ms`
    );

    return sendResponse(
      res,
      200,
      "Broadcast sent successfully"
    );
  }
);