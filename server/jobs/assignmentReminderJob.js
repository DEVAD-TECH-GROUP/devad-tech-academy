import Assignment from "../models/assessment/Assignment.js";
import Submission from "../models/assessment/Submission.js";
import Enrollment from "../models/learning/Enrollment.js";
import User from "../models/user/User.js";
import sendEmail from "../services/email/emailService.js";
import assignmentDueTemplate from "../templates/email/assignmentDue.js";
import { createNotification } from "../services/notification/inAppService.js";
import { addDaysToDate, formatDate } from "../utils/dateHelpers.js";
import { EMAIL_SUBJECTS, NOTIFICATION_TYPES } from "../utils/constants.js";

export const assignmentReminderJob = async () => {
  try {
    const tomorrow = addDaysToDate(new Date(), 1);
    const dayAfter = addDaysToDate(new Date(), 2);

    // ── Get assignments due in 24 hours ────────────────
    const assignments = await Assignment.find({
      dueDate: { $gte: tomorrow, $lte: dayAfter },
      isPublished: true,
    }).populate("course", "title");

    let reminderCount = 0;

    for (const assignment of assignments) {
      const enrollments = await Enrollment.find({
        course: assignment.course._id,
        status: "active",
      }).populate("student", "firstName email");

      for (const enrollment of enrollments) {
        const hasSubmitted = await Submission.findOne({
          assignment: assignment._id,
          student: enrollment.student._id,
        });

        if (hasSubmitted) continue;

        const student = enrollment.student;

        // ── Send email ─────────────────────────────────
        await sendEmail({
          to: student.email,
          subject: EMAIL_SUBJECTS.ASSIGNMENT_DUE,
          htmlContent: assignmentDueTemplate({
            firstName: student.firstName,
            assignmentTitle: assignment.title,
            courseName: assignment.course.title,
            dueDate: formatDate(assignment.dueDate),
            assignmentUrl: `${process.env.CLIENT_URL}/assignments/${assignment._id}`,
          }),
        });

        // ── Send in-app notification ───────────────────
        await createNotification({
          recipientId: student._id,
          type: NOTIFICATION_TYPES.ASSIGNMENT,
          title: "Assignment Due Tomorrow",
          message: `"${assignment.title}" is due tomorrow. Submit now!`,
          actionUrl: `/assignments/${assignment._id}`,
        });

        reminderCount++;
      }
    }

    console.log(
      `✅ Assignment reminder job completed: ${reminderCount} reminders sent`
    );
  } catch (error) {
    console.error(`❌ Assignment reminder job failed: ${error.message}`);
  }
};