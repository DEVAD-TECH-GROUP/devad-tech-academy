export const ROLES = {
  SUPER_ADMIN: "super_admin",
  INSTRUCTOR: "instructor",
  STUDENT: "student",
};

export const PLANS = {
  MONTHLY: { label: "Monthly", price: 12500, priceStr: "₦12,500/mo" },
  ANNUAL:  { label: "Annual",  price: 100000, priceStr: "₦100,000/yr" },
};

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
export const CLIENT_URL = import.meta.env.VITE_CLIENT_URL || "http://localhost:5173";