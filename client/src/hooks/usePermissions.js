import useAuthStore from "../store/authStore";
import { ROLES } from "../utils/constants";

export default function usePermissions() {
  const { user } = useAuthStore();
  const role = user?.role;

  return {
    canManageCourses: role === ROLES.INSTRUCTOR || role === ROLES.SUPER_ADMIN,
    canManageUsers: role === ROLES.SUPER_ADMIN,
    canViewEarnings: role === ROLES.INSTRUCTOR || role === ROLES.SUPER_ADMIN,
    canHostLiveClasses: role === ROLES.INSTRUCTOR || role === ROLES.SUPER_ADMIN,
    canEnroll: role === ROLES.STUDENT,
    canSubmit: role === ROLES.STUDENT,
    isSuperAdmin: role === ROLES.SUPER_ADMIN,
    isInstructor: role === ROLES.INSTRUCTOR,
    isStudent: role === ROLES.STUDENT,
  };
}
