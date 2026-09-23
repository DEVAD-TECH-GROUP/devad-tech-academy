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

import { getCourses } from "../../../../services/public/courseService";

export default function ProgramsSection() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMobileCourse, setOpenMobileCourse] = useState(0);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await getCourses({
          page: 1,
          limit: 100,
        });

        const result = response?.data?.data;

        const fetchedCourses =
          result?.courses ||
          result?.docs ||
          result?.items ||
          (Array.isArray(result) ? result : []);

        setCourses(fetchedCourses);
      } catch (error) {
        console.error("Failed to load courses:", error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  /*
   * Map API courses to the presentation data needed by this section.
   * The API remains the source of truth for course information.
   */
  const programs = courses.slice(0, 4).map((course, index) => {
    const icons = [Code2, BrainCircuit, ShieldCheck, BarChart3];

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
      title: course.title || "Untitled Course",
      description:
        course.description ||
        course.subtitle ||
        "Explore this program and build practical technology skills.",
      duration,
      projects,
      icon: Icon,
    };
  });

  const [activeProgram, setActiveProgram] = useState(null);

  useEffect(() => {
    if (programs.length > 0 && !activeProgram) {
      setActiveProgram(programs[0]);
    }
  }, [programs, activeProgram]);

  const handleCourseNavigation = (courseId) => {
    if (!courseId) return;

    navigate(`/courses/${courseId}`);
  };

  if (loading) {
    return (
      <section className="relative py-24 bg-slate-950 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400">
              Our Courses
            </span>

            <h2 className="mt-6 text-4xl md:text-5xl font-bold text-white">
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

  if (!programs.length) {
    return (
      <section className="relative py-24 bg-slate-950 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400">
              Our Courses
            </span>

            <h2 className="mt-6 text-4xl md:text-5xl font-bold text-white">
              Choose Your
              <span className="block text-cyan-400">
                Technology Career Path
              </span>
            </h2>

            <p className="mt-6 text-slate-400">
              Courses are currently being prepared. Check back soon.
            </p>

            <button
              onClick={() => navigate("/courses")}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-4 font-semibold text-slate-950 transition hover:bg-cyan-400 cursor-pointer"
            >
              View All Courses
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>
    );
  }

  const currentProgram = activeProgram || programs[0];
  const ActiveIcon = currentProgram.icon;

  return (
    <section className="relative py-24 bg-slate-950 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <span className="inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400">
            Our Courses
          </span>

          <h2 className="mt-6 text-4xl md:text-5xl font-bold text-white">
            Choose Your
            <span className="block text-cyan-400">
              Technology Career Path
            </span>
          </h2>
        </motion.div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-[1.5fr_0.8fr] gap-8 items-start">
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
                <div className="w-24 h-24 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <ActiveIcon size={50} />
                </div>

                <h3 className="mt-8 text-3xl md:text-4xl font-bold text-white">
                  {currentProgram.title}
                </h3>

                <p className="mt-6 text-lg leading-relaxed text-slate-400 max-w-2xl">
                  {currentProgram.description}
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3">
                    <Clock3 size={18} className="text-cyan-400" />
                    <span className="text-slate-300">
                      {currentProgram.duration}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3">
                    <FolderKanban size={18} className="text-cyan-400" />
                    <span className="text-slate-300">
                      {currentProgram.projects}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    handleCourseNavigation(currentProgram.id)
                  }
                  className="mt-10 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-4 font-semibold text-slate-950 transition hover:bg-cyan-400 cursor-pointer"
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
                const active = currentProgram.id === program.id;

                return (
                  <motion.button
                    key={program.id}
                    onMouseEnter={() => setActiveProgram(program)}
                    onClick={() => setActiveProgram(program)}
                    className={`w-full text-left rounded-2xl border p-5 transition-all ${
                      active
                        ? "border-cyan-500/30 bg-cyan-500/10"
                        : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-4 cursor-pointer">
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
                onClick={() => navigate("/courses")}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 px-6 py-4 font-medium text-white transition hover:border-cyan-500/30 hover:bg-slate-800"
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
        <div className="lg:hidden space-y-4">
          {programs.map((program, index) => {
            const Icon = program.icon;
            const isOpen = openMobileCourse === index;

            return (
              <div
                key={program.id}
                className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60"
              >
                <button
                  onClick={() =>
                    setOpenMobileCourse(isOpen ? -1 : index)
                  }
                  className="flex w-full items-center justify-between p-5"
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
                    animate={{ rotate: isOpen ? 90 : 0 }}
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
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-slate-800 p-5">
                        <p className="text-slate-400 leading-relaxed">
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
                          onClick={() =>
                            handleCourseNavigation(program.id)
                          }
                          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400 transition cursor-pointer"
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
            onClick={() => navigate("/courses")}
            className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 px-6 py-4 font-medium text-white transition hover:border-cyan-500/30"
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
