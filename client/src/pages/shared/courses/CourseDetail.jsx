import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { getCourse } from "../../../services/public/courseService";
import { formatNaira } from "../../../utils/formatCurrency";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const StarRating = ({ rating = 0 }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <svg
        key={s}
        className={`w-4 h-4 ${
          s <= rating ? "text-amber-400" : "text-slate-600"
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const TechBadge = ({ name }) => {
  const colors = {
    HTML5: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    CSS3: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    JavaScript: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    React: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    "Node.js": "bg-green-500/20 text-green-300 border-green-500/30",
    MongoDB: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    Git: "bg-red-500/20 text-red-300 border-red-500/30",
    GitHub: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    "VS Code": "bg-blue-600/20 text-blue-300 border-blue-600/30",
    default: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  };

  const cls = colors[name] || colors.default;

  return (
    <span
      className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${cls} tracking-wide`}
    >
      {name}
    </span>
  );
};

// ─── COURSE DETAIL PAGE ───────────────────────────────────────────────────────

export default function CourseDetailPage({
  course: propCourse,
  onBack: propOnBack,
}) {
  const [course, setCourse] = useState(propCourse || null);

  const [loading, setLoading] = useState(!propCourse);
  const [error, setError] = useState("");

  const [openModule, setOpenModule] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  const { id } = useParams();
  const navigate = useNavigate();

  const handleBack =
    propOnBack || (() => navigate("/courses"));

  // ─── Get public single course ───────────────────────────
  useEffect(() => {
    if (propCourse) {
      setCourse(propCourse);
      setLoading(false);
      return;
    }

    const loadCourse = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getCourse(id);

        const fetchedCourse =
          response?.data?.data?.course ||
          response?.data?.data ||
          response?.data?.course ||
          null;

        if (!fetchedCourse) {
          throw new Error("Course not found");
        }

        setCourse(fetchedCourse);
      } catch (err) {
        console.error("Failed to load course:", err);

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load course."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadCourse();
    }
  }, [id, propCourse]);

  // ─── Scroll helper ──────────────────────────────────────
  const scrollTo = (sectionId) => {
    document
      .getElementById(sectionId)
      ?.scrollIntoView({ behavior: "smooth" });
  };

  // ─── Loading ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />

          <p className="text-slate-400">
            Loading course...
          </p>
        </div>
      </div>
    );
  }

  // ─── Error ──────────────────────────────────────────────
  if (error || !course) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-slate-400 text-center">
          {error || "Course not found."}
        </p>

        <button
          onClick={() => navigate("/courses")}
          className="bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-xl text-sm font-semibold transition"
        >
          Return to Courses
        </button>
      </div>
    );
  }

  // ─── Quick stats ────────────────────────────────────────
  const quickStats = [
    {
      label: "Duration",
      val: course.duration,
      icon: (
        <svg
          className="w-5 h-5 text-slate-500 mx-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      label: "Modules",
      val: course.modulesCount,
      icon: (
        <svg
          className="w-5 h-5 text-slate-500 mx-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.429 9.75L2.25 12l4.179 2.25m11.142 0L21.75 12l-4.179-2.25M12 5.75L6.43 8.75 12 11.75l5.57-3L12 5.75zm0 12.5l-5.57-3L12 18.25l5.57-3-5.57 3z"
          />
        </svg>
      ),
    },
    {
      label: "Lessons",
      val: `${course.lessonsCount || 0}+`,
      icon: (
        <svg
          className="w-5 h-5 text-slate-500 mx-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.584-4.5 1.253"
          />
        </svg>
      ),
    },
    {
      label: "Projects",
      val: course.projectsCount,
      icon: (
        <svg
          className="w-5 h-5 text-slate-500 mx-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.25 14.15v4.25c0 .414-.336.75-.75.75H4.5a.75.75 0 01-.75-.75v-4.25m16.5 0a2.25 2.25 0 00-2.25-2.25H10.5m10.5 0l-5.14-5.14a2.25 2.25 0 00-3.18 0L4.5 11.9m0 2.25a2.25 2.25 0 01-2.25-2.25v-2.25a2.25 2.25 0 012.25-2.25h15a2.25 2.25 0 012.25 2.25v2.25a2.25 2.25 0 01-2.25 2.25"
          />
        </svg>
      ),
    },
  ];

  const categoryName =
    typeof course.category === "object"
      ? course.category?.name
      : course.category;

  const instructorName =
    typeof course.instructor === "object"
      ? `${course.instructor?.firstName || ""} ${
          course.instructor?.lastName || ""
        }`.trim()
      : "";

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-20">

      {/* ───────────────── HERO ───────────────── */}
      <section className="relative overflow-hidden">
        <button
          onClick={handleBack}
          className="fixed lg:mt-5 mt-2 ml-5 z-50 cursor-pointer p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-850/50 transition-all duration-200 flex items-center justify-center group"
          aria-label="Go back"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="pointer-events-none w-5 h-5 group-hover:-translate-x-0.5 transition-transform"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
        </button>

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-violet-900/20 via-slate-950 to-slate-950" />

        <div className="relative max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-3 gap-12 items-start">

          {/* Hero Content */}
          <div className="lg:col-span-2">

            <div className="inline-flex items-center gap-2 bg-violet-900/30 border border-violet-700/40 rounded-full px-4 py-1.5 text-xs text-violet-300 font-medium mb-6">
              {categoryName} · {course.level}
            </div>

            <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4">
              {course.title}
            </h1>

            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              {course.subtitle}
            </p>

            {instructorName && (
              <p className="text-sm text-slate-500 mb-6">
                Instructor:{" "}
                <span className="text-slate-300">
                  {instructorName}
                </span>
              </p>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {quickStats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center"
                >
                  <div className="mb-1.5">
                    {stat.icon}
                  </div>

                  <div className="font-black text-white text-lg">
                    {stat.val ?? 0}
                  </div>

                  <div className="text-xs text-slate-500 mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Program Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 border-t border-slate-800/80 pt-6">
              <div className="md:ml-auto flex flex-wrap gap-2">

                {course.certificateAvailable && (
                  <span className="flex items-center gap-1.5 text-xs bg-emerald-900/40 text-emerald-400 border border-emerald-700/40 px-2.5 py-1 rounded-full font-medium">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z"
                      />
                    </svg>
                    Certificate Available
                  </span>
                )}

                {course.liveClassesAvailable && (
                  <span className="flex items-center gap-1.5 text-xs bg-blue-900/40 text-blue-400 border border-blue-700/40 px-2.5 py-1 rounded-full font-medium">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      />
                    </svg>
                    Live Classes Included
                  </span>
                )}

              </div>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-violet-900/20 lg:sticky lg:top-24">

            <div className="h-52 overflow-hidden relative">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
            </div>

            <div className="p-6">

              <div className="text-4xl font-black text-white mb-1">
                {formatNaira(course.price)}
              </div>

              <div className="text-slate-400 text-sm mb-2">
                Installments Available
              </div>

              {course.installmentEnabled && (
                <div className="text-violet-400 font-bold text-lg mb-6">
                  {formatNaira(course.installmentAmount)} ×{" "}
                  {course.installmentCount} Months
                </div>
              )}

              <button
                onClick={() => scrollTo("pricing")}
                className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-4 rounded-xl text-lg mb-3 transition-all hover:scale-[1.02]"
              >
                Enroll Now
              </button>

              <div className="mt-5 grid grid-cols-2 gap-2 pt-4 border-t border-slate-800">
                {[
                  "All lessons",
                  "Assignments",
                  "Live classes",
                  "Certificate",
                  "Community",
                  "Career support",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-1.5 text-xs text-slate-400"
                  >
                    <svg
                      className="w-3 h-3 text-emerald-400 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                    {item}
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── OVERVIEW ───────────────── */}
      <section
        id="overview"
        className="px-6 py-16 max-w-7xl mx-auto border-t border-slate-800/60"
      >
        <div className="grid lg:grid-cols-3 gap-12">

          <div className="lg:col-span-2 space-y-8">

            <div>
              <h2 className="text-2xl font-black mb-4">
                Course Description
              </h2>

              <p className="text-slate-400 leading-relaxed text-base">
                {course.description}
              </p>
            </div>

            {/* Outcomes */}
            {course.outcomes?.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4">
                  What you will learn
                </h3>

                <div className="grid sm:grid-cols-2 gap-3">
                  {course.outcomes.map((outcome, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 text-sm text-slate-300"
                    >
                      <svg
                        className="w-3.5 h-3.5 text-violet-500 mt-1 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                        />
                      </svg>

                      <span>{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prerequisites */}
            {course.prerequisites?.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-3">
                  Prerequisites
                </h3>

                <ul className="space-y-2 text-sm text-slate-400">
                  {course.prerequisites.map((prereq, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-700 mt-2 flex-shrink-0" />
                      <span>{prereq}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Tech Stack */}
          <div className="lg:col-span-1 space-y-6">
            {course.technologies?.length > 0 && (
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
                <h3 className="font-bold text-sm tracking-wide text-slate-400 uppercase mb-4">
                  Technologies Covered
                </h3>

                <div className="flex flex-wrap gap-2">
                  {course.technologies.map((tech) => (
                    <TechBadge
                      key={tech}
                      name={tech}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ───────────────── CURRICULUM ───────────────── */}
      <section
        id="curriculum"
        className="px-6 py-16 bg-slate-900/20 border-t border-slate-800/60"
      >
        <div className="max-w-4xl mx-auto">

          <div className="text-center mb-10">
            <h2 className="text-3xl font-black mb-2">
              Curriculum Syllabus
            </h2>

            <p className="text-slate-400 text-sm">
              Structured systematically to build operational context and capability step-by-step.
            </p>
          </div>

          {course.curriculum?.length > 0 ? (
            <div className="space-y-3">

              {course.curriculum.map((mod, i) => (
                <div
                  key={i}
                  className="bg-slate-900 border border-slate-800/80 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setOpenModule(
                        openModule === i ? null : i
                      )
                    }
                    className="w-full flex flex-col sm:flex-row sm:items-center justify-between p-5 text-left transition-colors hover:bg-slate-800/30"
                  >
                    <div>
                      <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">
                        {mod.module}
                      </span>

                      <h3 className="font-bold text-white text-base mt-0.5">
                        {mod.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 mt-2 sm:mt-0 text-xs text-slate-400">
                      <span>
                        {mod.lessons?.length || 0} Lessons
                      </span>

                      <svg
                        className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                          openModule === i
                            ? "rotate-180"
                            : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                    </div>
                  </button>

                  {openModule === i && (
                    <div className="px-6 pb-5 pt-1 border-t border-slate-800/50 bg-slate-950/40">
                      <ul className="space-y-2.5">

                        {mod.lessons?.map((lesson, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-3 text-sm text-slate-400"
                          >
                            <span className="text-slate-600 font-mono text-xs">
                              {(idx + 1)
                                .toString()
                                .padStart(2, "0")}
                            </span>

                            <span>{lesson}</span>
                          </li>
                        ))}

                      </ul>
                    </div>
                  )}
                </div>
              ))}

            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-sm">
              Full curriculum release schedule details coming soon.
            </div>
          )}
        </div>
      </section>

      {/* ───────────────── PROJECTS ───────────────── */}
      <section
        id="projects"
        className="px-6 py-16 max-w-7xl mx-auto border-t border-slate-800/60"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black mb-2">
            Real-world Projects You'll Build
          </h2>

          <p className="text-slate-400 text-sm">
            Construct production-ready code blocks to assemble a solid high-tier software engineer portfolio.
          </p>
        </div>

        {course.projects?.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {course.projects.map((proj, i) => (
              <div
                key={i}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-violet-600/20 text-violet-400 font-bold flex items-center justify-center text-sm mb-4">
                  {String(i + 1).padStart(2, "0")}
                </div>

                <h3 className="font-bold text-lg text-white mb-1.5">
                  {proj.name}
                </h3>

                <p className="text-slate-400 text-sm leading-relaxed">
                  {proj.desc}
                </p>
              </div>
            ))}

          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-sm">
            Project milestone matrices details pending deployment configurations.
          </div>
        )}
      </section>

      {/* ───────────────── PRICING ───────────────── */}
      <section
        id="pricing"
        className="px-6 py-20 border-t border-slate-800/60 bg-gradient-to-b from-slate-950 to-slate-900/40 text-center"
      >
        <div className="max-w-3xl mx-auto space-y-8">

          <div>
            <span className="text-xs font-bold tracking-widest text-violet-400 uppercase">
              Flexible Options
            </span>

            <h2 className="text-4xl font-black mt-2">
              Invest In Your Growth
            </h2>

            <p className="text-slate-400 text-sm mt-2">
              Transparent pricing configurations designed matching localized workflow paths.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-stretch max-w-2xl mx-auto text-left">

            {/* Full Payment */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-colors">

              <div>
                <h3 className="font-bold text-white text-lg">
                  Full Payment
                </h3>

                <p className="text-slate-400 text-xs mt-1">
                  Pay once upfront for complete access discount benefits.
                </p>

                <div className="text-3xl font-black text-white my-5">
                  {formatNaira(course.price)}
                </div>
              </div>

              <button className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-3 rounded-xl text-sm transition-all">
                Select Full Track
              </button>
            </div>

            {/* Installments */}
            {course.installmentEnabled && (
              <div className="bg-slate-900 border border-violet-500/50 rounded-2xl p-6 flex flex-col justify-between relative shadow-lg shadow-violet-900/10">

                <span className="absolute -top-3 left-6 bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
                  Popular Option
                </span>

                <div>
                  <h3 className="font-bold text-white text-lg">
                    Installments Path
                  </h3>

                  <p className="text-slate-400 text-xs mt-1">
                    Split payments comfortably across active months.
                  </p>

                  <div className="text-3xl font-black text-violet-400 my-5">
                    {formatNaira(course.installmentAmount)}

                    <span className="text-slate-400 text-xs font-normal">
                      {" "}
                      / month
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-300 mb-5 bg-slate-800 px-2.5 py-1.5 rounded border border-slate-700/60 inline-block">
                    Total: {course.installmentCount} sequential monthly installments
                  </div>
                </div>

                <button className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-3 rounded-xl text-sm transition-all">
                  Select Installment Track
                </button>
              </div>
            )}
          </div>

          {/* FAQs */}
          {course.faqs?.length > 0 && (
            <div className="max-w-2xl mx-auto pt-16 text-left space-y-4">

              <h3 className="text-xl font-bold text-center text-white mb-6">
                Program Specific FAQ
              </h3>

              {course.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setOpenFaq(
                        openFaq === idx ? null : idx
                      )
                    }
                    className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-sm hover:text-violet-400 transition-colors"
                  >
                    <span>{faq.q}</span>

                    <svg
                      className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                        openFaq === idx
                          ? "rotate-180"
                          : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </button>

                  {openFaq === idx && (
                    <div className="px-5 pb-4 text-slate-400 text-sm leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
