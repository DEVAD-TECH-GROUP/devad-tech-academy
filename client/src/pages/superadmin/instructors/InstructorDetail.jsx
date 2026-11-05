import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { getInstructor } from "../../../services/superadmin/instructorService";

import Avatar from "../../../components/common/Avatar";
import Badge from "../../../components/common/Badge";
import { formatNaira } from "../../../utils/formatCurrency";
import { SkeletonCard } from "../../../components/common/Skeleton";

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getStatusVariant = (status) => {
  if (["approved", "published", "active", "success"].includes(status)) {
    return "green";
  }

  if (["pending", "draft", "under-review"].includes(status)) {
    return "yellow";
  }

  if (["rejected", "suspended", "inactive", "failed"].includes(status)) {
    return "red";
  }

  return "default";
};

function Section({ title, subtitle, children }) {
  return (
    <section className="bg-surface border border-border rounded-2xl p-5 space-y-4">
      <div>
        <h2 className="dsp text-base font-bold text-text">{title}</h2>
        {subtitle && <p className="text-xs text-muted mt-1">{subtitle}</p>}
      </div>

      {children}
    </section>
  );
}

function Detail({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className="text-sm text-text break-words">{value || "Not provided"}</p>
    </div>
  );
}

function EmptyState({ message }) {
  return <p className="text-sm text-muted text-center py-5">{message}</p>;
}

export default function InstructorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchInstructor = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getInstructor(id);

        if (!cancelled) {
          setData(response.data.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Unable to retrieve instructor details.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchInstructor();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4 fi">
        {[...Array(4)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-6 text-center space-y-3">
        <p className="text-sm text-muted">{error || "Instructor not found"}</p>

        <button
          onClick={() => navigate("/admin/instructors")}
          className="text-sm text-primary hover:underline"
        >
          Back to instructors
        </button>
      </div>
    );
  }

  const user = data.user || {};
  const stats = data.stats || {};

  const courses = data.courses || [];
  const reviews = data.reviews || [];

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

  const statCards = [
    {
      label: "Total Courses",
      value: stats.totalCourses ?? data.totalCourses ?? 0,
      color: "#818CF8",
    },
    {
      label: "Total Students",
      value: stats.totalStudents ?? data.totalStudents ?? 0,
      color: "#34D399",
    },
    {
      label: "Total Revenue",
      value: formatNaira(stats.totalRevenue ?? data.totalRevenue ?? 0),
      color: "#FBBF24",
    },
    {
      label: "Average Rating",
      value:
        stats.averageRating || data.averageRating
          ? Number(stats.averageRating ?? data.averageRating).toFixed(1)
          : "N/A",
      color: "#FB923C",
    },
    {
      label: "Total Reviews",
      value: stats.totalReviews ?? data.totalReviews ?? 0,
      color: "#60A5FA",
    },
    {
      label: "Live Classes",
      value: stats.totalLiveClasses ?? data.totalLiveClasses ?? 0,
      color: "#C084FC",
    },
    {
      label: "Assignments Graded",
      value: stats.totalAssignmentsGraded ?? data.totalAssignmentsGraded ?? 0,
      color: "#F472B6",
    },
    {
      label: "XP Points",
      value: stats.xpPoints ?? data.xpPoints ?? 0,
      color: "#2DD4BF",
    },
  ];

  const education = data.education || [];
  const certifications = data.certifications || [];
  const expertise = data.expertise || [];

  const socialLinks = user.socialLinks || {};

  return (
    <div className="space-y-5 fi">
      {/* BACK NAVIGATION */}
      <div>
        <button
          onClick={() => navigate("/admin/instructors")}
          className="text-sm text-muted hover:text-text transition"
        >
          ← Back to instructors
        </button>
      </div>

      {/* PROFILE HEADER */}
      <div className="bg-surface border border-border rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Avatar user={user} size="lg" />

          <div className="flex-1 min-w-0">
            <h1 className="dsp text-xl font-bold text-text">
              {fullName || "Unnamed Instructor"}
            </h1>

            <p className="text-sm text-muted mt-1">
              {user.headline || "Instructor"}
            </p>

            <p className="text-xs text-muted mt-1">{user.email}</p>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge variant={getStatusVariant(data.applicationStatus)}>
                {data.applicationStatus || "Unknown"}
              </Badge>

              <Badge variant={getStatusVariant(user.status)}>
                {user.status || "Unknown account status"}
              </Badge>

              <Badge variant="default">{user.role || "User"}</Badge>
            </div>
          </div>

          <div className="text-xs text-muted sm:text-right">
            <p>Joined platform</p>
            <p className="text-text font-medium mt-1">
              {formatDate(user.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* PERFORMANCE STATISTICS */}
      <div>
        <h2 className="dsp text-base font-bold text-text mb-3">
          Performance Overview
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="bg-surface border border-border rounded-xl p-4"
            >
              <p
                className="dsp text-xl font-bold"
                style={{ color: stat.color }}
              >
                {stat.value}
              </p>

              <p className="text-xs text-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PERSONAL PROFILE */}
      <Section
        title="Personal Profile"
        subtitle="Instructor contact and personal information"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Detail label="First Name" value={user.firstName} />
          <Detail label="Last Name" value={user.lastName} />
          <Detail label="Email" value={user.email} />
          <Detail label="Phone" value={user.phone} />
          <Detail label="Location" value={user.location} />
          <Detail label="Professional Headline" value={user.headline} />
        </div>

        {user.bio && (
          <div className="bg-surfaceHigh rounded-xl p-4">
            <p className="text-xs text-muted mb-2">Biography</p>
            <p className="text-sm text-text leading-relaxed whitespace-pre-wrap">
              {user.bio}
            </p>
          </div>
        )}
      </Section>

      {/* ACCOUNT INFORMATION */}
      <Section
        title="Account & Verification"
        subtitle="Account security and verification status"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
          <Detail label="Account Role" value={user.role} />
          <Detail label="Account Status" value={user.status} />

          <Detail
            label="Email Verified"
            value={user.isEmailVerified ? "Yes" : "No"}
          />

          <Detail
            label="Phone Verified"
            value={user.isPhoneVerified ? "Yes" : "No"}
          />

          <Detail
            label="Google Authentication"
            value={user.isGoogleAuth ? "Enabled" : "Not enabled"}
          />

          <Detail
            label="Two-Factor Authentication"
            value={user.isTwoFactorEnabled ? "Enabled" : "Disabled"}
          />

          <Detail label="Last Login" value={formatDate(user.lastLogin)} />

          <Detail label="Account Created" value={formatDate(user.createdAt)} />
        </div>
      </Section>

      {/* INSTRUCTOR APPLICATION */}
      <Section
        title="Instructor Application"
        subtitle="Application information and professional background"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Detail label="Application Status" value={data.applicationStatus} />

          <Detail
            label="Application Date"
            value={formatDate(data.applicationDate)}
          />

          <Detail label="Application Email" value={data.applicationEmail} />

          <Detail label="Application Phone" value={data.applicationPhone} />

          <Detail
            label="Years of Experience"
            value={data.experience != null ? `${data.experience} years` : null}
          />

          <Detail label="Teaching Experience" value={data.teachingExperience} />

          <Detail label="Preferred Course" value={data.course} />

          <Detail label="Availability" value={data.availability} />
        </div>

        {expertise.length > 0 && (
          <div>
            <p className="text-xs text-muted mb-2">Areas of Expertise</p>

            <div className="flex flex-wrap gap-2">
              {expertise.map((item, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 rounded-full bg-surfaceHigh text-xs text-text"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.coverLetter && (
          <div className="bg-surfaceHigh rounded-xl p-4">
            <p className="text-xs text-muted mb-2">Application Cover Letter</p>

            <p className="text-sm text-text whitespace-pre-wrap leading-relaxed">
              {data.coverLetter}
            </p>
          </div>
        )}

        {data.cv?.url && (
          <div>
            <p className="text-xs text-muted mb-2">Curriculum Vitae</p>

            <a
              href={data.cv.url}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-primary hover:underline"
            >
              View CV ↗
            </a>

            {data.cv.originalName && (
              <p className="text-xs text-muted mt-1">{data.cv.originalName}</p>
            )}
          </div>
        )}

        {data.approvedAt && (
          <div className="bg-surfaceHigh rounded-xl p-4 space-y-2">
            <p className="text-sm font-semibold text-text">
              Approval Information
            </p>

            <Detail label="Approved Date" value={formatDate(data.approvedAt)} />

            <Detail
              label="Approved By"
              value={
                data.approvedBy
                  ? `${data.approvedBy.firstName || ""} ${
                      data.approvedBy.lastName || ""
                    }`.trim()
                  : "Not available"
              }
            />
          </div>
        )}

        {data.rejectionReason && (
          <div className="bg-surfaceHigh rounded-xl p-4">
            <p className="text-xs text-muted mb-2">Rejection Reason</p>

            <p className="text-sm text-text">{data.rejectionReason}</p>
          </div>
        )}
      </Section>

      {/* EDUCATION */}
      <Section
        title="Education & Certifications"
        subtitle="Instructor qualifications"
      >
        <div>
          <p className="text-sm font-semibold text-text mb-3">Education</p>

          {education.length === 0 ? (
            <EmptyState message="No education records provided." />
          ) : (
            <div className="space-y-3">
              {education.map((item, index) => (
                <div key={index} className="bg-surfaceHigh rounded-xl p-3">
                  <p className="text-sm font-semibold text-text">
                    {item.degree || "Qualification"}
                  </p>

                  <p className="text-xs text-muted mt-1">
                    {item.institution || "Institution not provided"}
                  </p>

                  <p className="text-xs text-muted mt-1">{item.year || ""}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-semibold text-text mb-3">Certifications</p>

          {certifications.length === 0 ? (
            <EmptyState message="No certifications provided." />
          ) : (
            <div className="space-y-3">
              {certifications.map((item, index) => (
                <div
                  key={index}
                  className="bg-surfaceHigh rounded-xl p-3 flex flex-col sm:flex-row sm:justify-between gap-2"
                >
                  <div>
                    <p className="text-sm font-semibold text-text">
                      {item.name}
                    </p>

                    <p className="text-xs text-muted mt-1">
                      {item.issuer} {item.year && `• ${item.year}`}
                    </p>
                  </div>

                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      View Certificate ↗
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* COURSES */}
      <Section
        title={`Courses (${courses.length})`}
        subtitle="Courses created by this instructor"
      >
        {courses.length === 0 ? (
          <EmptyState message="This instructor has not created any courses yet." />
        ) : (
          <div className="space-y-3">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-surfaceHigh rounded-xl p-4 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-text">
                      {course.title}
                    </h3>

                    <p className="text-xs text-muted mt-1">
                      {course.subtitle || course.shortDescription}
                    </p>
                  </div>

                  <Badge variant={getStatusVariant(course.status)}>
                    {course.status || "Unknown"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Detail
                    label="Price"
                    value={
                      course.isFree
                        ? "Free"
                        : formatNaira(course.discountPrice ?? course.price ?? 0)
                    }
                  />

                  <Detail label="Students" value={course.totalStudents ?? 0} />

                  <Detail
                    label="Rating"
                    value={
                      course.averageRating
                        ? Number(course.averageRating).toFixed(1)
                        : "N/A"
                    }
                  />

                  <Detail label="Reviews" value={course.totalReviews ?? 0} />
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-muted">
                  <span>{course.level || "Beginner"}</span>

                  <span>{course.totalModules ?? 0} Modules</span>

                  <span>{course.totalLessons ?? 0} Lessons</span>

                  <span>Created {formatDate(course.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* STUDENT REVIEWS */}
      <Section
        title={`Student Reviews (${reviews.length})`}
        subtitle="The instructor's 10 most recent reviews"
      >
        {reviews.length === 0 ? (
          <EmptyState message="No student reviews available yet." />
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="bg-surfaceHigh rounded-xl p-4 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-text">
                      {review.student
                        ? `${review.student.firstName || ""} ${
                            review.student.lastName || ""
                          }`.trim()
                        : "Student"}
                    </p>

                    <p className="text-xs text-muted mt-1">
                      {review.course?.title || "Course"}
                    </p>
                  </div>

                  <div className="text-xs text-muted">
                    {formatDate(review.createdAt)}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-text">
                    ★ {review.rating}/5
                  </span>

                  {review.isVerified && <Badge variant="green">Verified</Badge>}

                  {review.isFlagged && <Badge variant="yellow">Flagged</Badge>}

                  {review.isRemoved && <Badge variant="red">Removed</Badge>}
                </div>

                {review.title && (
                  <p className="text-sm font-semibold text-text">
                    {review.title}
                  </p>
                )}

                <p className="text-sm text-muted leading-relaxed whitespace-pre-wrap">
                  {review.content}
                </p>

                {review.instructorReply?.content && (
                  <div className="border-l-2 border-primary pl-3 py-1">
                    <p className="text-xs font-semibold text-text mb-1">
                      Instructor Reply
                    </p>

                    <p className="text-sm text-muted">
                      {review.instructorReply.content}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* PROFESSIONAL LINKS */}
      <Section
        title="Professional Links"
        subtitle="Portfolio and professional social profiles"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Detail label="Portfolio" value={data.portfolio} />

          <Detail label="Website" value={socialLinks.website} />

          <Detail label="GitHub" value={socialLinks.github} />

          <Detail label="LinkedIn" value={socialLinks.linkedin} />

          <Detail label="Twitter" value={socialLinks.twitter} />
        </div>
      </Section>

      {/* ACCOUNT TIMESTAMPS */}
      <div className="text-xs text-muted flex flex-wrap justify-between gap-2 px-1 pb-3">
        <span>Instructor record created: {formatDate(data.createdAt)}</span>

        <span>Last updated: {formatDate(data.updatedAt)}</span>
      </div>
    </div>
  );
}
