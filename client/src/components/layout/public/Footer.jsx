import { useNavigate } from "react-router-dom";

import {
  Code2,
  BrainCircuit,
  ShieldCheck,
  BarChart3,
  Palette,
  Smartphone,
  Server,
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
} from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
  FaYoutube,
  FaXTwitter,
} from "react-icons/fa6";

import logo from "../../../assets/logo.png";
import { useCourses } from "../../../hooks/useCourses";

// ─────────────────────────────────────────────────────────────
// Course icons
// ─────────────────────────────────────────────────────────────

const courseIcons = {
  "full-stack": Code2,
  "ai-ml-engineering": BrainCircuit,
  cybersecurity: ShieldCheck,
  "data-analytics": BarChart3,
  "ui-ux-design": Palette,
  "mobile-app-dev": Smartphone,
  "frontend-dev": Code2,
  "backend-dev": Server,
};

// ─────────────────────────────────────────────────────────────
// Quick links
// ─────────────────────────────────────────────────────────────

const quickLinks = [
  {
    label: "Home",
    path: "/",
  },
  {
    label: "Courses",
    path: "/courses",
  },
  {
    label: "About",
    path: "/about",
  },
  {
    label: "Contact",
    path: "/contact",
  },
];

// ─────────────────────────────────────────────────────────────
// Social links
// ─────────────────────────────────────────────────────────────

const socialLinks = [
  {
    icon: FaFacebookF,
    href: "#",
    label: "Facebook",
  },
  {
    icon: FaInstagram,
    href: "https://www.instagram.com/devadtechnologies",
    label: "Instagram",
  },
  {
    icon: FaXTwitter,
    href: "#",
    label: "X",
  },
  {
    icon: FaYoutube,
    href: "#",
    label: "YouTube",
  },
  {
    icon: FaWhatsapp,
    href: "https://wa.me/2348106551348",
    label: "WhatsApp",
  },
  {
    icon: FaLinkedinIn,
    href: "#",
    label: "LinkedIn",
  },
];

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const getCategorySlug = (category) => {
  if (!category) {
    return "";
  }

  if (typeof category === "object") {
    return category?.slug || "";
  }

  return "";
};

const getCourseSlug = (course) => {
  if (!course || typeof course !== "object") {
    return "";
  }

  return (
    course.slug ||
    getCategorySlug(course.category) ||
    ""
  );
};

const getCourseTitle = (course) => {
  if (!course) {
    return "Untitled Course";
  }

  if (
    typeof course.title === "string" &&
    course.title.trim()
  ) {
    return course.title;
  }

  return "Untitled Course";
};

// ─────────────────────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────────────────────

export default function Footer() {
  const navigate = useNavigate();

  // ───────────────────────────────────────────────────────────
  // Fetch public courses
  //
  // The public backend endpoint already restricts courses
  // to status: "published", so we do NOT send status: "active".
  // ───────────────────────────────────────────────────────────

  const {
    courses = [],
    loading: loadingCourses,
  } = useCourses({
    page: 1,
    limit: 100,
  });

  // ───────────────────────────────────────────────────────────
  // Show maximum 8 courses
  // ───────────────────────────────────────────────────────────

  const visibleCourses = Array.isArray(courses)
    ? courses.slice(0, 8)
    : [];

  // ───────────────────────────────────────────────────────────
  // Navigate to course
  // ───────────────────────────────────────────────────────────

  const handleCourseNavigation = (course) => {
    const courseId =
      course?._id ||
      course?.id ||
      "";

    if (!courseId) {
      console.error(
        "Cannot navigate to course: missing course ID",
        course
      );

      return;
    }

    navigate(`/courses/${courseId}`);
  };

  return (
    <footer className="relative overflow-hidden border-t border-slate-800 bg-slate-950">
      {/* =====================================================
          Background Glow
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-cyan-500/5 blur-3xl" />

        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-8">
        {/* =====================================================
            Top Grid
        ====================================================== */}

        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* ===================================================
              Brand
          ==================================================== */}

          <div>
            <div className="flex items-center gap-4">
              <img
                src={logo}
                alt="Devad Tech Academy"
                className="h-14 w-auto"
              />

              <div>
                <h3 className="text-lg font-bold text-white">
                  DEVAD TECH ACADEMY
                </h3>

                <p className="text-sm text-cyan-400">
                  Building Tomorrow's Tech Leaders.
                </p>
              </div>
            </div>

            {/* Socials */}

            <div className="mt-8 flex flex-wrap gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;

                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/30 hover:text-cyan-400"
                  >
                    <Icon size={17} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* ===================================================
              Courses
          ==================================================== */}

          <div>
            <h3 className="text-lg font-semibold text-white">
              Our Courses
            </h3>

            <ul className="mt-6 space-y-4">
              {loadingCourses ? (
                <>
                  {[1, 2, 3, 4].map((item) => (
                    <li key={item}>
                      <div className="h-5 w-32 animate-pulse rounded bg-slate-800" />
                    </li>
                  ))}
                </>
              ) : visibleCourses.length > 0 ? (
                visibleCourses.map((course) => {
                  const courseSlug =
                    getCourseSlug(course);

                  const Icon =
                    courseIcons[courseSlug] ||
                    Code2;

                  return (
                    <li
                      key={
                        course?._id ||
                        course?.id ||
                        courseSlug ||
                        course?.title
                      }
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleCourseNavigation(
                            course
                          )
                        }
                        className="group flex w-full items-center gap-3 text-left text-slate-400 transition hover:text-cyan-400"
                      >
                        <Icon
                          size={16}
                          className="shrink-0 transition group-hover:translate-x-0.5"
                        />

                        <span className="line-clamp-1">
                          {getCourseTitle(course)}
                        </span>
                      </button>
                    </li>
                  );
                })
              ) : (
                <li className="text-sm text-slate-500">
                  No courses available.
                </li>
              )}
            </ul>

            {/* View All */}

            {!loadingCourses &&
              visibleCourses.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    navigate("/courses")
                  }
                  className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan-400 transition hover:text-cyan-300"
                >
                  View all courses

                  <ArrowUpRight size={14} />
                </button>
              )}
          </div>

          {/* ===================================================
              Quick Links
          ==================================================== */}

          <div>
            <h3 className="text-lg font-semibold text-white">
              Quick Links
            </h3>

            <ul className="mt-6 space-y-4">
              {quickLinks.map(
                ({ label, path }) => (
                  <li key={label}>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(path)
                      }
                      className="group flex w-full items-center gap-2 text-left text-slate-400 transition hover:text-cyan-400"
                    >
                      {label}

                      <ArrowUpRight
                        size={14}
                        className="opacity-0 transition group-hover:opacity-100"
                      />
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* ===================================================
              Contact
          ==================================================== */}

          <div>
            <h3 className="text-lg font-semibold text-white">
              Contact Us
            </h3>

            <div className="mt-6 space-y-5">
              {/* Email */}

              <div className="flex gap-3">
                <Mail
                  size={18}
                  className="mt-1 shrink-0 text-cyan-400"
                />

                <a
                  href="mailto:devadacademy@gmail.com"
                  className="break-all text-slate-400 transition hover:text-cyan-400"
                >
                  devadacademy@gmail.com
                </a>
              </div>

              {/* Phone */}

              <div className="flex gap-3">
                <Phone
                  size={18}
                  className="mt-1 shrink-0 text-cyan-400"
                />

                <a
                  href="tel:+2348106551348"
                  className="text-slate-400 transition hover:text-cyan-400"
                >
                  +234 810 655 1348
                </a>
              </div>

              {/* Location */}

              <div className="flex gap-3">
                <MapPin
                  size={18}
                  className="mt-1 shrink-0 text-cyan-400"
                />

                <span className="text-slate-400">
                  Port Harcourt, Rivers State, Nigeria
                </span>
              </div>
            </div>

            {/* CTA Card */}

            <div className="mt-8 rounded-2xl border border-cyan-500/10 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-5">
              <h4 className="font-semibold text-white">
                Need Help?
              </h4>

              <p className="mt-2 text-sm text-slate-400">
                Speak with our admissions team and
                get guidance on choosing the right
                program.
              </p>

              <a
                href="https://wa.me/2348106551348"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* =====================================================
            Bottom Bar
        ====================================================== */}

        <div className="mt-16 border-t border-slate-800 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-center text-xs text-slate-500 md:text-left">
              © {new Date().getFullYear()} DEVAD TECH
              ACADEMY. All rights reserved.
            </p>

            <div className="flex gap-6 text-sm">
              <button
                type="button"
                onClick={() =>
                  navigate("/privacy")
                }
                className="text-slate-500 transition hover:text-cyan-400"
              >
                Privacy Policy
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/terms")
                }
                className="text-slate-500 transition hover:text-cyan-400"
              >
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
