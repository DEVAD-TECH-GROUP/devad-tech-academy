import { useState } from "react";

import { useCourses } from "../../../hooks/useCourses";

import CoursesHero from "../sections/coursesSections/coursesHero";
import CourseGrid from "../sections/coursesSections/courseGrid";
import FeaturedCourses from "../sections/coursesSections/featured";

export default function CoursesPage({ onNavigate }) {
  // ───────────────────────────────────────────────────────────
  // Course API
  // ───────────────────────────────────────────────────────────

  const {
    courses,
    loading,
    error,
    pagination,
    refetch,
  } = useCourses();

  // ───────────────────────────────────────────────────────────
  // Filters
  // ───────────────────────────────────────────────────────────

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [priceMax, setPriceMax] = useState(400000);

  // ───────────────────────────────────────────────────────────
  // Categories
  // ───────────────────────────────────────────────────────────

  const categories = [
    "All",
    ...new Set(
      courses
        .map((course) =>
          typeof course.category === "object"
            ? course.category?.name
            : course.category
        )
        .filter(Boolean)
    ),
  ];

  // ───────────────────────────────────────────────────────────
  // Levels
  // ───────────────────────────────────────────────────────────

  const levels = [
    "All",
    "Beginner",
    "Beginner → Advanced",
    "Intermediate",
    "Advanced",
  ];

  // ───────────────────────────────────────────────────────────
  // Filter courses
  // ───────────────────────────────────────────────────────────

  const filtered = courses.filter((course) => {
    const title = course.title || "";

    const subtitle =
      course.subtitle ||
      course.description ||
      "";

    const courseCategory =
      typeof course.category === "object"
        ? course.category?.name
        : course.category;

    const courseLevel = course.level || "";

    const matchSearch =
      title
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      subtitle
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchCategory =
      category === "All" ||
      courseCategory === category;

    const matchLevel =
      level === "All" ||
      courseLevel === level;

    const matchPrice =
      Number(course.price || 0) <= priceMax;

    return (
      matchSearch &&
      matchCategory &&
      matchLevel &&
      matchPrice
    );
  });

  // ───────────────────────────────────────────────────────────
  // Loading
  // ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-slate-700 border-t-green-500 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-slate-400">
            Loading courses...
          </p>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // Error
  // ───────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">
            Unable to load courses
          </h2>

          <p className="text-slate-400 mb-6">
            {error}
          </p>

          <button
            type="button"
            onClick={refetch}
            className="px-5 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 transition text-white font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // Page
  // ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-10">
      {/* ─────────────────────────────────────────────────────
          Hero
      ───────────────────────────────────────────────────── */}

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

      {/* ─────────────────────────────────────────────────────
          Course Grid
      ───────────────────────────────────────────────────── */}

      <CourseGrid
        courses={courses}
        filtered={filtered}
        categories={categories}
        category={category}
        setCategory={setCategory}
        onNavigate={onNavigate}
      />

      {/* ─────────────────────────────────────────────────────
          Featured Courses
      ───────────────────────────────────────────────────── */}

      <FeaturedCourses
        courses={courses}
        onNavigate={onNavigate}
      />
    </div>
  );
}
