import { useNavigate } from "react-router-dom";
import { fmt } from "../../../../components/ui/courseUi/fmt";

/**
 * Safely get the category name regardless of API shape.
 */
const getCategoryName = (category) => {
  if (!category) {
    return "";
  }

  if (typeof category === "object") {
    return category.name || "";
  }

  return String(category);
};

/**
 * Safely get the category color.
 */
const getCategoryColor = (category) => {
  if (!category || typeof category !== "object") {
    return null;
  }

  return category.color || null;
};

/**
 * Get the MongoDB course ID.
 *
 * IMPORTANT:
 * Course detail navigation must use the MongoDB _id.
 */
const getCourseId = (course) => {
  if (!course || typeof course !== "object") {
    return "";
  }

  return course._id || course.id || "";
};

/**
 * Category icon.
 */
const getCategoryIcon = (category) => {
  const categoryName = getCategoryName(category);

  const iconClass = "w-6 h-6 text-violet-400";

  switch (categoryName) {
    /*
     * SOFTWARE DEVELOPMENT
     */
    case "Development":
    case "Software Development":
    case "Web Development":
    case "Full Stack Development":
      return (
        <svg
          className={iconClass}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
          />
        </svg>
      );

    /*
     * DESIGN
     */
    case "Design":
    case "UI/UX Design":
    case "UI/UX":
      return (
        <svg
          className={iconClass}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.53 16.122l3.95-3.95m2.03-2.03l2.877-2.877a2.414 2.414 0 00-3.414-3.414L12.095 5.73m0 0L8.044 9.78m4.051-4.051l-4.05 4.051m0 0l-5.38 5.38a2.414 2.414 0 003.414 3.414l5.38-5.38m-3.414-3.414l3.414 3.414m-4.908 4.908L4.3 19.1c-.43.43-.12 1.17.49 1.17h3.35c.32 0 .62-.13.85-.35l1.63-1.63M16.4 18.122h4.1M16.4 15.122h1.1m-1.1 6h2.1"
          />
        </svg>
      );

    /*
     * AI / DATA
     */
    case "AI & Data":
    case "AI/ML":
    case "Artificial Intelligence":
    case "Machine Learning":
    case "Data Analytics":
    case "Data Science":
      return (
        <svg
          className={iconClass}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 3v16.5M21 19.5H3.75M6.75 12v3m3.75-6v6m3.75-9v9M18.75 6v12"
          />
        </svg>
      );

    /*
     * CYBERSECURITY
     */
    case "Cybersecurity":
    case "Cyber Security":
      return (
        <svg
          className={iconClass}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3l7 3v5c0 4.5-2.9 8.5-7 10-4.1-1.5-7-5.5-7-10V6l7-3z"
          />

          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.5 12l1.7 1.7 3.5-3.5"
          />
        </svg>
      );

    /*
     * EMBEDDED / IOT / ROBOTICS
     */
    case "Embedded Systems":
    case "Embedded System":
    case "IoT":
    case "Internet of Things":
    case "Robotics":
      return (
        <svg
          className={iconClass}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <rect
            x="6"
            y="6"
            width="12"
            height="12"
            rx="2"
          />

          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 1v3m6-3v3M9 20v3m6-3v3M20 9h3m-3 6h3M1 9h3m-3 6h3"
          />

          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 9h6v6H9z"
          />
        </svg>
      );

    /*
     * MOBILE
     */
    case "Mobile App Development":
    case "Mobile Development":
      return (
        <svg
          className={iconClass}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <rect
            x="6"
            y="2"
            width="12"
            height="20"
            rx="2"
          />

          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 18h4"
          />
        </svg>
      );

    /*
     * DEFAULT
     */
    default:
      return (
        <svg
          className={iconClass}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
      );
  }
};

/**
 * Safely format the course price.
 */
const getCoursePrice = (price) => {
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice)) {
    return fmt(0);
  }

  return fmt(numericPrice);
};

export default function FeaturedCourses({
  courses = [],
  onNavigate,
}) {
  const navigate = useNavigate();

  /*
   * Always guarantee that we are working with an array.
   */
  const safeCourses = Array.isArray(courses)
    ? courses
    : [];

  /*
   * First three courses are displayed as featured.
   */
  const featuredCourses = safeCourses.slice(0, 3);

  /*
   * Navigate using MongoDB course ID.
   */
  const handleCourseNavigation = (course) => {
    const courseId = getCourseId(course);

    if (!courseId) {
      console.error(
        "Cannot navigate to course: missing course ID",
        course
      );

      return;
    }

    /*
     * If parent supplied a navigation handler,
     * use it.
     */
    if (typeof onNavigate === "function") {
      onNavigate(courseId, course);
      return;
    }

    /*
     * Default navigation.
     */
    navigate(`/courses/${courseId}`);
  };

  return (
    <section className="px-6 py-20 border-t border-slate-800/60 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="text-center mb-12">
        <span className="text-xs font-bold tracking-widest text-violet-400 uppercase">
          Most Popular
        </span>

        <h2 className="text-3xl font-black mt-2">
          Featured Programs
        </h2>
      </div>

      {/* COURSES */}
      {featuredCourses.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          No featured courses available.
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {featuredCourses.map((course) => {
            /*
             * Get MongoDB ID.
             */
            const courseId =
              getCourseId(course);

            /*
             * Category information.
             */
            const categoryName =
              getCategoryName(
                course?.category
              );

            const categoryColor =
              getCategoryColor(
                course?.category
              );

            const categoryStyle =
              categoryColor
                ? {
                    borderColor: `${categoryColor}30`,
                    backgroundColor: `${categoryColor}10`,
                  }
                : undefined;

            return (
              <div
                key={
                  courseId ||
                  course?.slug ||
                  course?.title
                }
                onClick={() => {
                  if (courseId) {
                    handleCourseNavigation(
                      course
                    );
                  }
                }}
                className={`cursor-pointer group relative bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-violet-500/50 transition-all flex flex-col justify-between ${
                  courseId
                    ? ""
                    : "cursor-default"
                }`}
              >
                {/* COURSE CONTENT */}
                <div>
                  {/* CATEGORY ICON */}
                  <div
                    className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/10 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300"
                    style={categoryStyle}
                    title={
                      categoryName ||
                      "Course"
                    }
                  >
                    {getCategoryIcon(
                      course?.category
                    )}
                  </div>

                  {/* CATEGORY NAME */}
                  {categoryName && (
                    <p className="text-xs font-semibold text-violet-400 mb-2 uppercase tracking-wide">
                      {categoryName}
                    </p>
                  )}

                  {/* TITLE */}
                  <h3 className="font-bold text-lg mb-2 group-hover:text-violet-400 transition-colors">
                    {course?.title ||
                      "Untitled Course"}
                  </h3>

                  {/* DESCRIPTION */}
                  <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                    {course?.subtitle ||
                      course?.description ||
                      "Explore this program and start learning."}
                  </p>
                </div>

                {/* FOOTER */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/40">
                  {/* PRICE */}
                  <span className="font-black text-white">
                    {getCoursePrice(
                      course?.price
                    )}
                  </span>

                  {/* EXPLORE */}
                  <span className="text-violet-400 text-sm font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Explore

                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
