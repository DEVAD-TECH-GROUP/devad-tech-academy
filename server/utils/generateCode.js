import { v4 as uuidv4 } from "uuid";

// ── Generate referral code ────────────────────────────────
export const generateReferralCode = (name) => {
  const prefix = name.split(" ")[0].toUpperCase().slice(0, 4);
  const unique = uuidv4().split("-")[0].toUpperCase();
  return `DEVAD-${prefix}-${unique}`;
};

// ── Generate certificate ID ───────────────────────────────
export const generateCertificateId = (courseCode) => {
  const year = new Date().getFullYear().toString().slice(-2);
  const month = String(new Date().getMonth() + 1).padStart(2, "0");
  const unique = Math.floor(1000 + Math.random() * 9000);
  return `DTA-${courseCode}-${year}${month}-${unique}`;
};

// ── Generate ticket ID ────────────────────────────────────
export const generateTicketId = () => {
  const unique = Math.floor(100 + Math.random() * 900);
  return `TKT-${unique}`;
};

// ── Generate OTP ──────────────────────────────────────────
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ── Generate invoice ID ───────────────────────────────────
export const generateInvoiceId = () => {
  const timestamp = Date.now().toString().slice(-6);
  return `INV-${timestamp}`;
};
