// src/router/AppRouter.jsx
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./RoleRoute";

// Layouts
import AuthLayout from "../components/layout/auth/AuthLayout";
import StudentLayout from "../components/layout/student/StudentLayout";
import InstructorLayout from "../components/layout/instructor/InstructorLayout";
import SuperAdminLayout from "../components/layout/superadmin/SuperAdminLayout";

// shared pages
import Home from "../pages/shared/home/Home";
import About from "../pages/shared/about/About";
import CoursesPage from "../pages/shared/courses/Courses";
import PreviewAll from "../pages/shared/careerPath/CareerPath";
import Contact from "../pages/shared/contact/Contact";

// Auth
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import VerifyEmail from "../pages/auth/VerifyEmail";

// Student
import StudentDashboard from "../pages/student/Dashboard";
import MyCourses from "../pages/student/courses/MyCourses";
import CourseDetail from "../pages/student/courses/CourseDetail";
import LessonPlayer from "../pages/student/courses/LessonPlayer";
import StudentAssignments from "../pages/student/Assignments";
import StudentQuizzes from "../pages/student/Quizzes";
import StudentProjects from "../pages/student/Projects";
import StudentLiveClasses from "../pages/student/LiveClasses";
import StudentProgress from "../pages/student/LearningPath";
import StudentCertificates from "../pages/student/Certificates";
import StudentAchievements from "../pages/student/Achievements";
import StudentDiscussions from "../pages/student/Community";
import StudentMessages from "../pages/student/Messages";
import StudentCalendar from "../pages/student/Calendar";
import StudentBilling from "../pages/student/Billing";
import StudentReferral from "../pages/student/Referral";
import StudentCareer from "../pages/student/Career";
import StudentPortfolio from "../pages/student/Portfolio";
import StudentSupport from "../pages/student/Support";
import StudentProfile from "../pages/student/Profile";
import StudentNotifications from "../pages/student/Notifications";
import StudentSettings from "../pages/student/Settings";
import StudentResources from "../pages/student/Resources";

// Instructor
import InstructorDashboard from "../pages/instructor/Dashboard";
import Courses from "../pages/instructor/courses/Courses";
import CreateCourse from "../pages/instructor/courses/CreateCourse";
import CourseBuilder from "../pages/instructor/courses/CourseBuilder";
import EditCourse from "../pages/instructor/courses/EditCourse";
import InstructorStudents from "../pages/instructor/Students";
import InstructorAssignments from "../pages/instructor/Assignments";
import InstructorQuizzes from "../pages/instructor/Quizzes";
import InstructorProjects from "../pages/instructor/Projects";
import InstructorLiveClasses from "../pages/instructor/LiveClasses";
import InstructorDiscussions from "../pages/instructor/Discussions";
import InstructorAnnouncements from "../pages/instructor/Announcements";
import InstructorCertificates from "../pages/instructor/Certificates";
import InstructorEarnings from "../pages/instructor/Earnings";
import InstructorAnalytics from "../pages/instructor/Analytics";
import InstructorReviews from "../pages/instructor/Reviews";
import InstructorAI from "../pages/instructor/AIAssistant";
import InstructorReferral from "../pages/instructor/Referral";
import InstructorMessages from "../pages/instructor/Messages";
import InstructorProfile from "../pages/instructor/Profile";
import InstructorNotifications from "../pages/instructor/Notifications";
import InstructorSettings from "../pages/instructor/Settings";
import InstructorResources from "../pages/instructor/Resources";
import InstructorCalendar from "../pages/instructor/Calendar";

// Super Admin
import AdminDashboard from "../pages/superadmin/Dashboard";
import AdminUsers from "../pages/superadmin/users/Users";
import AdminUserDetail from "../pages/superadmin/users/UserDetail";
import AdminInstructors from "../pages/superadmin/instructors/Instructors";
import AdminInstructorDetail from "../pages/superadmin/instructors/InstructorDetail";
import AdminStudents from "../pages/superadmin/students/Students";
import AdminStudentDetail from "../pages/superadmin/students/StudentDetail";
import AdminCourses from "../pages/superadmin/courses/Courses";
import AdminCourseDetail from "../pages/superadmin/courses/CourseDetail";
import AdminPayments from "../pages/superadmin/payments/Payments";
import AdminFinancial from "../pages/superadmin/payments/Financial";
import AdminAnalytics from "../pages/superadmin/Analytics";
import AdminReports from "../pages/superadmin/Reports";
import AdminCertificates from "../pages/superadmin/Certificates";
import AdminContent from "../pages/superadmin/Content";
import AdminCommunity from "../pages/superadmin/Community";
import AdminSupport from "../pages/superadmin/Support";
import AdminRoles from "../pages/superadmin/Roles";
import AdminAudit from "../pages/superadmin/AuditLogs";
import AdminIntegrations from "../pages/superadmin/Integrations";
import AdminAI from "../pages/superadmin/AIManagement";
import AdminSettings from "../pages/superadmin/Settings";
import AdminLiveClasses from "../pages/superadmin/LiveClasses";
import AdminLearningPaths from "../pages/superadmin/LearningPaths";
import AdminQuizzes from "../pages/superadmin/Quizzes";
import AdminAssignments from "../pages/superadmin/Assignments";
import AdminProjects from "../pages/superadmin/Projects";
import AdminReviews from "../pages/superadmin/Reviews";
import AdminCommunication from "../pages/superadmin/Communication";
import AdminNotifications from "../pages/superadmin/Notifications";

const router = createBrowserRouter([
  // ── shared routes (default home) ───────────────────────
  {
    path: "/",
    children: [
      { index: true, element: <Home /> },                 // default page
      { path: "about", element: <About /> },
      { path: "courses", element: <CoursesPage /> },
      { path: "PreviewAll", element: <PreviewAll /> },
      { path: "contact", element: <Contact /> },
    ],
  },

  // ── Auth (guest only) ─────────────────────────────────
  {
    path: "/",
    element: <GuestRoute><AuthLayout /></GuestRoute>,
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "reset-password", element: <ResetPassword /> },
      { path: "verify-email", element: <VerifyEmail /> },
    ],
  },

  // ── Student ───────────────────────────────────────────
  {
    path: "/student",
    element: <ProtectedRoute role="student"><StudentLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <StudentDashboard /> },
      { path: "courses", element: <MyCourses /> },
      { path: "courses/:id", element: <CourseDetail /> },
      { path: "courses/:id/lesson/:lessonId", element: <LessonPlayer /> },
      { path: "assignments", element: <StudentAssignments /> },
      { path: "quizzes", element: <StudentQuizzes /> },
      { path: "projects", element: <StudentProjects /> },
      { path: "live-classes", element: <StudentLiveClasses /> },
      { path: "learning-path", element: <StudentProgress /> },
      { path: "certificates", element: <StudentCertificates /> },
      { path: "achievements", element: <StudentAchievements /> },
      { path: "community", element: <StudentDiscussions /> },
      { path: "messages", element: <StudentMessages /> },
      { path: "calendar", element: <StudentCalendar /> },
      { path: "billing", element: <StudentBilling /> },
      { path: "referral", element: <StudentReferral /> },
      { path: "career", element: <StudentCareer /> },
      { path: "portfolio", element: <StudentPortfolio /> },
      { path: "support", element: <StudentSupport /> },
      { path: "profile", element: <StudentProfile /> },
      { path: "notifications", element: <StudentNotifications /> },
      { path: "settings", element: <StudentSettings /> },
      { path: "resources", element: <StudentResources /> },
    ],
  },

  // ── Instructor ────────────────────────────────────────
  {
    path: "/instructor",
    element: <ProtectedRoute role="instructor"><InstructorLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <InstructorDashboard /> },
      { path: "courses", element: <Courses /> },
      { path: "courses/create", element: <CreateCourse /> },
      { path: "courses/:id/build", element: <CourseBuilder /> },
      { path: "courses/:id/edit", element: <EditCourse /> },
      { path: "students", element: <InstructorStudents /> },
      { path: "assignments", element: <InstructorAssignments /> },
      { path: "quizzes", element: <InstructorQuizzes /> },
      { path: "projects", element: <InstructorProjects /> },
      { path: "live-classes", element: <InstructorLiveClasses /> },
      { path: "discussions", element: <InstructorDiscussions /> },
      { path: "announcements", element: <InstructorAnnouncements /> },
      { path: "certificates", element: <InstructorCertificates /> },
      { path: "earnings", element: <InstructorEarnings /> },
      { path: "analytics", element: <InstructorAnalytics /> },
      { path: "reviews", element: <InstructorReviews /> },
      { path: "ai", element: <InstructorAI /> },
      { path: "referral", element: <InstructorReferral /> },
      { path: "messages", element: <InstructorMessages /> },
      { path: "profile", element: <InstructorProfile /> },
      { path: "notifications", element: <InstructorNotifications /> },
      { path: "settings", element: <InstructorSettings /> },
      { path: "resources", element: <InstructorResources /> },
      { path: "calendar", element: <InstructorCalendar /> },
    ],
  },

  // ── Super Admin ───────────────────────────────────────
  {
    path: "/admin",
    element: <ProtectedRoute role="super_admin"><SuperAdminLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "users", element: <AdminUsers /> },
      { path: "users/:id", element: <AdminUserDetail /> },
      { path: "instructors", element: <AdminInstructors /> },
      { path: "instructors/:id", element: <AdminInstructorDetail /> },
      { path: "students", element: <AdminStudents /> },
      { path: "students/:id", element: <AdminStudentDetail /> },
      { path: "courses", element: <AdminCourses /> },
      { path: "courses/:id", element: <AdminCourseDetail /> },
      { path: "live-classes", element: <AdminLiveClasses /> },
      { path: "learning-paths", element: <AdminLearningPaths /> },
      { path: "assignments", element: <AdminAssignments /> },
      { path: "quizzes", element: <AdminQuizzes /> },
      { path: "projects", element: <AdminProjects /> },
      { path: "payments", element: <AdminPayments /> },
      { path: "financial", element: <AdminFinancial /> },
      { path: "analytics", element: <AdminAnalytics /> },
      { path: "reports", element: <AdminReports /> },
      { path: "certificates", element: <AdminCertificates /> },
      { path: "content", element: <AdminContent /> },
      { path: "community", element: <AdminCommunity /> },
      { path: "communication", element: <AdminCommunication /> },
      { path: "reviews", element: <AdminReviews /> },
      { path: "support", element: <AdminSupport /> },
      { path: "roles", element: <AdminRoles /> },
      { path: "audit", element: <AdminAudit /> },
      { path: "integrations", element: <AdminIntegrations /> },
      { path: "ai", element: <AdminAI /> },
      { path: "notifications", element: <AdminNotifications /> },
      { path: "settings", element: <AdminSettings /> },
    ],
  },

  // ── Fallback ──────────────────────────────────────────
  // Unknown routes:
  // - If logged in, you might want to redirect based on role.
  // - For now, sending unknown paths to home; adjust if you prefer /login.
  { path: "*", element: <Navigate to="/" replace /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}