import mongoose from "mongoose";
import { WebhookReceiver } from "livekit-server-sdk";

import env from "../../config/env.js";

import LiveClass from "../../models/live/LiveClass.js";
import Attendance from "../../models/live/Attendance.js";

const webhookReceiver = new WebhookReceiver(
  env.LIVEKIT_API_KEY,
  env.LIVEKIT_API_SECRET
);

const getEventDate = (createdAt) => {
  const timestamp = Number(createdAt);

  return Number.isFinite(timestamp) && timestamp > 0
    ? new Date(timestamp * 1000)
    : new Date();
};

const handleParticipantJoined = async (event) => {
  const roomName = event.room?.name;
  const identity = event.participant?.identity;

  if (!roomName || !identity) return;

  // Participant identity is the MongoDB User ID.
  if (!mongoose.Types.ObjectId.isValid(identity)) return;

  const liveClass = await LiveClass.findOne({
    "meetingRoom.roomName": roomName,
  });

  if (!liveClass) return;

  // Instructor joins must not create student attendance.
  if (String(liveClass.instructor) === String(identity)) return;

  const studentId = new mongoose.Types.ObjectId(identity);
  const eventDate = getEventDate(event.createdAt);

  let attendance = await Attendance.findOne({
    liveClass: liveClass._id,
    student: studentId,
  });

  if (!attendance) {
    try {
      attendance = await Attendance.create({
        liveClass: liveClass._id,
        student: studentId,
        course: liveClass.course,
        joinedAt: eventDate,
        currentSessionStartedAt: eventDate,
        attended: true,
        status: "attended",
      });

      await LiveClass.updateOne(
        { _id: liveClass._id },
        { $inc: { totalAttended: 1 } }
      );

      return;
    } catch (error) {
      // A retried webhook may race with another insert.
      if (error.code !== 11000) throw error;

      attendance = await Attendance.findOne({
        liveClass: liveClass._id,
        student: studentId,
      });
    }
  }

  if (!attendance || attendance.currentSessionStartedAt) {
    return;
  }

  const isFirstAttendance = !attendance.attended;

  attendance.joinedAt = attendance.joinedAt || eventDate;
  attendance.leftAt = null;
  attendance.currentSessionStartedAt = eventDate;
  attendance.attended = true;
  attendance.status = "attended";

  await attendance.save();

  if (isFirstAttendance) {
    await LiveClass.updateOne(
      { _id: liveClass._id },
      { $inc: { totalAttended: 1 } }
    );
  }
};

const handleParticipantLeft = async (event) => {
  const roomName = event.room?.name;
  const identity = event.participant?.identity;

  if (!roomName || !identity) return;

  if (!mongoose.Types.ObjectId.isValid(identity)) return;

  const liveClass = await LiveClass.findOne({
    "meetingRoom.roomName": roomName,
  });

  if (!liveClass) return;

  if (String(liveClass.instructor) === String(identity)) return;

  const attendance = await Attendance.findOne({
    liveClass: liveClass._id,
    student: identity,
  });

  if (!attendance || !attendance.currentSessionStartedAt) {
    return;
  }

  const leftAt = getEventDate(event.createdAt);

  const sessionSeconds = Math.max(
    0,
    (leftAt.getTime() -
      attendance.currentSessionStartedAt.getTime()) / 1000
  );

  const previousMinutes = Number(attendance.duration || 0);
  const newMinutes = previousMinutes + sessionSeconds / 60;

  attendance.duration = Number(newMinutes.toFixed(2));
  attendance.leftAt = leftAt;
  attendance.currentSessionStartedAt = null;
  attendance.attended = true;
  attendance.status = "attended";

  const classDuration = Number(liveClass.duration || 0);

  attendance.attendancePercentage = classDuration > 0
    ? Math.min(
        100,
        Number(((attendance.duration / classDuration) * 100).toFixed(2))
      )
    : 0;

  await attendance.save();
};

export const receiveLiveKitWebhook = async (req, res) => {
  try {
    if (!Buffer.isBuffer(req.body)) {
      return res.status(400).json({
        success: false,
        message: "Expected raw LiveKit webhook body",
      });
    }

    const event = await webhookReceiver.receive(
      req.body.toString("utf8"),
      req.get("Authorization")
    );

    switch (event.event) {
      case "participant_joined":
        await handleParticipantJoined(event);
        break;

      case "participant_left":
        await handleParticipantLeft(event);
        break;

      default:
        // Other LiveKit events are valid but not needed yet.
        break;
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error("LiveKit webhook error:", error);

    return res.status(400).json({
      success: false,
      message: "Invalid or unprocessable LiveKit webhook",
    });
  }
};
