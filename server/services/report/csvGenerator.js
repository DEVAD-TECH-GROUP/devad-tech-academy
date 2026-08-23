import { Parser } from "json2csv";
import { formatDate } from "../../utils/dateHelpers.js";
import { formatNaira } from "../../utils/formatCurrency.js";

// ── Generate student CSV ──────────────────────────────────
export const generateStudentCSV = (data) => {
  const fields = [
    { label: "Name", value: "name" },
    { label: "Email", value: "email" },
    { label: "Role", value: "role" },
    { label: "Status", value: "status" },
    { label: "Courses Enrolled", value: "courses" },
    { label: "Joined", value: "joined" },
    { label: "Last Login", value: "lastLogin" },
  ];

  const rows = data.students.map((student) => ({
    name: student.fullName || "N/A",
    email: student.email || "N/A",
    role: student.role || "N/A",
    status: student.status || "N/A",
    courses: student.totalCoursesEnrolled || 0,
    joined: formatDate(student.createdAt),
    lastLogin: student.lastLogin
      ? formatDate(student.lastLogin)
      : "Never",
  }));

  const parser = new Parser({ fields });
  return parser.parse(rows);
};

// ── Generate financial CSV ────────────────────────────────
export const generateFinancialCSV = (data) => {
  const fields = [
    { label: "Invoice ID", value: "invoiceId" },
    { label: "Student", value: "student" },
    { label: "Amount", value: "amount" },
    { label: "Gateway", value: "gateway" },
    { label: "Status", value: "status" },
    { label: "Date", value: "date" },
  ];

  const rows = data.transactions.map((txn) => ({
    invoiceId: txn.invoiceId || "N/A",
    student: txn.studentName || "N/A",
    amount: formatNaira(txn.finalAmount),
    gateway: txn.gateway || "N/A",
    status: txn.status || "N/A",
    date: formatDate(txn.createdAt),
  }));

  const parser = new Parser({ fields });
  return parser.parse(rows);
};

// ── Generate course CSV ───────────────────────────────────
export const generateCourseCSV = (data) => {
  const fields = [
    { label: "Title", value: "title" },
    { label: "Instructor", value: "instructor" },
    { label: "Category", value: "category" },
    { label: "Students", value: "students" },
    { label: "Rating", value: "rating" },
    { label: "Revenue", value: "revenue" },
    { label: "Status", value: "status" },
  ];

  const rows = data.courses.map((course) => ({
    title: course.title || "N/A",
    instructor: course.instructorName || "N/A",
    category: course.categoryName || "N/A",
    students: course.totalStudents || 0,
    rating: course.averageRating || 0,
    revenue: formatNaira(course.totalRevenue || 0),
    status: course.status || "N/A",
  }));

  const parser = new Parser({ fields });
  return parser.parse(rows);
};