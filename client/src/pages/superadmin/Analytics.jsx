import { useEffect, useState } from "react";
import {
  getUserAnalytics,
  getEnrollmentAnalytics,
  getRevenueAnalytics,
} from "../../services/superadmin/analyticsService";
import BarChart from "../../components/charts/BarChart";
import AreaChart from "../../components/charts/AreaChart";
import PieChart from "../../components/charts/PieChart";
import { SkeletonCard } from "../../components/common/Skeleton";

export default function AdminAnalytics() {
  const [users, setUsers] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getUserAnalytics(), getEnrollmentAnalytics(), getRevenueAnalytics()])
      .then(([u, e, r]) => {
        setUsers(u.data.data);
        setEnrollments(e.data.data?.monthly || []);
        setRevenue(r.data.data?.monthly || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>;

  const enrollmentChart = enrollments.map((m) => ({ name: `${m._id?.month}/${m._id?.year}`, count: m.count }));
  const revenueChart = revenue.map((m) => ({ name: `${m._id?.month}/${m._id?.year}`, revenue: m.revenue }));
  const userPieData = [
    { name: "Students", value: users?.students || 0, color: "#818CF8" },
    { name: "Instructors", value: users?.instructors || 0, color: "#FB923C" },
  ];

  return (
    <div className="space-y-5 fi">
      <h1 className="dsp text-xl font-bold text-text">Analytics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Users", value: users?.total || 0, color: "#818CF8" },
          { label: "Students", value: users?.students || 0, color: "#34D399" },
          { label: "Instructors", value: users?.instructors || 0, color: "#FB923C" },
          { label: "New This Month", value: users?.newThisMonth || 0, color: "#FBBF24" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-surface border border-border rounded-2xl p-4">
            <div className="dsp text-xl font-extrabold" style={{ color }}>{value}</div>
            <div className="text-xs text-muted mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-2xl p-4">
          <h2 className="dsp text-sm font-bold text-text mb-4">User Distribution</h2>
          <PieChart data={userPieData} height={200} />
        </div>
        <div className="bg-surface border border-border rounded-2xl p-4">
          <h2 className="dsp text-sm font-bold text-text mb-4">Monthly Enrollments</h2>
          <BarChart data={enrollmentChart} xKey="name" bars={[{ key: "count", color: "#818CF8", name: "Enrollments" }]} height={200} />
        </div>
      </div>

      {revenueChart.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-4">
          <h2 className="dsp text-sm font-bold text-text mb-4">Revenue Trend</h2>
          <AreaChart data={revenueChart} xKey="name" areas={[{ key: "revenue", color: "#34D399", name: "Revenue" }]} height={220} />
        </div>
      )}
    </div>
  );
}
