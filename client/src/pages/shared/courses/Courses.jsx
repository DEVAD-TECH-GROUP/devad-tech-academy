import { useEffect, useState } from "react";
import { getCourses } from "../../../services/public/courseService";
import CoursesHero from "../sections/coursesSections/coursesHero";
import CourseGrid from "../sections/coursesSections/courseGrid";
import FeaturedCourses from "../sections/coursesSections/featured";

export default function CoursesPage({ onNavigate }) {
  const [courses, setCourses] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [priceMax, setPriceMax] = useState(400000);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Get public courses ──────────────────────────────────
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getCourses();

        const result =
          response?.data?.data?.docs ||
          response?.data?.data?.courses ||
          response?.data?.data ||
          [];

        setCourses(result);
      } catch (error) {
        console.error("Failed to load courses:", error);

        setError(
          error?.response?.data?.message ||
            "Failed to load courses."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  // ── Categories ──────────────────────────────────────────
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

  // ── Levels ──────────────────────────────────────────────
  const levels = [
    "All",
    "Beginner",
    "Beginner → Advanced",
    "Intermediate",
    "Advanced",
  ];

  // ── Filter courses ─────────────────────────────────────
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
      course.level === level;

    const matchPrice =
      Number(course.price || 0) <= priceMax;

    return (
      matchSearch &&
      matchCategory &&
      matchLevel &&
      matchPrice
    );
  });

  // ── Loading ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-400">
          Loading courses...
        </p>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            Unable to load courses
          </h2>

          <p className="text-slate-400">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-10">
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

      <CourseGrid
        courses={courses}
        filtered={filtered}
        categories={categories}
        category={category}
        setCategory={setCategory}
        onNavigate={onNavigate}
      />

      <FeaturedCourses
        courses={courses}
        onNavigate={onNavigate}
      />
    </div>
  );
}
