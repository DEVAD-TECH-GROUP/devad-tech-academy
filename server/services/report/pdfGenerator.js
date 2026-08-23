import PDFDocument from "pdfkit";
import { formatNaira } from "../../utils/formatCurrency.js";
import { formatDate } from "../../utils/dateHelpers.js";

// ── Generate student report PDF ───────────────────────────
export const generateStudentReport = async (data) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    // Header
    doc.fontSize(20)
      .font("Helvetica-Bold")
      .text("Devad Tech Academy", { align: "center" });
    doc.fontSize(14)
      .font("Helvetica")
      .text("Student Progress Report", { align: "center" });
    doc.moveDown();

    // Report info
    doc.fontSize(10)
      .text(`Generated: ${formatDate(new Date())}`)
      .text(`Total Students: ${data.total}`)
      .moveDown();

    // Table header
    doc.fontSize(10)
      .font("Helvetica-Bold")
      .text("Name", 50, doc.y, { width: 150 })
      .text("Email", 200, doc.y - 12, { width: 180 })
      .text("Courses", 380, doc.y - 12, { width: 60 })
      .text("Status", 440, doc.y - 12, { width: 80 });
    doc.moveDown(0.5);

    doc.moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke();
    doc.moveDown(0.5);

    // Table rows
    data.students.forEach((student) => {
      doc.font("Helvetica")
        .fontSize(9)
        .text(student.fullName || "N/A", 50, doc.y, { width: 150 })
        .text(student.email || "N/A", 200, doc.y - 10, { width: 180 })
        .text(
          String(student.totalCoursesEnrolled || 0),
          380, doc.y - 10,
          { width: 60 }
        )
        .text(student.status || "N/A", 440, doc.y - 10, { width: 80 });
      doc.moveDown(0.3);
    });

    doc.end();
  });
};

// ── Generate financial report PDF ─────────────────────────
export const generateFinancialReport = async (data) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    // Header
    doc.fontSize(20)
      .font("Helvetica-Bold")
      .text("Devad Tech Academy", { align: "center" });
    doc.fontSize(14)
      .font("Helvetica")
      .text("Financial Report", { align: "center" });
    doc.moveDown();

    // Summary
    doc.fontSize(12)
      .font("Helvetica-Bold")
      .text("Summary");
    doc.fontSize(10)
      .font("Helvetica")
      .text(`Total Revenue: ${formatNaira(data.totalRevenue)}`)
      .text(`Platform Fee: ${formatNaira(data.platformFee)}`)
      .text(`Instructor Payouts: ${formatNaira(data.instructorPayouts)}`)
      .text(`Total Transactions: ${data.totalTransactions}`)
      .moveDown();

    // Transactions
    doc.fontSize(12)
      .font("Helvetica-Bold")
      .text("Transactions");
    doc.moveDown(0.5);

    data.transactions.forEach((txn) => {
      doc.fontSize(9)
        .font("Helvetica")
        .text(
          `${txn.invoiceId} | ${txn.studentName} | ${formatNaira(txn.finalAmount)} | ${txn.status} | ${formatDate(txn.createdAt)}`
        );
    });

    doc.end();
  });
};