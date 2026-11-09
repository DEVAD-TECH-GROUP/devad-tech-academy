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

// ============================================================
// HELPERS
// ============================================================

const formatNaira = (amount) => {
  if (amount === undefined || amount === null) {
    return "Not specified";
  }

  if (Number(amount) === 0) return 0;

  return `₦${Number(amount).toLocaleString("en-NG")}`;
};

const formatDate = (date) => {
  if (!date) return "Not available";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Not available";
  }

  return parsed.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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

const getStatusVariant = (status) => {
  const variants = {
    published: "green",
    pending_review: "yellow",
    rejected: "red",
    draft: "default",
  };

  return variants[status] || "default";
};

// ============================================================
// REUSABLE COMPONENTS
// ============================================================

function Section({ title, description, children }) {
  return (
    <section className="bg-surface border border-border rounded-2xl p-5 md:p-6 space-y-5">
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
  if (value === undefined || value === null || value === "") {
    return null;
  }

  let display = value;

  if (typeof value === "boolean") {
    display = value ? "Yes" : "No";
  }

  return (
    <div className="py-3 border-b border-border/50 last:border-0 min-w-0">
      <p className="text-xs text-muted mb-1">{label}</p>

      <p className="text-sm text-text break-words">{display}</p>
    </div>
  );
}

function TagList({ items, emptyText = "None added" }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <p className="text-xs text-muted">{emptyText}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className="px-3 py-1.5 rounded-lg bg-accentDim text-accent text-xs font-medium"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function BulletList({ items, emptyText = "None added" }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <p className="text-xs text-muted">{emptyText}</p>;
  }

  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-3 text-sm text-text">
          <span className="text-accent mt-0.5">✓</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className="text-xl mb-3">{icon}</div>

      <p className="text-xl font-bold text-text">{value ?? 0}</p>

      <p className="text-xs text-muted mt-1">{label}</p>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function AdminCourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(null);

  // ==========================================================
  // FETCH COURSE
  // ==========================================================

  useEffect(() => {
    let active = true;

    setLoading(true);
    setCourse(null);

    getCourse(id)
      .then((response) => {
        if (active) {
          setCourse(response.data.data);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch course:", error);

        if (active) {
          toast.error("Failed to load course details");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  // ==========================================================
  // APPROVE COURSE
  // ==========================================================

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

  // ==========================================================
  // REJECT COURSE
  // ==========================================================

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

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  // ==========================================================
  // NOT FOUND
  // ==========================================================

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

  // ==========================================================
  // COURSE DATA
  // ==========================================================

  const thumbnail = course.thumbnail?.image?.url || null;

  const thumbnailData = course.thumbnail || {};
  const instructor = course.instructor || {};
  const settings = course.settings || {};
  const installments = course.installments || {};
  const liveClasses = course.liveClasses || {};
  const previewVideo = course.previewVideo || {};

  const statusVariant = getStatusVariant(course.status);

  console.log("Course data:", course);

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-6 fi max-w-5xl pb-10">
      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={() => navigate("/admin/courses")}
          className="text-sm text-muted hover:text-text transition"
        >
          ← Back to Courses
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={statusVariant}>
            {course.status?.replaceAll("_", " ")}
          </Badge>

          {course.isFeatured && <Badge variant="accent">Featured</Badge>}
        </div>
      </div>

      {/* =====================================================
          COURSE OVERVIEW / THUMBNAIL
      ===================================================== */}

      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={course.title || "Course thumbnail"}
            className="w-full h-56 md:h-80 object-cover bg-accentDim"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-56 md:h-80 bg-accentDim flex flex-col items-center justify-center">
            <span className="text-6xl">📚</span>

            <p className="text-xs text-muted mt-3">
              No course thumbnail available
            </p>
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
              <p className="text-sm text-text/80 mt-3 leading-6">
                {course.shortDescription}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
            <span>🌐 {course.language || "English"}</span>
            <span>📅 Created {formatDate(course.createdAt)}</span>
            <span>🔄 Updated {formatDate(course.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* =====================================================
          COURSE STATISTICS
      ===================================================== */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Students" value={course.totalStudents} icon="👨‍🎓" />

        <StatCard label="Modules" value={course.totalModules} icon="📚" />

        <StatCard label="Lessons" value={course.totalLessons} icon="📖" />

        <StatCard label="Projects" value={course.totalProjects} icon="💻" />

        <StatCard
          label="Assignments"
          value={course.totalAssignments}
          icon="📝"
        />

        <StatCard label="Reviews" value={course.totalReviews} icon="💬" />

        <StatCard
          label="Average Rating"
          value={
            Number(course.averageRating || 0) > 0
              ? `${Number(course.averageRating).toFixed(1)} / 5`
              : "New"
          }
          icon="⭐"
        />

        <StatCard
          label="Total Revenue"
          value={formatNaira(course.totalRevenue)}
          icon="💰"
        />
      </div>

      {/* =====================================================
          FULL DESCRIPTION
      ===================================================== */}

      <Section
        title="Course Description"
        description="The full description provided by the instructor."
      >
        <p className="text-sm text-text whitespace-pre-line leading-7">
          {course.description || "No description provided."}
        </p>
      </Section>

      {/* =====================================================
          INSTRUCTOR
      ===================================================== */}

      <Section
        title="Instructor Information"
        description="The instructor responsible for this course."
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-accentDim flex items-center justify-center text-2xl">
            👤
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-text">
              {getName(instructor)}
            </h3>

            <p className="text-xs text-muted mt-1">
              {instructor.email || "No email available"}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-x-6">
          <InfoItem label="First Name" value={instructor.firstName} />

          <InfoItem label="Last Name" value={instructor.lastName} />

          <InfoItem label="Email Address" value={instructor.email} />

          <InfoItem label="Instructor ID" value={instructor._id} />
        </div>
      </Section>

      {/* =====================================================
          CLASSIFICATION
      ===================================================== */}

      <Section
        title="Course Classification"
        description="Course category, difficulty and technologies."
      >
        <div className="grid md:grid-cols-2 gap-x-6">
          <InfoItem label="Category" value={course.category?.name} />

          <InfoItem label="Category ID" value={course.category?._id} />

          <InfoItem label="Difficulty Level" value={course.level} />

          <InfoItem label="Language" value={course.language} />
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted mb-3">Course Tags</p>

            <TagList items={course.tags} />
          </div>

          <div>
            <p className="text-xs text-muted mb-3">Technologies and Tools</p>

            <TagList items={course.technologies} />
          </div>
        </div>
      </Section>

      {/* =====================================================
          LEARNING OUTCOMES
      ===================================================== */}

      <Section
        title="Learning Outcomes"
        description="What students should be able to achieve after completing the course."
      >
        <BulletList items={course.learningOutcomes} />
      </Section>

      {/* =====================================================
          PREREQUISITES
      ===================================================== */}

      <Section
        title="Prerequisites"
        description="What students should know or have before enrolling."
      >
        <BulletList items={course.prerequisites} />
      </Section>

      {/* =====================================================
          PRICING
      ===================================================== */}

      <Section
        title="Course Pricing"
        description="Course fees, discounts and installment options."
      >
        <div className="grid md:grid-cols-2 gap-x-6">
          <InfoItem label="Course Price" value={formatNaira(course.price)} />

          <InfoItem label="Free Course" value={course.isFree} />

          <InfoItem
            label="Discount Price"
            value={
              course.discountPrice !== null &&
              course.discountPrice !== undefined
                ? formatNaira(course.discountPrice)
                : "No discount"
            }
          />

          <InfoItem
            label="Discount Expiry"
            value={formatDate(course.discountExpiry)}
          />
        </div>

        <div className="border-t border-border pt-4 space-y-3">
          <h3 className="text-xs font-bold text-text">Installment Payment</h3>

          <div className="grid md:grid-cols-2 gap-x-6">
            <InfoItem label="Enabled" value={installments.enabled} />

            {installments.enabled && (
              <>
                <InfoItem
                  label="Installment Amount"
                  value={formatNaira(installments.amount)}
                />

                <InfoItem
                  label="Number of Installments"
                  value={installments.count}
                />

                <InfoItem
                  label="Payment Interval"
                  value={installments.interval}
                />
              </>
            )}
          </div>
        </div>
      </Section>

      {/* =====================================================
          COURSE MEDIA
      ===================================================== */}

      <Section
        title="Course Media"
        description="Preview video and thumbnail information."
      >
        {/* Preview video */}

        <div className="space-y-3">
          <h3 className="text-xs font-bold text-text">Preview Video</h3>

          {previewVideo.url ? (
            <>
              <video
                src={previewVideo.url}
                controls
                preload="metadata"
                className="w-full max-h-[400px] rounded-xl bg-black"
              />

              <InfoItem
                label="Video Duration"
                value={
                  previewVideo.duration
                    ? `${previewVideo.duration} seconds`
                    : "Not specified"
                }
              />

              <a
                href={previewVideo.url}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-xs text-accent hover:underline break-all"
              >
                Open preview video
              </a>
            </>
          ) : (
            <p className="text-xs text-muted">No preview video uploaded.</p>
          )}
        </div>

        {/* Thumbnail details */}

        <div className="border-t border-border pt-4 space-y-3">
          <h3 className="text-xs font-bold text-text">Thumbnail Details</h3>

          {thumbnail ? (
            <div className="grid md:grid-cols-2 gap-x-6">
              <InfoItem label="Thumbnail Title" value={thumbnailData.title} />

              <InfoItem
                label="Thumbnail Category"
                value={thumbnailData.category?.name}
              />

              <InfoItem
                label="Thumbnail Active"
                value={thumbnailData.isActive}
              />

              <InfoItem
                label="Thumbnail Created"
                value={formatDate(thumbnailData.createdAt)}
              />
            </div>
          ) : (
            <p className="text-xs text-muted">
              No thumbnail is associated with this course.
            </p>
          )}
        </div>
      </Section>

      {/* =====================================================
          SETTINGS
      ===================================================== */}

      <Section
        title="Course Settings"
        description="Enrollment, certificates, discussions and content access."
      >
        <div className="grid md:grid-cols-2 gap-x-6">
          <InfoItem label="Enrollment Type" value={settings.enrollmentType} />

          <InfoItem
            label="Certificate Enabled"
            value={settings.hasCertificate}
          />

          <InfoItem label="Discussion Enabled" value={settings.hasDiscussion} />

          <InfoItem label="Drip Content" value={settings.dripContent} />

          <InfoItem label="Allow Downloads" value={settings.allowDownloads} />

          <InfoItem label="Featured Course" value={course.isFeatured} />
        </div>
      </Section>

      {/* =====================================================
          LIVE CLASSES
      ===================================================== */}

      <Section
        title="Live Class Configuration"
        description="The live teaching arrangements for this course."
      >
        <div className="grid md:grid-cols-2 gap-x-6">
          <InfoItem label="Live Classes Enabled" value={liveClasses.enabled} />

          <InfoItem label="Frequency" value={liveClasses.frequency} />

          <InfoItem
            label="Duration"
            value={
              liveClasses.duration
                ? `${liveClasses.duration} minutes`
                : "Not specified"
            }
          />

          <InfoItem
            label="Platform"
            value={liveClasses.platform?.replaceAll("-", " ")}
          />
        </div>

        {liveClasses.description && (
          <div>
            <p className="text-xs text-muted mb-2">Description</p>

            <p className="text-sm text-text leading-6">
              {liveClasses.description}
            </p>
          </div>
        )}
      </Section>

      {/* =====================================================
          APPROVAL AND PUBLICATION
      ===================================================== */}

      <Section
        title="Approval & Publication"
        description="Administrative approval and publication records."
      >
        <div className="grid md:grid-cols-2 gap-x-6">
          <InfoItem
            label="Course Status"
            value={course.status?.replaceAll("_", " ")}
          />

          <InfoItem label="Approved By" value={getName(course.approvedBy)} />

          <InfoItem label="Approved At" value={formatDate(course.approvedAt)} />

          <InfoItem
            label="Published At"
            value={formatDate(course.publishedAt)}
          />

          <InfoItem label="Rejection Reason" value={course.rejectionReason} />
        </div>
      </Section>

      {/* =====================================================
          RECORD INFORMATION
      ===================================================== */}

      <Section
        title="Course Record"
        description="Database identifiers and record timestamps."
      >
        <div className="grid md:grid-cols-2 gap-x-6">
          <InfoItem label="Course ID" value={course._id} />

          <InfoItem label="Course Slug" value={course.slug} />

          <InfoItem label="Created At" value={formatDate(course.createdAt)} />

          <InfoItem label="Last Updated" value={formatDate(course.updatedAt)} />
        </div>
      </Section>

      {/* =====================================================
          ADMIN ACTIONS
      ===================================================== */}

      {course.status === "pending_review" && (
        <div className="bg-surface border border-border rounded-2xl p-5 md:p-6">
          <h2 className="text-sm font-bold text-text">Course Review</h2>

          <p className="text-xs text-muted mt-2 mb-5">
            Review the course content and information before making your
            decision.
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
