import LiveClass from "../models/live/LiveClass.js";
import Enrollment from "../models/learning/Enrollment.js";
import sendEmail from "../services/email/emailService.js";
import liveClassReminderTemplate from "../templates/email/liveClassReminder.js";
import { createNotification } from "../services/notification/inAppService.js";
import { formatDate } from "../utils/dateHelpers.js";
import { EMAIL_SUBJECTS, NOTIFICATION_TYPES } from "../utils/constants.js";

export const liveClassReminderJob = async () => {
  try {
    const now = new Date();
    const in30min = new Date(now.getTime() + 30 * 60 * 1000);
    const in35min = new Date(now.getTime() + 35 * 60 * 1000);

    // ── Get classes starting in 30 minutes ─────────────
    const liveClasses = await LiveClass.find({
      scheduledAt: { $gte: in30min, $lte: in35min },
      status: "scheduled",
      reminderSent: false,
    })
      .populate("course", "title")
      .populate("instructor", "firstName lastName");

    let reminderCount = 0;

    for (const liveClass of liveClasses) {
      const enrollments = await Enrollment.find({
        course: liveClass.course._id,
        status: "active",
      }).populate("student", "firstName email");

      for (const enrollment of enrollments) {
        const student = enrollment.student;

        // ── Send email ─────────────────────────────────
        await sendEmail({
          to: student.email,
          subject: EMAIL_SUBJECTS.LIVE_CLASS_REMINDER,
          htmlContent: liveClassReminderTemplate({
            firstName: student.firstName,
            className: liveClass.title,
            instructorName: `${liveClass.instructor.firstName} ${liveClass.instructor.lastName}`,
            scheduledAt: formatDate(liveClass.scheduledAt),
            joinUrl: `${process.env.CLIENT_URL}/live-classes/${liveClass._id}/join`,
          }),
        });

        // ── In-app notification ────────────────────────
        await createNotification({
          recipientId: student._id,
          type: NOTIFICATION_TYPES.LIVE_CLASS,
          title: "Live Class Starting Soon 🎥",
          message: `"${liveClass.title}" starts in 30 minutes!`,
          actionUrl: `/live-classes/${liveClass._id}/join`,
        });

        reminderCount++;
      }

      // ── Mark reminder as sent ─────────────────────────
      await LiveClass.findByIdAndUpdate(liveClass._id, {
        reminderSent: true,
      });
    }

    console.log(
      `✅ Live class reminder job completed: ${reminderCount} reminders sent`
    );
  } catch (error) {
    console.error(`❌ Live class reminder job failed: ${error.message}`);
  }
};