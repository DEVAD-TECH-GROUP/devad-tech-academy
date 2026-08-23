import Payout from "../models/payment/Payout.js";
import Payment from "../models/payment/Payment.js";
import Instructor from "../models/user/Instructor.js";
import User from "../models/user/User.js";
import { calculateInstructorPayout } from "../utils/calculateStats.js";
import { generateInvoiceId } from "../utils/generateCode.js";
import { addDaysToDate, formatDate } from "../utils/dateHelpers.js";
import sendEmail from "../services/email/emailService.js";
import payoutProcessedTemplate from "../templates/email/payoutProcessed.js";
import { formatNaira } from "../utils/formatCurrency.js";
import { EMAIL_SUBJECTS } from "../utils/constants.js";

export const payoutJob = async () => {
  try {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const instructors = await Instructor.find({
      applicationStatus: "approved",
    }).populate("user");

    let processedCount = 0;

    for (const instructor of instructors) {
      try {
        // ── Get payments for period ──────────────────
        const payments = await Payment.find({
          status: "success",
          createdAt: { $gte: periodStart, $lte: periodEnd },
          paidAt: { $exists: true },
        });

        if (payments.length === 0) continue;

        const grossRevenue = payments.reduce(
          (sum, p) => sum + p.finalAmount,
          0
        );
        if (grossRevenue === 0) continue;

        const platformFeePercent = 30 - (instructor.platformFeeDiscount || 0);
        const platformFee = (grossRevenue * platformFeePercent) / 100;
        const netAmount = calculateInstructorPayout(
          grossRevenue,
          platformFeePercent
        );

        if (!instructor.payoutSettings?.accountNumber) continue;

        const payout = await Payout.create({
          instructor: instructor.user._id,
          amount: grossRevenue,
          platformFee,
          platformFeePercent,
          netAmount,
          periodStart,
          periodEnd,
          bankName: instructor.payoutSettings.bankName,
          accountNumber: instructor.payoutSettings.accountNumber,
          accountName: instructor.payoutSettings.accountName,
          reference: generateInvoiceId(),
          status: "pending",
        });

        // ── Send email notification ──────────────────
        const user = instructor.user;
        await sendEmail({
          to: user.email,
          subject: EMAIL_SUBJECTS.PAYOUT_PROCESSED,
          htmlContent: payoutProcessedTemplate({
            firstName: user.firstName,
            amount: formatNaira(grossRevenue),
            netAmount: formatNaira(netAmount),
            platformFee: formatNaira(platformFee),
            periodStart: formatDate(periodStart),
            periodEnd: formatDate(periodEnd),
            bankName: instructor.payoutSettings.bankName,
            accountNumber: instructor.payoutSettings.accountNumber,
            reference: payout.reference,
          }),
        });

        processedCount++;
      } catch (error) {
        console.error(
          `❌ Payout failed for instructor ${instructor.user._id}: ${error.message}`
        );
      }
    }

    console.log(`✅ Payout job completed: ${processedCount} instructors processed`);
  } catch (error) {
    console.error(`❌ Payout job failed: ${error.message}`);
  }
};