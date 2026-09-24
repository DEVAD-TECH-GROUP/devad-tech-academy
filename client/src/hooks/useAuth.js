// useAuth
import useAuthStore from "../store/authStore";
import { ROLES } from "../utils/constants";

export default function useAuth() {
  const { user, isAuthenticated, logout } = useAuthStore();

  return {
    user,
    isAuthenticated,
    logout,
    isStudent: user?.role === ROLES.STUDENT,
    isInstructor: user?.role === ROLES.INSTRUCTOR,
    isSuperAdmin: user?.role === ROLES.SUPER_ADMIN,
    role: user?.role,
  };
}