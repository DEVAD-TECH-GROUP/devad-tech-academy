import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (role && user?.role !== role) {
    if (user?.role === "super_admin") return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === "instructor") return <Navigate to="/instructor/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return children;
}