import Payment from "../../models/payment/Payment.js";
import Payout from "../../models/payment/Payout.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import { generateFinancialReport } from "../../services/report/pdfGenerator.js";
import { generateFinancialExcel } from "../../services/report/excelGenerator.js";
import { generateFinancialCSV } from "../../services/report/csvGenerator.js";

export const getRevenueSummary = asyncHandler(async (req, res) => {
  const agg = await Payment.aggregate([
    { $match: { status: "success" } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$finalAmount" },
        totalTransactions: { $sum: 1 },
      },
    },
  ]);

  const monthly = await Payment.aggregate([
    { $match: { status: "success" } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        revenue: { $sum: "$finalAmount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  sendResponse(res, 200, "Revenue retrieved", {
    summary: agg[0] || { totalRevenue: 0, totalTransactions: 0 },
    monthly,
  });
});

export const getExpenses = asyncHandler(async (req, res) => {
  const payouts = await Payout.aggregate([
    { $match: { status: "completed" } },
    { $group: { _id: null, total: { $sum: "$netAmount" } } },
  ]);

  sendResponse(res, 200, "Expenses retrieved", {
    instructorPayouts: payouts[0]?.total || 0,
  });
});

export const getMonthlyReport = asyncHandler(async (req, res) => {
  const { year, month } = req.query;

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);

  const payments = await Payment.find({
    status: "success",
    createdAt: { $gte: start, $lte: end },
  }).populate("student", "firstName lastName");

  sendResponse(res, 200, "Monthly report retrieved", payments);
});

export const getAnnualReport = asyncHandler(async (req, res) => {
  const { year } = req.query;

  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);

  const payments = await Payment.find({
    status: "success",
    createdAt: { $gte: start, $lte: end },
  });

  sendResponse(res, 200, "Annual report retrieved", payments);
});

export const exportFinancial = asyncHandler(async (req, res) => {
  const { format = "pdf" } = req.query;

  const payments = await Payment.find({ status: "success" })
    .populate("student", "firstName lastName");

  const data = {
    transactions: payments.map((p) => ({
      invoiceId: p.invoiceId,
      studentName: p.student?.firstName + " " + p.student?.lastName,
      finalAmount: p.finalAmount,
      gateway: p.gateway,
      status: p.status,
      createdAt: p.createdAt,
    })),
    totalRevenue: payments.reduce((s, p) => s + p.finalAmount, 0),
    totalTransactions: payments.length,
    platformFee: payments.reduce((s, p) => s + p.finalAmount * 0.3, 0),
    instructorPayouts: payments.reduce((s, p) => s + p.finalAmount * 0.7, 0),
  };

  if (format === "excel") {
    const buffer = await generateFinancialExcel(data);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=financial-report.xlsx");
    return res.send(buffer);
  }

  if (format === "csv") {
    const csv = generateFinancialCSV(data);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=financial-report.csv");
    return res.send(csv);
  }

  const pdf = await generateFinancialReport(data);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=financial-report.pdf");
  res.send(pdf);
});