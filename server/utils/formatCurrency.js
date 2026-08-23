// ── Format to Naira ───────────────────────────────────────
export const formatNaira = (amount) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
};

// ── Convert kobo to naira ─────────────────────────────────
export const koboToNaira = (kobo) => {
  return kobo / 100;
};

// ── Convert naira to kobo ─────────────────────────────────
export const nairaToKobo = (naira) => {
  return naira * 100;
};
