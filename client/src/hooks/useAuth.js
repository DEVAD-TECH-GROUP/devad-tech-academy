import useAuthStore from "../store/authStore";
import { ROLES } from "../utils/constants";

export default function useAuth() {
  const {
    user,
    isAuthenticated,
    logout,
  } = useAuthStore();

  return {
    /* ========================================================
       USER
       ======================================================== */

    user,

    /* ========================================================
       AUTHENTICATION
       ======================================================== */

    isAuthenticated,

    logout,

    /* ========================================================
       ROLE
       ======================================================== */

    role: user?.role,

    isStudent:
      user?.role === ROLES.STUDENT,

    isInstructor:
      user?.role === ROLES.INSTRUCTOR,

    isSuperAdmin:
      user?.role === ROLES.SUPER_ADMIN,

    /* ========================================================
       VERIFICATION
       ======================================================== */

    isEmailVerified:
      Boolean(user?.isEmailVerified),

    isPhoneVerified:
      Boolean(user?.isPhoneVerified),

    isFullyVerified:
      Boolean(
        user?.isEmailVerified &&
        user?.isPhoneVerified
      ),

    /* ========================================================
       ACCOUNT STATUS
       ======================================================== */

    status: user?.status,

    isActive:
      user?.status === "active",

    isSuspended:
      user?.status === "suspended",

    isInactive:
      user?.status === "inactive",
  };
}
