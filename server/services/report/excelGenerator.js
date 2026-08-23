import ExcelJS from "exceljs";
import { formatNaira } from "../../utils/formatCurrency.js";
import { formatDate } from "../../utils/dateHelpers.js";

// ── Generate student report Excel ─────────────────────────
export const generateStudentExcel = async (data) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Students");

  // ── Styling ───────────────────────────────────────────
  sheet.columns = [
    { header: "Name", key: "name", width: 25 },
    { header: "Email", key: "email", width: 30 },
    { header: "Role", key: "role", width: 15 },
    { header: "Status", key: "status", width: 15 },
    { header: "Courses Enrolled", key: "courses", width: 20 },
    { header: "Joined", key: "joined", width: 20 },
    { header: "Last Login", key: "lastLogin", width: 20 },
  ];

  // ── Header style ──────────────────────────────────────
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF818CF8" },
  };

  // ── Add rows ──────────────────────────────────────────
  data.students.forEach((student) => {
    sheet.addRow({
      name: student.fullName || "N/A",
      email: student.email || "N/A",
      role: student.role || "N/A",
      status: student.status || "N/A",
      courses: student.totalCoursesEnrolled || 0,
      joined: formatDate(student.createdAt),
      lastLogin: student.lastLogin
        ? formatDate(student.lastLogin)
        : "Never",
    });
  });

  return await workbook.xlsx.writeBuffer();
};

// ── Generate financial report Excel ───────────────────────
export const generateFinancialExcel = async (data) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Financial Report");

  // ── Summary sheet ─────────────────────────────────────
  sheet.addRow(["Devad Tech Academy — Financial Report"]);
  sheet.addRow(["Generated:", formatDate(new Date())]);
  sheet.addRow([]);
  sheet.addRow(["Total Revenue", formatNaira(data.totalRevenue)]);
  sheet.addRow(["Platform Fee", formatNaira(data.platformFee)]);
  sheet.addRow(["Instructor Payouts", formatNaira(data.instructorPayouts)]);
  sheet.addRow(["Total Transactions", data.totalTransactions]);
  sheet.addRow([]);

  // ── Transactions ──────────────────────────────────────
  const txSheet = workbook.addWorksheet("Transactions");
  txSheet.columns = [
    { header: "Invoice ID", key: "invoiceId", width: 20 },
    { header: "Student", key: "student", width: 25 },
    { header: "Amount", key: "amount", width: 20 },
    { header: "Gateway", key: "gateway", width: 15 },
    { header: "Status", key: "status", width: 15 },
    { header: "Date", key: "date", width: 20 },
  ];

  txSheet.getRow(1).font = { bold: true };

  data.transactions.forEach((txn) => {
    txSheet.addRow({
      invoiceId: txn.invoiceId || "N/A",
      student: txn.studentName || "N/A",
      amount: formatNaira(txn.finalAmount),
      gateway: txn.gateway || "N/A",
      status: txn.status || "N/A",
      date: formatDate(txn.createdAt),
    });
  });

  return await workbook.xlsx.writeBuffer();
};