import { useEffect, useState } from "react";
import {
  getAnalyticsOverview,
  getRevenueAnalytics,
  getStudentAnalytics,
} from "../../services/instructor/analyticsService";
import AreaChart from "../../components/charts/AreaChart";
import BarChart from "../../components/charts/BarChart";
import { formatNaira } from "../../utils/formatCurrency";
import { SkeletonCard } from "../../components/common/Skeleton";

export default function Analytics() {
  const [overview, setOverview] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAnalyticsOverview(),
      getRevenueAnalytics(),
      getStudentAnalytics(),
    ])
      .then(([o, r, s]) => {
        setOverview(o.data.data);
        setRevenue(r.data.data?.monthly || []);
        setStudents(s.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );

  const revenueChart = revenue.map((m) => ({
    name: `${m._id?.month}/${m._id?.year}`,
    revenue: m.revenue,
  }));

  const studentChart = students.map((m) => ({
    name: `${m._id?.month}/${m._id?.year}`,
    students: m.count,
  }));

  return (
    <div className="space-y-5 fi">
      <h1 className="dsp text-xl font-bold text-text">Analytics</h1>

      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Total Students",
            value: overview?.totalStudents || 0,
            color: "#818CF8",
          },
          {
            label: "Avg Rating",
            value: overview?.averageRating || "N/A",
            color: "#FBBF24",
          },
          {
            label: "Enrollments",
            value: overview?.totalEnrollments || 0,
            color: "#34D399",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-surface border border-border rounded-2xl p-4 text-center"
          >
            <div className="dsp text-xl font-extrabold" style={{ color }}>
              {value}
            </div>
            <div className="text-xs text-muted mt-1">{label}</div>
          </div>
        ))}
      </div>

      {revenueChart.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-4">
          <h2 className="dsp text-sm font-bold text-text mb-4">
            Revenue Trend
          </h2>
          <AreaChart
            data={revenueChart}
            xKey="name"
            areas={[{ key: "revenue", color: "#FB923C", name: "Revenue" }]}
            height={200}
          />
        </div>
      )}

      {studentChart.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-4">
          <h2 className="dsp text-sm font-bold text-text mb-4">
            Student Enrollments
          </h2>
          <BarChart
            data={studentChart}
            xKey="name"
            bars={[{ key: "students", color: "#818CF8", name: "Students" }]}
            height={200}
          />
        </div>
      )}
    </div>
  );
}
