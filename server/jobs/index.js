import cron from "node-cron";
import { backupJob } from "./backupJob.js";
import { payoutJob } from "./payoutJob.js";
import { assignmentReminderJob } from "./assignmentReminderJob.js";
import { liveClassReminderJob } from "./liveClassReminderJob.js";
import { quizReminderJob } from "./quizReminderJob.js";
import { streakJob } from "./streakJob.js";
import { reportJob } from "./reportJob.js";

export const initializeJobs = () => {
  // ── Daily backup — every day at 4 AM ─────────────────
  cron.schedule("0 4 * * *", async () => {
    console.log("🔄 Running backup job...");
    await backupJob();
  });

  // ── Monthly payouts — 1st of every month at 9 AM ─────
  cron.schedule("0 9 1 * *", async () => {
    console.log("🔄 Running payout job...");
    await payoutJob();
  });

  // ── Assignment reminders — every day at 8 AM ─────────
  cron.schedule("0 8 * * *", async () => {
    console.log("🔄 Running assignment reminder job...");
    await assignmentReminderJob();
  });

  // ── Live class reminders — every 30 minutes ───────────
  cron.schedule("*/30 * * * *", async () => {
    console.log("🔄 Running live class reminder job...");
    await liveClassReminderJob();
  });

  // ── Quiz reminders — every day at 9 AM ───────────────
  cron.schedule("0 9 * * *", async () => {
    console.log("🔄 Running quiz reminder job...");
    await quizReminderJob();
  });

  // ── Streak check — every day at midnight ──────────────
  cron.schedule("0 0 * * *", async () => {
    console.log("🔄 Running streak job...");
    await streakJob();
  });

  // ── Weekly report — every Sunday at 10 PM ────────────
  cron.schedule("0 22 * * 0", async () => {
    console.log("🔄 Running report job...");
    await reportJob();
  });

  console.log("✅ All cron jobs initialized");
};