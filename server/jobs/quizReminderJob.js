import Quiz from "../models/assessment/Quiz.js";
import QuizAttempt from "../models/assessment/QuizAttempt.js";
import Enrollment from "../models/learning/Enrollment.js";
import sendEmail from "../services/email/emailService.js";
import quizReminderTemplate from "../templates/email/quizReminder.js";
import { createNotification } from "../services/notification/inAppService.js";
import { formatDate, addDaysToDate } from "../utils/dateHelpers.js";
import { EMAIL_SUBJECTS, NOTIFICATION_TYPES } from "../utils/constants.js";

export const quizReminderJob = async () => {
  try {
    const tomorrow = addDaysToDate(new Date(), 1);
    const dayAfter = addDaysToDate(new Date(), 2);

    // ── Get quizzes closing in 24 hours ────────────────
    const quizzes = await Quiz.find({
      availableUntil: { $gte: tomorrow, $lte: dayAfter },
      status: "active",
    }).populate("course", "title");

    let reminderCount = 0;

    for (const quiz of quizzes) {
      const enrollments = await Enrollment.find({
        course: quiz.course._id,
        status: "active",
      }).populate("student", "firstName email");

      for (const enrollment of enrollments) {
        const hasAttempted = await QuizAttempt.findOne({
          quiz: quiz._id,
          student: enrollment.student._id,
          status: { $in: ["submitted", "graded"] },
        });

        if (hasAttempted) continue;

        const student = enrollment.student;

        await sendEmail({
          to: student.email,
          subject: EMAIL_SUBJECTS.QUIZ_REMINDER,
          htmlContent: quizReminderTemplate({
            firstName: student.firstName,
            quizTitle: quiz.title,
            courseName: quiz.course.title,
            availableUntil: formatDate(quiz.availableUntil),
            quizUrl: `${process.env.CLIENT_URL}/quizzes/${quiz._id}`,
          }),
        });

        await createNotification({
          recipientId: student._id,
          type: NOTIFICATION_TYPES.QUIZ,
          title: "Quiz Closing Soon 🧪",
          message: `"${quiz.title}" closes tomorrow. Take it now!`,
          actionUrl: `/quizzes/${quiz._id}`,
        });

        reminderCount++;
      }
    }

    console.log(
      `✅ Quiz reminder job completed: ${reminderCount} reminders sent`
    );
  } catch (error) {
    console.error(`❌ Quiz reminder job failed: ${error.message}`);
  }
};