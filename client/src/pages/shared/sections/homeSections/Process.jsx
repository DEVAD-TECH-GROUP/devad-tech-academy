import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  Code2,
  BrainCircuit,
  ShieldCheck,
  BarChart3,
  ArrowRight,
  Clock3,
  FolderKanban,
} from "lucide-react";

import { useCourses } from "../../../../hooks/useCourses";

export default function ProgramsSection() {
  const navigate = useNavigate();

  // ─────────────────────────────────────────────────────────────
  // Public courses
  // ─────────────────────────────────────────────────────────────

  const {
    courses,
    loading,
  } = useCourses({
    page: 1,
    limit: 100,
  });

  // ─────────────────────────────────────────────────────────────
  // Local UI state
  // ─────────────────────────────────────────────────────────────

  const [openMobileCourse, setOpenMobileCourse] = useState(0);
  const [activeProgram, setActiveProgram] = useState(null);

  // ─────────────────────────────────────────────────────────────
  // Map API courses to section presentation data
  // ─────────────────────────────────────────────────────────────

  const programs = courses.slice(0, 4).map((course, index) => {
    const icons = [
      Code2,
      BrainCircuit,
      ShieldCheck,
      BarChart3,
    ];

    const Icon = icons[index % icons.length];

    const duration =
      course.duration ||
      (course.durationWeeks
        ? `${course.durationWeeks} Weeks`
        : "Flexible");

    const projects =
      course.projectsCount !== undefined
        ? `${course.projectsCount} Projects`
        : course.projects?.length
          ? `${course.projects.length} Projects`
          : "Practical Projects";

    return {
      ...course,
      id: course._id,

      title:
        course.title ||
        "Untitled Course",

      description:
        course.description ||
        course.subtitle ||
        "Explore this program and build practical technology skills.",

      duration,

      projects,

      icon: Icon,
    };
  });

  // ─────────────────────────────────────────────────────────────
  // Set first course as active
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (programs.length > 0) {
      setActiveProgram((current) => {
        if (!current) {
          return programs[0];
        }

        const updatedProgram = programs.find(
          (program) => program.id === current.id
        );

        return updatedProgram || programs[0];
      });
    } else {
      setActiveProgram(null);
    }
  }, [courses]);

  // ─────────────────────────────────────────────────────────────
  // Navigate to course
  // ─────────────────────────────────────────────────────────────

  const handleCourseNavigation = (courseId) => {
    if (!courseId) return;

    navigate(`/courses/${courseId}`);
  };

  // ─────────────────────────────────────────────────────────────
  // Loading state
  // ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <section className="relative overflow-hidden bg-slate-950 py-24">
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400">
              Our Courses
            </span>

            <h2 className="mt-6 text-4xl font-bold text-white md:text-5xl">
              Choose Your
              <span className="block text-cyan-400">
                Technology Career Path
              </span>
            </h2>
          </div>

          <div className="flex justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />
          </div>
        </div>
      </section>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Empty state
  // ─────────────────────────────────────────────────────────────

  if (!programs.length) {
    return (
      <section className="relative overflow-hidden bg-slate-950 py-24">
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400">
              Our Courses
            </span>

            <h2 className="mt-6 text-4xl font-bold text-white md:text-5xl">
              Choose Your
              <span className="block text-cyan-400">
                Technology Career Path
              </span>
            </h2>

            <p className="mt-6 text-slate-400">
              Courses are currently being prepared. Check back soon.
            </p>

            <button
              type="button"
              onClick={() => navigate("/courses")}
              className="mt-8 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-cyan-500 px-6 py-4 font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              View All Courses
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Active program
  // ─────────────────────────────────────────────────────────────

  const currentProgram =
    activeProgram || programs[0];

  const ActiveIcon = currentProgram.icon;

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────

  return (
    <section className="relative overflow-hidden bg-slate-950 py-24">
      {/* Background Effects */}

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-20 top-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <span className="inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400">
            Our Courses
          </span>

          <h2 className="mt-6 text-4xl font-bold text-white md:text-5xl">
            Choose Your
            <span className="block text-cyan-400">
              Technology Career Path
            </span>
          </h2>
        </motion.div>

        {/* Desktop Layout */}

        <div className="hidden items-start gap-8 lg:grid lg:grid-cols-[1.5fr_0.8fr]">
          {/* Featured Course */}

          <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10" />

            <AnimatePresence mode="wait">
              <motion.div
                key={currentProgram.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="relative p-10 md:p-12"
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
                  <ActiveIcon size={50} />
                </div>

                <h3 className="mt-8 text-3xl font-bold text-white md:text-4xl">
                  {currentProgram.title}
                </h3>

                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
                  {currentProgram.description}
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3">
                    <Clock3
                      size={18}
                      className="text-cyan-400"
                    />

                    <span className="text-slate-300">
                      {currentProgram.duration}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3">
                    <FolderKanban
                      size={18}
                      className="text-cyan-400"
                    />

                    <span className="text-slate-300">
                      {currentProgram.projects}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleCourseNavigation(
                      currentProgram.id
                    )
                  }
                  className="mt-10 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-cyan-500 px-6 py-4 font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  Learn More
                  <ArrowRight size={18} />
                </button>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Course Selector */}

          <div>
            <div className="space-y-3">
              {programs.map((program) => {
                const Icon = program.icon;

                const active =
                  currentProgram.id === program.id;

                return (
                  <motion.button
                    key={program.id}
                    type="button"
                    onMouseEnter={() =>
                      setActiveProgram(program)
                    }
                    onClick={() =>
                      setActiveProgram(program)
                    }
                    className={`w-full cursor-pointer rounded-2xl border p-5 text-left transition-all ${
                      active
                        ? "border-cyan-500/30 bg-cyan-500/10"
                        : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                          active
                            ? "bg-cyan-500/20 text-cyan-400"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        <Icon size={22} />
                      </div>

                      <div>
                        <h4
                          className={`font-semibold ${
                            active
                              ? "text-cyan-400"
                              : "text-white"
                          }`}
                        >
                          {program.title}
                        </h4>

                        <p className="text-sm text-slate-500">
                          {program.duration}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => navigate("/courses")}
                className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 px-6 py-4 font-medium text-white transition hover:border-cyan-500/30 hover:bg-slate-800"
              >
                View All Programs

                <ArrowRight
                  size={18}
                  className="transition group-hover:translate-x-1"
                />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Accordion */}

        <div className="space-y-4 lg:hidden">
          {programs.map((program, index) => {
            const Icon = program.icon;

            const isOpen =
              openMobileCourse === index;

            return (
              <div
                key={program.id}
                className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenMobileCourse(
                      isOpen ? -1 : index
                    )
                  }
                  className="flex w-full cursor-pointer items-center justify-between p-5"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                      <Icon size={22} />
                    </div>

                    <div className="text-left">
                      <h3 className="font-semibold text-white">
                        {program.title}
                      </h3>

                      <p className="text-sm text-slate-500">
                        {program.duration}
                      </p>
                    </div>
                  </div>

                  <motion.div
                    animate={{
                      rotate: isOpen ? 90 : 0,
                    }}
                  >
                    <ArrowRight
                      size={18}
                      className="text-slate-400"
                    />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{
                        height: 0,
                        opacity: 0,
                      }}
                      animate={{
                        height: "auto",
                        opacity: 1,
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                      }}
                      transition={{
                        duration: 0.25,
                      }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-slate-800 p-5">
                        <p className="leading-relaxed text-slate-400">
                          {program.description}
                        </p>

                        <div className="mt-5 flex flex-wrap gap-3">
                          <div className="flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2">
                            <Clock3
                              size={16}
                              className="text-cyan-400"
                            />

                            <span className="text-sm text-slate-300">
                              {program.duration}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2">
                            <FolderKanban
                              size={16}
                              className="text-cyan-400"
                            />

                            <span className="text-sm text-slate-300">
                              {program.projects}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleCourseNavigation(
                              program.id
                            )
                          }
                          className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
                        >
                          Learn More
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => navigate("/courses")}
            className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 px-6 py-4 font-medium text-white transition hover:border-cyan-500/30"
          >
            View All Programs

            <ArrowRight
              size={18}
              className="transition group-hover:translate-x-1"
            />
          </button>
        </div>
      </div>
    </section>
  );
}
