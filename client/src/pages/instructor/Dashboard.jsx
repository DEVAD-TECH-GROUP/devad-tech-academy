import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Hand,
  Plus,
  BookOpen,
  Users,
  ClipboardList,
  Radio,
  Star,
  Wallet,
  User,
  Bot,
} from "lucide-react";

import useAuthStore from "../../store/authStore";
import {
  getDashboardStats,
  getDashboardActivity,
  getDashboardCalendar,
} from "../../services/instructor/dashboardService";
import { SkeletonCard } from "../../components/common/Skeleton";
import { formatNaira } from "../../utils/formatCurrency";
import { formatDate, formatTime } from "../../utils/formatDate";

export default function InstructorDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [calendar, setCalendar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getDashboardActivity(),
      getDashboardCalendar(),
    ])
      .then(([s, a, c]) => {
        setStats(s.data.data);
        setActivity(a.data.data);
        setCalendar(c.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  const s = stats || {};

  const statCards = [
    {
      icon: BookOpen,
      label: "Total Courses",
      value: s.totalCourses || 0,
      color: "#FB923C",
    },
    {
      icon: Users,
      label: "Total Students",
      value: s.totalStudents || 0,
      color: "#818CF8",
    },
    {
      icon: ClipboardList,
      label: "Pending Submissions",
      value: s.pendingSubmissions || 0,
      color: "#FBBF24",
    },
    {
      icon: Radio,
      label: "Upcoming Classes",
      value: s.upcomingClasses || 0,
      color: "#34D399",
    },
    {
      icon: Star,
      label: "Total Reviews",
      value: s.totalReviews || 0,
      color: "#F472B6",
    },
    {
      icon: Wallet,
      label: "Total Revenue",
      value: formatNaira(s.totalRevenue || 0),
      color: "#34D399",
    },
  ];

  const quickActions = [
    {
      icon: BookOpen,
      label: "Courses",
      path: "/instructor/courses",
    },
    {
      icon: Users,
      label: "Students",
      path: "/instructor/students",
    },
    {
      icon: ClipboardList,
      label: "Assignments",
      path: "/instructor/assignments",
    },
    {
      icon: Wallet,
      label: "Earnings",
      path: "/instructor/earnings",
    },
    {
      icon: Bot,
      label: "AI Assistant",
      path: "/instructor/ai",
    },
  ];

  return (
    <div className="space-y-5 fi">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="dsp text-xl font-bold text-text flex items-center gap-2">
            Hey {user?.firstName}
            <Hand
              size={20}
              strokeWidth={1.8}
              className="text-orange"
            />
          </h1>

          <p className="text-muted text-sm mt-0.5">
            Here's what's happening with your courses
          </p>
        </div>

        <button
          onClick={() =>
            navigate("/instructor/courses/create")
          }
          className="
            bg-orange hover:bg-orange/90
            text-white text-xs font-semibold
            px-4 py-2.5 rounded-xl
            transition flex items-center gap-1.5
          "
        >
          <Plus size={15} strokeWidth={2} />
          New Course
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {statCards.map(
          ({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              className="
                bg-surface
                border border-border
                rounded-2xl p-4
              "
            >
              <div className="mb-2">
                <Icon
                  size={22}
                  strokeWidth={1.8}
                  style={{ color }}
                />
              </div>

              <div
                className="dsp text-xl font-extrabold"
                style={{ color }}
              >
                {value}
              </div>

              <div className="text-xs text-muted mt-1">
                {label}
              </div>
            </div>
          )
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent enrollments */}
        <div className="bg-surface border border-border rounded-2xl p-4">
          <h2 className="dsp text-sm font-bold text-text mb-3">
            Recent Enrollments
          </h2>

          {activity?.recentEnrollments?.length > 0 ? (
            activity.recentEnrollments.map((e) => (
              <div
                key={e._id}
                className="
                  flex items-center gap-3
                  py-2.5
                  border-b border-border/50
                  last:border-0
                "
              >
                <div
                  className="
                    w-8 h-8 rounded-full
                    bg-orange/20
                    flex items-center justify-center
                    shrink-0
                  "
                >
                  <User
                    size={15}
                    strokeWidth={1.8}
                    className="text-orange"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text truncate">
                    {e.student?.firstName}{" "}
                    {e.student?.lastName}
                  </p>

                  <p className="text-[10px] text-muted truncate">
                    {e.course?.title}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted text-center py-6">
              No recent enrollments
            </p>
          )}
        </div>

        {/* Upcoming classes */}
        <div className="bg-surface border border-border rounded-2xl p-4">
          <h2 className="dsp text-sm font-bold text-text mb-3">
            Upcoming Live Classes
          </h2>

          {calendar.length > 0 ? (
            calendar.map((c) => (
              <div
                key={c._id}
                className="
                  flex items-center gap-3
                  py-2.5
                  border-b border-border/50
                  last:border-0
                "
              >
                <div className="w-2 h-2 rounded-full bg-green shrink-0" />

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text truncate">
                    {c.title}
                  </p>

                  <p className="text-[10px] text-muted">
                    {formatDate(c.scheduledAt)} ·{" "}
                    {formatTime(c.scheduledAt)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted text-center py-6">
              No upcoming classes
            </p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-surface border border-border rounded-2xl p-4">
        <h2 className="dsp text-sm font-bold text-text mb-3">
          Quick Actions
        </h2>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {quickActions.map(
            ({ icon: Icon, label, path }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className="
                  bg-surfaceHigh
                  border border-border
                  rounded-xl py-3
                  flex flex-col items-center
                  gap-1.5
                  text-xs text-muted
                  hover:text-text
                  hover:border-orange/40
                  transition
                "
              >
                <Icon
                  size={20}
                  strokeWidth={1.8}
                  className="text-orange"
                />

                {label}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}