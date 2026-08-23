import User from "../models/user/User.js";
import Payment from "../models/payment/Payment.js";
import Enrollment from "../models/learning/Enrollment.js";
import Course from "../models/course/Course.js";
import sendEmail from "../services/email/emailService.js";
import { formatNaira } from "../utils/formatCurrency.js";
import { formatDate, addDaysToDate } from "../utils/dateHelpers.js";

export const reportJob = async () => {
  try {
    const weekStart = addDaysToDate(new Date(), -7);

    // ── Gather weekly stats ────────────────────────────
    const [
      newUsers,
      newEnrollments,
      weeklyRevenue,
      totalUsers,
      totalCourses,
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: weekStart } }),
      Enrollment.countDocuments({ createdAt: { $gte: weekStart } }),
      Payment.aggregate([
        {
          $match: {
            status: "success",
            createdAt: { $gte: weekStart },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$finalAmount" },
          },
        },
      ]),
      User.countDocuments(),
      Course.countDocuments({ status: "published" }),
    ]);

    const revenue =
      weeklyRevenue.length > 0 ? weeklyRevenue[0].total : 0;

    // ── Get super admin emails ─────────────────────────
    const superAdmins = await User.find({ role: "super_admin" })
      .select("email firstName");

    const reportHtml = `
      <div style="font-family: Arial; background: #0F0F14; color: #E8E8F0; padding: 30px;">
        <h2 style="color: #818CF8;">📊 Weekly Platform Report</h2>
        <p style="color: #9999B8;">Week ending: ${formatDate(new Date())}</p>
        <hr style="border-color: #2A2A3A;">
        <h3 style="color: #34D399;">This Week</h3>
        <p>New Users: <strong>${newUsers}</strong></p>
        <p>New Enrollments: <strong>${newEnrollments}</strong></p>
        <p>Revenue: <strong>${formatNaira(revenue)}</strong></p>
        <hr style="border-color: #2A2A3A;">
        <h3 style="color: #818CF8;">Platform Totals</h3>
        <p>Total Users: <strong>${totalUsers}</strong></p>
        <p>Active Courses: <strong>${totalCourses}</strong></p>
      </div>
    `;

    for (const admin of superAdmins) {
      await sendEmail({
        to: admin.email,
        subject: `📊 Weekly Report — ${formatDate(new Date())}`,
        htmlContent: reportHtml,
      });
    }

    console.log(
      `✅ Report job completed: sent to ${superAdmins.length} admins`
    );
  } catch (error) {
    console.error(`❌ Report job failed: ${error.message}`);
  }
};