// ── Calculate percentage ──────────────────────────────────
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// ── Calculate course progress ─────────────────────────────
export const calculateCourseProgress = (completedLessons, totalLessons) => {
  return calculatePercentage(completedLessons, totalLessons);
};

// ── Calculate average ─────────────────────────────────────
export const calculateAverage = (numbers) => {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return Math.round(sum / numbers.length);
};

// ── Calculate referral discount ───────────────────────────
export const calculateReferralDiscount = (activeReferrals, isInstructor) => {
  const discountPerReferral = isInstructor ? 10 : 5;
  const maxDiscount = 50;
  const discount = activeReferrals * discountPerReferral;
  return Math.min(discount, maxDiscount);
};

// ── Calculate subscription price after discount ───────────
export const calculateDiscountedPrice = (originalPrice, discountPercent) => {
  const discount = (originalPrice * discountPercent) / 100;
  return originalPrice - discount;
};

// ── Calculate instructor payout ───────────────────────────
export const calculateInstructorPayout = (revenue, platformFeePercent = 30) => {
  const platformFee = (revenue * platformFeePercent) / 100;
  return revenue - platformFee;
};
