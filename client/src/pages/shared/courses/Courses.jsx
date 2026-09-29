import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCourses } from "../../../hooks/useCourses";

import CoursesHero from "../sections/coursesSections/coursesHero";
import CourseGrid from "../sections/coursesSections/courseGrid";
import FeaturedCourses from "../sections/coursesSections/featured";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

/**
 * Safely get the category name.
 *
 * API may return:
 *
 * category: {
 *   _id,
 *   name,
 *   description,
 *   icon,
 *   color,
 *   slug,
 *   ...
 * }
 *
 * OR:
 *
 * category: "Software Development"
 */
const getCategoryName = (category) => {
  if (!category) {
    return "";
  }

  if (typeof category === "object") {
    return category?.name || "";
  }

  return String(category);
};

/**
 * Safely convert a value into a renderable string.
 */
const getText = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    return "";
  }

  return String(value);
};

/**
 * Get a reliable course ID.
 *
 * Primary:
 *   course._id
 *
 * Fallback:
 *   course.id
 */
const getCourseId = (course) => {
  if (!course || typeof course !== "object") {
    return "";
  }

  return course._id || course.id || "";
};

/**
 * Normalize a course before giving it to UI components.
 *
 * IMPORTANT:
 * The populated category object is preserved as categoryData,
 * while category itself becomes a simple string.
 *
 * This prevents errors such as:
 *
 * "Objects are not valid as a React child"
 */
const normalizeCourseForCard = (course) => {
  if (!course || typeof course !== "object") {
    return course;
  }

  const categoryName = getCategoryName(course.category);

  return {
    ...course,

    /*
     * Keep MongoDB ID available.
     */
    id: getCourseId(course),

    /*
     * Safe string for components that render:
     *
     * {course.category}
     */
    category: categoryName,

    /*
     * Preserve the original populated category.
     */
    categoryData:
      course.category &&
      typeof course.category === "object"
        ? course.category
        : null,

    /*
     * Safe renderable text.
     */
    title: getText(course.title),

    subtitle: getText(course.subtitle),

    description: getText(course.description),

    level: getText(course.level),
  };
};

export default function CoursesPage({ onNavigate }) {
  const navigate = useNavigate();

  /*
  |--------------------------------------------------------------------------
  | Course API
  |--------------------------------------------------------------------------
  */

  const {
    courses = [],
    loading,
    error,
    refetch,
  } = useCourses();

  /*
  |--------------------------------------------------------------------------
  | Filters
  |--------------------------------------------------------------------------
  */

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [priceMax, setPriceMax] = useState(400000);

  /*
  |--------------------------------------------------------------------------
  | Safe courses array
  |--------------------------------------------------------------------------
  */

  const safeCourses = useMemo(() => {
    return Array.isArray(courses) ? courses : [];
  }, [courses]);

  /*
  |--------------------------------------------------------------------------
  | Course navigation
  |--------------------------------------------------------------------------
  |
  | Every course goes to:
  |
  | /courses/:id
  |
  | Example:
  |
  | /courses/68d123456789abcdef123456
  |
  | We use MongoDB _id, NOT category slug and NOT course title.
  |
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
     * If the parent provides its own navigation handler,
     * allow the parent to handle it.
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

  /*
  |--------------------------------------------------------------------------
  | Category names
  |--------------------------------------------------------------------------
  */

  const categories = useMemo(() => {
    const names = safeCourses
      .map((course) =>
        getCategoryName(course?.category)
      )
      .filter(Boolean);

    return [
      "All",
      ...new Set(names),
    ];
  }, [safeCourses]);

  /*
  |--------------------------------------------------------------------------
  | Levels
  |--------------------------------------------------------------------------
  */

  const levels = [
    "All",
    "Beginner",
    "Beginner → Advanced",
    "Intermediate",
    "Advanced",
  ];

  /*
  |--------------------------------------------------------------------------
  | Filter courses
  |--------------------------------------------------------------------------
  */

  const filtered = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return safeCourses.filter((course) => {
      /*
      |--------------------------------------------------------------------------
      | Title
      |--------------------------------------------------------------------------
      */

      const title = getText(course?.title);

      /*
      |--------------------------------------------------------------------------
      | Subtitle / Description
      |--------------------------------------------------------------------------
      */

      const subtitle =
        getText(course?.subtitle) ||
        getText(course?.description);

      /*
      |--------------------------------------------------------------------------
      | Category
      |--------------------------------------------------------------------------
      */

      const courseCategory =
        getCategoryName(course?.category);

      /*
      |--------------------------------------------------------------------------
      | Level
      |--------------------------------------------------------------------------
      */

      const courseLevel =
        getText(course?.level);

      /*
      |--------------------------------------------------------------------------
      | Search
      |--------------------------------------------------------------------------
      */

      const matchSearch =
        !normalizedSearch ||
        title
          .toLowerCase()
          .includes(normalizedSearch) ||
        subtitle
          .toLowerCase()
          .includes(normalizedSearch) ||
        courseCategory
          .toLowerCase()
          .includes(normalizedSearch);

      /*
      |--------------------------------------------------------------------------
      | Category filter
      |--------------------------------------------------------------------------
      */

      const matchCategory =
        category === "All" ||
        courseCategory === category;

      /*
      |--------------------------------------------------------------------------
      | Level filter
      |--------------------------------------------------------------------------
      */

      const matchLevel =
        level === "All" ||
        courseLevel === level;

      /*
      |--------------------------------------------------------------------------
      | Price filter
      |--------------------------------------------------------------------------
      */

      const numericPrice = Number(
        course?.price ?? 0
      );

      const safePrice = Number.isFinite(
        numericPrice
      )
        ? numericPrice
        : 0;

      const matchPrice =
        safePrice <= priceMax;

      return (
        matchSearch &&
        matchCategory &&
        matchLevel &&
        matchPrice
      );
    });
  }, [
    safeCourses,
    search,
    category,
    level,
    priceMax,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Normalize filtered courses
  |--------------------------------------------------------------------------
  */

  const normalizedFilteredCourses = useMemo(() => {
    return filtered.map(
      normalizeCourseForCard
    );
  }, [filtered]);

  /*
  |--------------------------------------------------------------------------
  | Normalize featured courses too
  |--------------------------------------------------------------------------
  |
  | FeaturedCourses may also render category directly.
  | Therefore we normalize these as well.
  |
  */

  const normalizedFeaturedCourses = useMemo(() => {
    return safeCourses.map(
      normalizeCourseForCard
    );
  }, [safeCourses]);

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div
            className="
              w-10 h-10
              border-4
              border-slate-700
              border-t-green-500
              rounded-full
              animate-spin
              mx-auto
              mb-4
            "
          />

          <p className="text-slate-400">
            Loading courses...
          </p>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (error) {
    const errorMessage =
      typeof error === "string"
        ? error
        : error?.message ||
          "Something went wrong while loading courses.";

    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">
            Unable to load courses
          </h2>

          <p className="text-slate-400 mb-6">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={refetch}
            className="
              px-5 py-2.5
              rounded-lg
              bg-green-600
              hover:bg-green-500
              transition
              text-white
              font-medium
            "
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Page
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-10">
      {/* ---------------------------------------------------------------- */}
      {/* HERO */}
      {/* ---------------------------------------------------------------- */}

      <CoursesHero
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        level={level}
        setLevel={setLevel}
        priceMax={priceMax}
        setPriceMax={setPriceMax}
        categories={categories}
        levels={levels}
      />

      {/* ---------------------------------------------------------------- */}
      {/* COURSE GRID */}
      {/* ---------------------------------------------------------------- */}

      <CourseGrid
        filtered={normalizedFilteredCourses}
        categories={categories}
        category={category}
        setCategory={setCategory}
        onNavigate={handleCourseNavigation}
      />

      {/* ---------------------------------------------------------------- */}
      {/* FEATURED COURSES */}
      {/* ---------------------------------------------------------------- */}

      <FeaturedCourses
        courses={normalizedFeaturedCourses}
        onNavigate={handleCourseNavigation}
      />
    </div>
  );
}


const handleCourseNavigation = (course) => {
  const courseId = course?._id || course?.id;

  if (!courseId) return;

  navigate(`/courses/${courseId}`);
};

<CourseGrid
...
  onNavigate={handleCourseNavigation}
/>

<FeaturedCourses
  courses={normalizedFeaturedCourses}
  onNavigate={handleCourseNavigation}
/>
