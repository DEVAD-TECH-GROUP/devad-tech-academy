import { format, addDays, addMonths, isAfter, isBefore, differenceInDays } from "date-fns";

// ── Format date ───────────────────────────────────────────
export const formatDate = (date, pattern = "MMM dd, yyyy") => {
  return format(new Date(date), pattern);
};

// ── Add days to date ──────────────────────────────────────
export const addDaysToDate = (date, days) => {
  return addDays(new Date(date), days);
};

// ── Add months to date ────────────────────────────────────
export const addMonthsToDate = (date, months) => {
  return addMonths(new Date(date), months);
};

// ── Check if date is past ─────────────────────────────────
export const isDatePast = (date) => {
  return isBefore(new Date(date), new Date());
};

// ── Check if date is future ───────────────────────────────
export const isDateFuture = (date) => {
  return isAfter(new Date(date), new Date());
};

// ── Get days between dates ────────────────────────────────
export const getDaysBetween = (date1, date2) => {
  return differenceInDays(new Date(date2), new Date(date1));
};

// ── Get subscription expiry ───────────────────────────────
export const getMonthlyExpiry = () => {
  return addMonths(new Date(), 1);
};

export const getAnnualExpiry = () => {
  return addMonths(new Date(), 12);
};
