import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getCourse,
  approveCourse,
  rejectCourse,
} from "../../../services/superadmin/courseService";
import Badge from "../../../components/common/Badge";
import { SkeletonCard } from "../../../components/common/Skeleton";
import { toast } from "react-hot-toast";

// Helpers
const formatNaira = (amount) => {
  if (amount === undefined || amount === null) return "Not specified";
  if (Number(amount) === 0) return "Free";
  return `₦${Number(amount).toLocaleString()}`;
};

const formatDate = (date) => {
  if (!date) return "Not available";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Not available";

  return parsed.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const displayValue = (value) => {
  if (value === undefined || value === null || value === "") {
    return "Not specified";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return value;
};

const getName = (person) => {
  if (!person) return "Not available";

  if (typeof person === "string") return person;

  return (
    [person.firstName, person.lastName].filter(Boolean).join(" ") ||
    person.name ||
    person.email ||
    "Not available"
  );
};

function Section({ title, description, children }) {
  return (
    <section className="bg-surface border border-border rounded-2xl p-5 space-y-4">
      <div>
        <h2 className="text-sm font-bold text-text">{title}</h2>
        {description && (
          <p className="text-xs text-muted mt-1">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function InfoItem({ label, value }) {
  if (value === undefined || value === null || value === "") return null;

  return (
    <div className="py-3 border-b border-border/50 last:border-0">
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className="text-sm text-text break-words">{displayValue(value)}</p>
    </div>
  );
}

function TagList({ items, emptyText = "None added" }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <p className="text-xs text-muted">{emptyText}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => {
        const value =
          typeof item === "string"
            ? item
            : item?.name || item?.title || item?.label;

        if (!value) return null;

        return (
          <span
            key={`${value}-${index}`}
            className="px-3 py-1.5 rounded-lg bg-accentDim text-accent text-xs font-medium"
          >
            {value}
          </span>
        );
      })}
    </div>
  );
}

function BulletList({ items, emptyText = "None added" }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <p className="text-xs text-muted">{emptyText}</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item, index) => {
        const value =
          typeof item === "string"
            ? item
            : item?.text || item?.title || item?.description || item?.name;

        if (!value) return null;

        return (
          <li key={index} className="flex gap-2 text-sm text-text">
            <span className="text-accent">•</span>
            <span>{value}</span>
          </li>
        );
      })}
    </ul>
  );
}

export default function AdminCourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(null);

  useEffect(() => {
    let active = true;

    setLoading(true);

    getCourse(id)
      .then((response) => {
        if (active) {
          setCourse(response.data.data);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch course:", error);
        if (active) toast.error("Failed to load course details");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const handleApprove = async () => {
    setActioning("approve");

    try {
      await approveCourse(id);

      setCourse((current) => ({
        ...current,
        status: "published",
      }));

      toast.success("Course approved successfully!");
    } catch (error) {
      console.error("Course approval failed:", error);
      toast.error("Failed to approve course");
    } finally {
      setActioning(null);
    }
  };

  const handleReject = async () => {
    setActioning("reject");

    try {
      await rejectCourse(id, "Does not meet quality standards");

      setCourse((current) => ({
        ...current,
        status: "rejected",
      }));

      toast.success("Course rejected");
    } catch (error) {
      console.error("Course rejection failed:", error);
      toast.error("Failed to reject course");
    } finally {
      setActioning(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (!course) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-10 text-center">
        <div className="text-4xl mb-3">📚</div>
        <h2 className="text-text font-semibold">Course not found</h2>
        <p className="text-sm text-muted mt-2">
          This course may have been removed or is unavailable.
        </p>
        <button
          onClick={() => navigate("/admin/courses")}
          className="mt-5 px-4 py-2 rounded-xl bg-accent text-white text-sm"
        >
          Back to courses
        </button>
      </div>
    );
  }

  const statusVariant =
    {
      published: "green",
      pending_review: "yellow",
      rejected: "red",
      draft: "default",
    }[course.status] || "default";

  // Course thumbnail relationship
  const thumbnail =
    course.thumbnail?.image?.url ||
    course.thumbnail?.url ||
    course.thumbnailUrl ||
    course.thumbnailImage?.url;

  // Instructor details
  const instructor = course.instructor;

  const instructorImage =
    instructor?.profileImage?.url ||
    instructor?.avatar?.url ||
    instructor?.profilePicture ||
    instructor?.avatar;

  // Pricing details
  const pricing = course.pricing || {};

  // Course statistics
  const stats = course.stats || {};

  // Course settings
  const settings = course.settings || {};

  // Preview video
  const previewVideo = course.previewVideo?.url || course.previewVideoUrl;

  // Approval information
  const approval = course.approval || {};

  return (
    <div className="space-y-6 fi max-w-5xl pb-10">
      {/* Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={() => navigate("/admin/courses")}
          className="text-sm text-muted hover:text-text transition"
        >
          ← Back to Courses
        </button>

        <div className="flex items-center gap-2">
          <Badge variant={statusVariant}>
            {course.status?.replaceAll("_", " ")}
          </Badge>

          {course.isFeatured && <Badge variant="accent">Featured</Badge>}
        </div>
      </div>

      {/* Course Hero */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        {thumbnail ? (
          <div className="w-full bg-black">
            <img
              src={thumbnail}
              alt={course.title || "Course thumbnail"}
              className="w-full max-h-[420px] object-cover"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          </div>
        ) : (
          <div className="h-56 bg-accentDim flex items-center justify-center">
            <div className="text-center">
              <span className="text-6xl">📚</span>
              <p className="text-xs text-muted mt-3">
                No course thumbnail uploaded
              </p>
            </div>
          </div>
        )}

        <div className="p-5 md:p-7 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant={statusVariant}>
              {course.status?.replaceAll("_", " ")}
            </Badge>

            <Badge variant="accent">{course.level}</Badge>

            {course.category?.name && (
              <Badge variant="default">{course.category.name}</Badge>
            )}
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text">
              {course.title}
            </h1>

            {course.subtitle && (
              <p className="text-base text-muted mt-2">{course.subtitle}</p>
            )}

            {course.shortDescription && (
              <p className="text-sm text-text/80 mt-3">
                {course.shortDescription}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
            <span>🌐 {course.language || "Language not specified"}</span>
            <span>📅 Created {formatDate(course.createdAt)}</span>
            <span>🔄 Updated {formatDate(course.updatedAt)}</span>
          </div>

          {course.thumbnail && (
            <div className="text-xs text-muted">
              Thumbnail: {course.thumbnail.title || "Course thumbnail"}
              {course.thumbnail.isActive === false && (
                <span className="text-red ml-2">Inactive</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Total Students",
            value: course.totalStudents ?? stats.totalStudents ?? 0,
            icon: "👨‍🎓",
          },
          {
            label: "Total Lessons",
            value: course.totalLessons ?? stats.totalLessons ?? 0,
            icon: "📖",
          },
          {
            label: "Average Rating",
            value: course.averageRating ?? stats.averageRating ?? "New",
            icon: "⭐",
          },
          {
            label: "Reviews",
            value: stats.totalReviews ?? course.totalReviews ?? 0,
            icon: "💬",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-surface border border-border rounded-xl p-4"
          >
            <div className="text-xl mb-2">{item.icon}</div>
            <p className="text-xl font-bold text-text">{item.value}</p>
            <p className="text-xs text-muted mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Course Description */}
      <Section title="Course Description">
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted mb-2">Full Description</p>
            <p className="text-sm text-text whitespace-pre-line leading-7">
              {course.description || "No full description provided."}
            </p>
          </div>

          <InfoItem label="Course Slug" value={course.slug} />
        </div>
      </Section>

      {/* Instructor */}
      <Section title="Instructor Information">
        <div className="flex items-center gap-4">
          {instructorImage ? (
            <img
              src={instructorImage}
              alt={getName(instructor)}
              className="w-16 h-16 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-accentDim flex items-center justify-center text-2xl">
              👤
            </div>
          )}

          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-text">
              {getName(instructor)}
            </h3>
            <p className="text-xs text-muted mt-1">
              {instructor?.email || "No email available"}
            </p>
            {instructor?.phone && (
              <p className="text-xs text-muted mt-1">{instructor.phone}</p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-x-6">
          <InfoItem label="First Name" value={instructor?.firstName} />
          <InfoItem label="Last Name" value={instructor?.lastName} />
          <InfoItem label="Email" value={instructor?.email} />
          <InfoItem label="Instructor ID" value={instructor?._id} />
        </div>
      </Section>

      {/* Category and classification */}
      <Section title="Course Classification">
        <div className="grid md:grid-cols-2 gap-x-6">
          <InfoItem label="Category" value={course.category?.name} />
          <InfoItem label="Category ID" value={course.category?._id} />
          <InfoItem label="Level" value={course.level} />
          <InfoItem label="Language" value={course.language} />
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted mb-2">Tags</p>
            <TagList items={course.tags} />
          </div>

          <div>
            <p className="text-xs text-muted mb-2">Technologies</p>
            <TagList items={course.technologies} />
          </div>
        </div>
      </Section>

      {/* Learning outcomes */}
      <Section
        title="Learning Outcomes"
        description="What students are expected to learn from this course."
      >
        <BulletList items={course.learningOutcomes} />
      </Section>

      {/* Prerequisites */}
      <Section
        title="Prerequisites"
        description="Requirements or knowledge students should have before enrolling."
      >
        <BulletList items={course.prerequisites} />
      </Section>

      {/* Pricing */}
      <Section title="Course Pricing">
        <div className="grid md:grid-cols-2 gap-x-6">
          <InfoItem label="Course Price" value={formatNaira(course.price)} />
          <InfoItem
            label="Pricing Amount"
            value={formatNaira(pricing.amount)}
          />
          <InfoItem
            label="Original Price"
            value={formatNaira(pricing.originalPrice)}
          />
          <InfoItem
            label="Discount Price"
            value={formatNaira(pricing.discountPrice)}
          />
          <InfoItem label="Currency" value={pricing.currency || "NGN"} />
          <InfoItem
            label="Installments Enabled"
            value={course.installments?.enabled}
          />
          <InfoItem
            label="Installment Amount"
            value={
              course.installments?.amount !== undefined
                ? formatNaira(course.installments.amount)
                : null
            }
          />
          <InfoItem
            label="Number of Installments"
            value={course.installments?.count}
          />
        </div>
      </Section>

      {/* Preview Video */}
      <Section
        title="Course Preview Video"
        description="The video prospective students can watch before enrolling."
      >
        {previewVideo ? (
          <div className="space-y-3">
            <video
              src={previewVideo}
              controls
              preload="metadata"
              className="w-full max-h-[400px] rounded-xl bg-black"
            />
            <a
              href={previewVideo}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-accent hover:underline break-all"
            >
              Open preview video
            </a>

            <InfoItem
              label="Video Duration"
              value={course.previewVideo?.duration}
            />
          </div>
        ) : (
          <p className="text-xs text-muted">No preview video uploaded.</p>
        )}
      </Section>

      {/* Thumbnail details */}
      <Section
        title="Thumbnail Information"
        description="Details from the associated CourseThumbnail record."
      >
        {course.thumbnail?.image?.url || thumbnail ? (
          <div className="space-y-3">
            <img
              src={course.thumbnail?.image?.url || thumbnail}
              alt={course.thumbnail?.title || course.title}
              className="w-full max-w-xl rounded-xl border border-border object-cover"
            />

            <div className="grid md:grid-cols-2 gap-x-6">
              <InfoItem
                label="Thumbnail Title"
                value={course.thumbnail?.title}
              />
              <InfoItem
                label="Thumbnail Category"
                value={course.thumbnail?.category?.name}
              />
              <InfoItem label="Active" value={course.thumbnail?.isActive} />
              <InfoItem
                label="Sort Order"
                value={course.thumbnail?.sortOrder}
              />
              <InfoItem
                label="Created At"
                value={formatDate(course.thumbnail?.createdAt)}
              />
            </div>

            <InfoItem
              label="Thumbnail Description"
              value={course.thumbnail?.description}
            />
          </div>
        ) : (
          <p className="text-xs text-muted">
            No thumbnail information available.
          </p>
        )}
      </Section>

      {/* Course settings */}
      <Section title="Course Settings">
        <div className="grid md:grid-cols-2 gap-x-6">
          <InfoItem label="Published" value={settings.isPublished} />
          <InfoItem label="Featured" value={course.isFeatured} />
          <InfoItem
            label="Certificate Enabled"
            value={settings.certificateEnabled}
          />
          <InfoItem
            label="Discussion Enabled"
            value={settings.discussionEnabled}
          />
          <InfoItem label="Allow Reviews" value={settings.allowReviews} />
          <InfoItem label="Allow Questions" value={settings.allowQuestions} />
        </div>
      </Section>

      {/* Live classes */}
      <Section
        title="Live Classes"
        description="Live class information attached to this course."
      >
        {Array.isArray(course.liveClasses) && course.liveClasses.length > 0 ? (
          <div className="space-y-3">
            {course.liveClasses.map((liveClass, index) => (
              <div
                key={liveClass._id || index}
                className="p-4 rounded-xl border border-border"
              >
                <h3 className="text-sm font-semibold text-text">
                  {liveClass.title || `Live Class ${index + 1}`}
                </h3>

                <div className="grid md:grid-cols-2 gap-x-6 mt-2">
                  <InfoItem label="Date" value={formatDate(liveClass.date)} />
                  <InfoItem label="Status" value={liveClass.status} />
                  <InfoItem label="Duration" value={liveClass.duration} />
                  <InfoItem
                    label="Meeting Link"
                    value={liveClass.meetingLink}
                  />
                </div>

                {liveClass.description && (
                  <p className="text-xs text-muted mt-2">
                    {liveClass.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted">
            No live classes added to this course.
          </p>
        )}
      </Section>

      {/* Approval and publication */}
      <Section title="Approval & Publication">
        <div className="grid md:grid-cols-2 gap-x-6">
          <InfoItem label="Current Status" value={course.status} />
          <InfoItem label="Approved By" value={getName(approval.approvedBy)} />
          <InfoItem
            label="Approved At"
            value={formatDate(approval.approvedAt)}
          />
          <InfoItem
            label="Published At"
            value={formatDate(course.publishedAt)}
          />
          <InfoItem
            label="Rejected At"
            value={formatDate(approval.rejectedAt)}
          />
          <InfoItem label="Rejection Reason" value={approval.rejectionReason} />
        </div>
      </Section>

      {/* Course identifiers */}
      <Section title="Course Record Information">
        <div className="grid md:grid-cols-2 gap-x-6">
          <InfoItem label="Course ID" value={course._id} />
          <InfoItem label="Slug" value={course.slug} />
          <InfoItem label="Created At" value={formatDate(course.createdAt)} />
          <InfoItem label="Last Updated" value={formatDate(course.updatedAt)} />
        </div>
      </Section>

      {/* Admin Actions */}
      {course.status === "pending_review" && (
        <div className="bg-surface border border-border rounded-2xl p-5">
          <h2 className="text-sm font-bold text-text mb-2">
            Course Review Actions
          </h2>

          <p className="text-xs text-muted mb-5">
            Review the course information before approving or rejecting it.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleApprove}
              disabled={Boolean(actioning)}
              className="flex-1 bg-green/10 text-green border border-green/20 font-semibold py-3 rounded-xl text-sm hover:bg-green/20 transition disabled:opacity-50"
            >
              {actioning === "approve" ? "Approving..." : "✅ Approve Course"}
            </button>

            <button
              onClick={handleReject}
              disabled={Boolean(actioning)}
              className="flex-1 bg-red/10 text-red border border-red/20 font-semibold py-3 rounded-xl text-sm hover:bg-red/20 transition disabled:opacity-50"
            >
              {actioning === "reject" ? "Rejecting..." : "❌ Reject Course"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
