import PDFDocument from "pdfkit";
import cloudinary from "../../config/cloudinary.js";
import { Readable } from "stream";

// ── Generate certificate PDF ──────────────────────────────
export const generateCertificate = async ({
  studentName,
  courseName,
  instructorName,
  certificateId,
  completionDate,
  grade = null,
}) => {
  try {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        layout: "landscape",
        size: "A4",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const buffers = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", async () => {
        try {
          const pdfBuffer = Buffer.concat(buffers);

          // ── Upload to cloudinary ──────────────────────
          const uploadResult = await new Promise((res, rej) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: "devad-academy/certificates",
                public_id: `cert-${certificateId}`,
                resource_type: "raw",
                format: "pdf",
              },
              (error, result) => {
                if (error) rej(error);
                else res(result);
              }
            );

            const readable = new Readable();
            readable.push(pdfBuffer);
            readable.push(null);
            readable.pipe(uploadStream);
          });

          resolve({
            public_id: uploadResult.public_id,
            url: uploadResult.secure_url,
          });
        } catch (error) {
          reject(error);
        }
      });

      // ── Build certificate ─────────────────────────────
      // Background
      doc.rect(0, 0, doc.page.width, doc.page.height)
        .fill("#0F0F14");

      // Border
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
        .stroke("#818CF8");

      // Academy name
      doc.fillColor("#818CF8")
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("DEVAD TECH ACADEMY", { align: "center" })
        .moveDown(0.5);

      // Certificate title
      doc.fillColor("#E8E8F0")
        .fontSize(32)
        .text("Certificate of Completion", { align: "center" })
        .moveDown(0.5);

      // Presented to
      doc.fillColor("#9999B8")
        .fontSize(14)
        .font("Helvetica")
        .text("This is to certify that", { align: "center" })
        .moveDown(0.5);

      // Student name
      doc.fillColor("#34D399")
        .fontSize(28)
        .font("Helvetica-Bold")
        .text(studentName, { align: "center" })
        .moveDown(0.5);

      // Completion text
      doc.fillColor("#9999B8")
        .fontSize(14)
        .font("Helvetica")
        .text("has successfully completed the course", { align: "center" })
        .moveDown(0.5);

      // Course name
      doc.fillColor("#E8E8F0")
        .fontSize(22)
        .font("Helvetica-Bold")
        .text(courseName, { align: "center" })
        .moveDown(0.5);

      // Grade if available
      if (grade) {
        doc.fillColor("#FBBF24")
          .fontSize(16)
          .text(`Grade: ${grade}`, { align: "center" })
          .moveDown(0.5);
      }

      // Date and instructor
      doc.fillColor("#9999B8")
        .fontSize(12)
        .font("Helvetica")
        .text(`Completed: ${completionDate}`, { align: "center" })
        .moveDown(0.3);

      doc.fillColor("#9999B8")
        .text(`Instructor: ${instructorName}`, { align: "center" })
        .moveDown(0.3);

      // Certificate ID
      doc.fillColor("#6B6B8A")
        .fontSize(10)
        .text(`Certificate ID: ${certificateId}`, { align: "center" })
        .moveDown(0.3);

      doc.text(
        `Verify at: devadtech.academy/verify/${certificateId}`,
        { align: "center" }
      );

      doc.end();
    });
  } catch (error) {
    console.error(`❌ Certificate generation error: ${error.message}`);
    throw error;
  }
};