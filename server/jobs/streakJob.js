import Streak from "../models/gamification/Streak.js";
import Student from "../models/user/Student.js";
import { createNotification } from "../services/notification/inAppService.js";
import { NOTIFICATION_TYPES } from "../utils/constants.js";

export const streakJob = async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ── Find streaks with no activity yesterday ─────────
    const streaks = await Streak.find({
      currentStreak: { $gt: 0 },
      lastActiveDate: { $lt: today },
    });

    let resetCount = 0;

    for (const streak of streaks) {
      const lastActive = new Date(streak.lastActiveDate);
      lastActive.setHours(0, 0, 0, 0);

      const diffDays = Math.floor(
        (today - lastActive) / (1000 * 60 * 60 * 24)
      );

      if (diffDays > 1) {
        const previousStreak = streak.currentStreak;

        await Streak.findByIdAndUpdate(streak._id, {
          currentStreak: 0,
          streakStartDate: null,
        });

        // ── Notify student ─────────────────────────────
        if (previousStreak >= 3) {
          await createNotification({
            recipientId: streak.student,
            type: NOTIFICATION_TYPES.SYSTEM,
            title: "Streak Broken 😢",
            message: `Your ${previousStreak}-day streak ended. Start a new one today!`,
            actionUrl: "/dashboard",
          });
        }

        resetCount++;
      }
    }

    console.log(
      `✅ Streak job completed: ${resetCount} streaks reset`
    );
  } catch (error) {
    console.error(`❌ Streak job failed: ${error.message}`);
  }
};