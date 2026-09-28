import { useEffect, useState } from "react";
import { getMyStudents } from "../../services/instructor/studentService";
import SearchBar from "../../components/common/SearchBar";
import Avatar from "../../components/common/Avatar";
import EmptyState from "../../components/common/EmptyState";
import { SkeletonCard } from "../../components/common/Skeleton";
import ProgressBar from "../../components/common/ProgressBar";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchStudents = async () => {
      try {
        setLoading(true);

        const response = await getMyStudents({
          search: search.trim(),
        });

        if (mounted) {
          setStudents(response?.data?.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch students:", error);

        if (mounted) {
          setStudents([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchStudents();

    return () => {
      mounted = false;
    };
  }, [search]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-text">My Students</h1>
          <p className="text-sm text-muted mt-1">
            View and track students enrolled in your courses.
          </p>
        </div>

        <SearchBar
          onSearch={setSearch}
          placeholder="Search students..."
        />

        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">My Students</h1>
        <p className="text-sm text-muted mt-1">
          View and track students enrolled in your courses.
        </p>
      </div>

      {/* Search */}
      <SearchBar
        onSearch={setSearch}
        placeholder="Search students..."
      />

      {/* Students */}
      {students.length === 0 ? (
        <EmptyState
          icon="👥"
          title={search ? "No students found" : "No students yet"}
          message={
            search
              ? "No students match your search."
              : "Students will appear here once they enroll in your courses."
          }
        />
      ) : (
        <div className="space-y-3">
          {students.map((enrollment) => {
            const student = enrollment?.student;

            if (!student) {
              return null;
            }

            const progress = Math.min(
              100,
              Math.max(0, Number(enrollment?.progress) || 0)
            );

            const studentName =
              `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
              "Unnamed Student";

            return (
              <div
                key={enrollment._id}
                className="bg-surface border border-border rounded-2xl p-4 fi"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <Avatar user={student} size="md" />

                  {/* Student information */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text truncate">
                      {studentName}
                    </p>

                    {student.email && (
                      <p className="text-xs text-muted truncate mb-2">
                        {student.email}
                      </p>
                    )}

                    {enrollment.course?.title && (
                      <p className="text-xs text-muted truncate mb-2">
                        {enrollment.course.title}
                      </p>
                    )}

                    <ProgressBar
                      value={progress}
                      max={100}
                      height="xs"
                    />
                  </div>

                  {/* Progress percentage */}
                  <span className="text-xs font-semibold text-accent shrink-0">
                    {progress}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
