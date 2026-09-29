import CourseCard from "../../../../components/ui/courseUi/courseCard";

export default function CourseGrid({
  filtered = [],
  categories = [],
  category,
  setCategory,
  onNavigate,
}) {
  /*
  |--------------------------------------------------------------------------
  | Get Course ID
  |--------------------------------------------------------------------------
  |
  | Always use MongoDB _id for course detail navigation.
  |
  */

  const getCourseId = (course) => {
    if (!course || typeof course !== "object") {
      return "";
    }

    return course._id || course.id || "";
  };

  /*
  |--------------------------------------------------------------------------
  | Course Navigation
  |--------------------------------------------------------------------------
  |
  | Course detail route:
  |
  | /courses/:id
  |
  | Example:
  |
  | /courses/68d123456789abcdef123456
  |
  | NEVER use:
  | - course.slug
  | - course.title
  | - category slug
  |
  */

  const handleNavigation = (course) => {
    const courseId = getCourseId(course);

    if (!courseId) {
      console.error(
        "Cannot navigate to course: missing course ID",
        course
      );

      return;
    }

    if (typeof onNavigate === "function") {
      onNavigate(courseId, course);
      return;
    }

    console.error(
      "Course navigation handler is not provided.",
      course
    );
  };

  return (
    <section className="px-6 pb-20 max-w-7xl mx-auto">
      {/* ---------------------------------------------------------------- */}
      {/* HEADER */}
      {/* ---------------------------------------------------------------- */}

      <div className="flex items-center justify-between mb-8 gap-6 flex-wrap">
        <h2 className="text-2xl font-bold">
          {filtered.length}{" "}
          {filtered.length === 1
            ? "Course"
            : "Courses"}{" "}
          Available
        </h2>

        {categories.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {categories.slice(1).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() =>
                  setCategory(
                    cat === category
                      ? "All"
                      : cat
                  )
                }
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                  category === cat
                    ? "bg-violet-600 border-violet-600 text-white"
                    : "border-slate-700 text-slate-400 hover:border-violet-500 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* EMPTY STATE */}
      {/* ---------------------------------------------------------------- */}

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          No courses match your filters. Try
          adjusting them.
        </div>
      ) : (
        /* ---------------------------------------------------------------- */
        /* COURSE CARDS */
        /* ---------------------------------------------------------------- */

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((course) => {
            const courseId = getCourseId(course);

            return (
              <CourseCard
                key={
                  courseId ||
                  course.slug ||
                  course.title
                }
                course={course}
                onNavigate={() =>
                  handleNavigation(course)
                }
              />
            );
          })}
        </div>
      )}
    </section>
  );
}