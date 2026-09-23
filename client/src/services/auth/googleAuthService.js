export const googleLogin = () => {
  window.location.href = `${import.meta.env.VITE_API_URL || "https://devad-academy-backend.onrender.com/api"}/auth/google`;
};