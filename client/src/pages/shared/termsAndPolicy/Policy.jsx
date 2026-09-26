// src/pages/shared/legal/PrivacyPolicy.jsx

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  LockKeyhole,
  UserRound,
  Database,
  Mail,
  Phone,
  CreditCard,
  FileText,
  Globe2,
  Cookie,
  Eye,
  UserCheck,
  Server,
  AlertTriangle,
  ChevronRight,
  ArrowUpRight,
  Scale,
  KeyRound,
  RefreshCw,
  UserX,
  MessageSquare,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";

// ─────────────────────────────────────────────────────────────
// DEVAD PRIVACY POLICY
// ─────────────────────────────────────────────────────────────

const ACCENT = "#38BDF8";
const ACCENT_BLUE = "#2563EB";

const BG = "#050B14";
const SURFACE = "#0A1220";
const SURFACE_2 = "#0D1728";

const BORDER = "rgba(148,163,184,0.12)";
const ACCENT_BORDER = "rgba(56,189,248,0.20)";

const TEXT_PRIMARY = "#F8FAFC";
const TEXT_SECONDARY = "#94A3B8";
const TEXT_MUTED = "#64748B";

// ─────────────────────────────────────────────────────────────
// POLICY SECTIONS
// ─────────────────────────────────────────────────────────────

const sections = [
  {
    id: "information-we-collect",
    number: "01",
    title: "Information We Collect",
    shortTitle: "Information We Collect",
    icon: Database,
  },
  {
    id: "lawful-basis",
    number: "02",
    title: "Lawful Basis for Processing",
    shortTitle: "Lawful Basis",
    icon: Scale,
  },
  {
    id: "how-we-use-information",
    number: "03",
    title: "How We Use Your Information",
    shortTitle: "How We Use It",
    icon: Eye,
  },
  {
    id: "account-information",
    number: "04",
    title: "Account & Authentication",
    shortTitle: "Account & Authentication",
    icon: UserRound,
  },
  {
    id: "communications",
    number: "05",
    title: "Communications",
    shortTitle: "Communications",
    icon: Mail,
  },
  {
    id: "payments",
    number: "06",
    title: "Payments & Transactions",
    shortTitle: "Payments",
    icon: CreditCard,
  },
  {
    id: "instructor-applications",
    number: "07",
    title: "Instructor Applications",
    shortTitle: "Instructor Applications",
    icon: FileText,
  },
  {
    id: "cookies",
    number: "08",
    title: "Cookies & Similar Technologies",
    shortTitle: "Cookies",
    icon: Cookie,
  },
  {
    id: "third-party-services",
    number: "09",
    title: "Third-Party Services",
    shortTitle: "Third Parties",
    icon: Globe2,
  },
  {
    id: "data-security",
    number: "10",
    title: "Data Security & Breaches",
    shortTitle: "Security & Breaches",
    icon: LockKeyhole,
  },
  {
    id: "data-retention",
    number: "11",
    title: "Data Retention",
    shortTitle: "Data Retention",
    icon: Server,
  },
  {
    id: "your-rights",
    number: "12",
    title: "Your Privacy Rights",
    shortTitle: "Your Rights",
    icon: UserCheck,
  },
  {
    id: "children",
    number: "13",
    title: "Children's Privacy",
    shortTitle: "Children",
    icon: ShieldCheck,
  },
  {
    id: "international-transfers",
    number: "14",
    title: "International Data Transfers",
    shortTitle: "International Transfers",
    icon: Globe2,
  },
  {
    id: "policy-changes",
    number: "15",
    title: "Changes & Contact",
    shortTitle: "Changes & Contact",
    icon: AlertTriangle,
  },
];

// ─────────────────────────────────────────────────────────────
// SMALL UI COMPONENTS
// ─────────────────────────────────────────────────────────────

function SectionHeading({ number, title, icon: Icon }) {
  return (
    <div className="mb-7 flex items-start gap-4">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(56,189,248,0.12), rgba(37,99,235,0.08))",
          border: `1px solid ${ACCENT_BORDER}`,
          boxShadow: "0 0 30px rgba(56,189,248,0.05)",
        }}
      >
        <Icon size={21} style={{ color: ACCENT }} />
      </div>

      <div>
        <div
          className="mb-1.5 text-xs font-bold tracking-[0.2em]"
          style={{ color: ACCENT }}
        >
          SECTION {number}
        </div>

        <h2
          className="text-2xl font-bold tracking-tight md:text-3xl"
          style={{ color: TEXT_PRIMARY }}
        >
          {title}
        </h2>
      </div>
    </div>
  );
}

function PolicySection({
  id,
  number,
  title,
  icon,
  children,
}) {
  return (
    <section
      id={id}
      data-policy-section={id}
      className="scroll-mt-28 border-b py-14 last:border-b-0 md:py-16"
      style={{ borderColor: BORDER }}
    >
      <SectionHeading
        number={number}
        title={title}
        icon={icon}
      />

      <div
        className="space-y-5 text-[15px] leading-8 md:text-base"
        style={{ color: TEXT_SECONDARY }}
      >
        {children}
      </div>
    </section>
  );
}

function InfoCard({
  icon: Icon,
  title,
  children,
}) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{
        background: "rgba(56,189,248,0.035)",
        borderColor: BORDER,
      }}
    >
      <div className="mb-3 flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{
            background: "rgba(56,189,248,0.08)",
          }}
        >
          <Icon size={17} style={{ color: ACCENT }} />
        </div>

        <h3
          className="font-bold"
          style={{ color: TEXT_PRIMARY }}
        >
          {title}
        </h3>
      </div>

      <div
        className="text-sm leading-7"
        style={{ color: TEXT_SECONDARY }}
      >
        {children}
      </div>
    </div>
  );
}

function BulletList({ children }) {
  return (
    <ul className="list-disc space-y-2.5 pl-6">
      {children}
    </ul>
  );
}

function ImportantNote({ children }) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{
        background:
          "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(56,189,248,0.035))",
        borderColor: ACCENT_BORDER,
      }}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          size={19}
          className="mt-1 shrink-0"
          style={{ color: ACCENT }}
        />

        <div
          className="text-sm leading-7"
          style={{ color: TEXT_SECONDARY }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState(
    sections[0].id
  );

  // Desktop sidebar navigation container.
  // We use this ref to automatically reveal the active section
  // whenever the user scrolls through the policy.
  const sidebarNavRef = useRef(null);

  const activeSectionData = useMemo(
    () =>
      sections.find(
        (section) => section.id === activeSection
      ) || sections[0],
    [activeSection]
  );

  // ───────────────────────────────────────────────────────────
  // RESET PAGE POSITION
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, []);

  // ───────────────────────────────────────────────────────────
  // ACTIVE SECTION OBSERVER
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    const sectionElements = sections
      .map((section) =>
        document.getElementById(section.id)
      )
      .filter(Boolean);

    if (!sectionElements.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top -
              b.boundingClientRect.top
          );

        if (visibleEntries.length > 0) {
          setActiveSection(
            visibleEntries[0].target.id
          );
        }
      },
      {
        root: null,
        rootMargin: "-18% 0px -65% 0px",
        threshold: [0, 0.1, 0.25],
      }
    );

    sectionElements.forEach((element) =>
      observer.observe(element)
    );

    return () => observer.disconnect();
  }, []);

  // ───────────────────────────────────────────────────────────
  // AUTO-SCROLL SIDEBAR TO ACTIVE SECTION
  // ───────────────────────────────────────────────────────────
  //
  // When the active policy section changes (for example, when the
  // user reaches section 09 while scrolling the page), the sidebar
  // automatically moves just enough to keep that item visible.
  // "nearest" prevents unnecessary jumps when the item is already
  // visible inside the sidebar.
  useEffect(() => {
    const nav = sidebarNavRef.current;

    if (!nav) return;

    const activeLink = nav.querySelector(
      '[aria-current="location"]'
    );

    if (!activeLink) return;

    activeLink.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }, [activeSection]);

  // ───────────────────────────────────────────────────────────
  // SMOOTH SCROLL
  // ───────────────────────────────────────────────────────────

  const handleSectionClick = (event, sectionId) => {
    event.preventDefault();

    const element =
      document.getElementById(sectionId);

    if (!element) return;

    setActiveSection(sectionId);

    const top =
      element.getBoundingClientRect().top +
      window.scrollY -
      88;

    window.scrollTo({
      top,
      behavior: "smooth",
    });

    window.history.replaceState(
      null,
      "",
      `#${sectionId}`
    );
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: BG,
        color: TEXT_PRIMARY,
      }}
    >
      {/* ─────────────────────────────────────────────────────
          SCROLL PROGRESS
      ───────────────────────────────────────────────────── */}

      <motion.div
        className="fixed left-0 right-0 top-0 z-[100] h-[2px] origin-left"
        style={{
          background:
            "linear-gradient(90deg, #2563EB, #38BDF8)",
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{
          duration: 1.5,
          ease: "easeOut",
        }}
      />

      {/* ─────────────────────────────────────────────────────
          BACKGROUND GLOW
      ───────────────────────────────────────────────────── */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-[-300px] h-[700px] w-[700px] -translate-x-1/2 rounded-full blur-[130px]"
          style={{
            background:
              "radial-gradient(circle, rgba(37,99,235,0.15), transparent 68%)",
          }}
        />

        <div
          className="absolute right-[-200px] top-[32%] h-[520px] w-[520px] rounded-full blur-[140px]"
          style={{
            background:
              "radial-gradient(circle, rgba(56,189,248,0.075), transparent 70%)",
          }}
        />

        <div
          className="absolute bottom-[-200px] left-[-180px] h-[500px] w-[500px] rounded-full blur-[130px]"
          style={{
            background:
              "radial-gradient(circle, rgba(37,99,235,0.08), transparent 70%)",
          }}
        />
      </div>

      {/* ─────────────────────────────────────────────────────
          HERO
      ───────────────────────────────────────────────────── */}

      <section
        className="relative overflow-hidden border-b"
        style={{
          borderColor: BORDER,
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.17]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(56,189,248,0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(56,189,248,0.08) 1px, transparent 1px)
            `,
            backgroundSize: "42px 42px",
            maskImage:
              "linear-gradient(to bottom, black, transparent)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black, transparent)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-28 lg:px-10">
          <div className="max-w-4xl">
            <motion.div
              initial={{
                opacity: 0,
                y: 18,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.5,
              }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
              style={{
                color: ACCENT,
                borderColor: ACCENT_BORDER,
                background:
                  "rgba(56,189,248,0.055)",
              }}
            >
              <ShieldCheck size={15} />
              Your Privacy Matters
            </motion.div>

            <motion.h1
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.55,
                delay: 0.05,
              }}
              className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl"
              style={{
                color: TEXT_PRIMARY,
              }}
            >
              Privacy
              <span
                className="ml-3"
                style={{
                  background:
                    "linear-gradient(90deg, #38BDF8, #2563EB)",
                  WebkitBackgroundClip:
                    "text",
                  WebkitTextFillColor:
                    "transparent",
                }}
              >
                Policy
              </span>
            </motion.h1>

            <motion.p
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.55,
                delay: 0.1,
              }}
              className="mt-6 max-w-3xl text-lg leading-8 md:text-xl"
              style={{
                color: TEXT_SECONDARY,
              }}
            >
              We believe people should understand what happens to
              their information. This policy explains what Devad Tech
              Academy collects, why we collect it, how we use it,
              when it may be shared, and the rights available to you.
            </motion.p>

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.55,
                delay: 0.15,
              }}
              className="mt-8 flex flex-wrap gap-3 text-sm"
            >
              <div
                className="rounded-xl border px-4 py-3"
                style={{
                  background: SURFACE,
                  borderColor: BORDER,
                  color: TEXT_SECONDARY,
                }}
              >
                <span
                  style={{
                    color: TEXT_MUTED,
                  }}
                >
                  Effective date:
                </span>{" "}
                September 25, 2026
              </div>

              <div
                className="rounded-xl border px-4 py-3"
                style={{
                  background: SURFACE,
                  borderColor: BORDER,
                  color: TEXT_SECONDARY,
                }}
              >
                <span
                  style={{
                    color: TEXT_MUTED,
                  }}
                >
                  Last updated:
                </span>{" "}
                September 25, 2026
              </div>

              <div
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-3"
                style={{
                  background:
                    "rgba(56,189,248,0.05)",
                  borderColor: ACCENT_BORDER,
                  color: ACCENT,
                }}
              >
                <LockKeyhole size={15} />
                Data protection & security
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────
          MOBILE CURRENT SECTION
      ───────────────────────────────────────────────────── */}

      <div
        className="sticky top-0 z-40 border-b lg:hidden"
        style={{
          background:
            "rgba(5,11,20,0.94)",
          borderColor: BORDER,
          backdropFilter: "blur(18px)",
        }}
      >
        <div className="mx-auto max-w-7xl px-5 py-3 sm:px-8">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{
                background:
                  "rgba(56,189,248,0.08)",
                border:
                  `1px solid ${ACCENT_BORDER}`,
              }}
            >
              <activeSectionData.icon
                size={17}
                style={{
                  color: ACCENT,
                }}
              />
            </div>

            <div className="min-w-0">
              <div
                className="text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{
                  color: ACCENT,
                }}
              >
                Section {activeSectionData.number}
              </div>

              <div
                className="truncate text-sm font-semibold"
                style={{
                  color: TEXT_PRIMARY,
                }}
              >
                {activeSectionData.title}
              </div>
            </div>

            <span
              className="ml-auto text-xs font-medium"
              style={{
                color: TEXT_MUTED,
              }}
            >
              {activeSectionData.number}/
              {sections.length}
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
          CONTENT
      ───────────────────────────────────────────────────── */}

      <main className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 md:py-12 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[290px_minmax(0,1fr)]">
          {/* ─────────────────────────────────────────────────
              DESKTOP SIDEBAR
          ───────────────────────────────────────────────── */}

          <aside className="hidden lg:block">
            <div
              className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-hidden rounded-2xl border p-4"
              style={{
                background:
                  "rgba(10,18,32,0.92)",
                borderColor: BORDER,
                backdropFilter: "blur(18px)",
              }}
            >
              <div className="mb-4 flex items-center justify-between px-2">
                <div
                  className="text-xs font-bold uppercase tracking-[0.18em]"
                  style={{
                    color: TEXT_MUTED,
                  }}
                >
                  On this page
                </div>

                <div
                  className="text-[10px] font-semibold"
                  style={{
                    color: ACCENT,
                  }}
                >
                  {activeSectionData.number}/
                  {sections.length}
                </div>
              </div>

              <nav
                ref={sidebarNavRef}
                className="max-h-[calc(100vh-14rem)] space-y-1 overflow-y-auto pr-1"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor:
                    "rgba(56,189,248,0.35) transparent",
                }}
              >
                {sections.map((section) => {
                  const Icon = section.icon;

                  const isActive =
                    activeSection === section.id;

                  return (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      onClick={(event) =>
                        handleSectionClick(
                          event,
                          section.id
                        )
                      }
                      aria-current={
                        isActive
                          ? "location"
                          : undefined
                      }
                      className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200"
                      style={{
                        color: isActive
                          ? TEXT_PRIMARY
                          : TEXT_SECONDARY,
                        background: isActive
                          ? "linear-gradient(90deg, rgba(56,189,248,0.10), rgba(37,99,235,0.05))"
                          : "transparent",
                        border: isActive
                          ? `1px solid ${ACCENT_BORDER}`
                          : "1px solid transparent",
                      }}
                    >
                      {/* ACTIVE LEFT LINE */}

                      <span
                        className="absolute left-0 top-1/2 h-6 w-[2px] -translate-y-1/2 rounded-full transition-all duration-300"
                        style={{
                          background: isActive
                            ? ACCENT
                            : "transparent",
                          boxShadow: isActive
                            ? "0 0 12px rgba(56,189,248,0.8)"
                            : "none",
                        }}
                      />

                      {/* NUMBER */}

                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-black transition-all duration-200"
                        style={{
                          color: isActive
                            ? ACCENT
                            : TEXT_MUTED,
                          background: isActive
                            ? "rgba(56,189,248,0.10)"
                            : "rgba(148,163,184,0.04)",
                          border: isActive
                            ? `1px solid ${ACCENT_BORDER}`
                            : "1px solid transparent",
                        }}
                      >
                        {section.number}
                      </span>

                      {/* ICON */}

                      <Icon
                        size={15}
                        className="shrink-0"
                        style={{
                          color: isActive
                            ? ACCENT
                            : TEXT_MUTED,
                        }}
                      />

                      {/* TITLE */}

                      <span className="min-w-0 flex-1 leading-5">
                        {section.title}
                      </span>

                      <ChevronRight
                        size={14}
                        className="shrink-0 transition-all duration-200"
                        style={{
                          color: isActive
                            ? ACCENT
                            : TEXT_MUTED,
                          opacity: isActive
                            ? 1
                            : 0,
                          transform: isActive
                            ? "translateX(0)"
                            : "translateX(-4px)",
                        }}
                      />
                    </a>
                  );
                })}
              </nav>

              {/* ACTIVE STATUS */}

              <div
                className="mt-5 rounded-xl border p-3"
                style={{
                  background:
                    "rgba(56,189,248,0.035)",
                  borderColor: BORDER,
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span
                      className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                      style={{
                        background: ACCENT,
                      }}
                    />

                    <span
                      className="relative inline-flex h-2 w-2 rounded-full"
                      style={{
                        background: ACCENT,
                      }}
                    />
                  </span>

                  <span
                    className="text-[11px] font-medium"
                    style={{
                      color: TEXT_SECONDARY,
                    }}
                  >
                    Currently reading
                  </span>
                </div>

                <div
                  className="mt-1 truncate text-xs font-semibold"
                  style={{
                    color: TEXT_PRIMARY,
                  }}
                >
                  {activeSectionData.title}
                </div>
              </div>
            </div>
          </aside>

          {/* ─────────────────────────────────────────────────
              POLICY ARTICLE
          ───────────────────────────────────────────────── */}

          <article
            className="overflow-hidden rounded-3xl border px-5 sm:px-8 lg:px-12"
            style={{
              background:
                "linear-gradient(180deg, rgba(10,18,32,0.97), rgba(7,14,25,0.97))",
              borderColor: BORDER,
              boxShadow:
                "0 25px 80px rgba(0,0,0,0.20)",
            }}
          >
            {/* ─────────────────────────────────────────────
                INTRODUCTION
            ───────────────────────────────────────────── */}

            <div
              className="border-b py-10 md:py-12"
              style={{
                borderColor: BORDER,
              }}
            >
              <div className="mb-5 flex items-center gap-2">
                <div
                  className="h-px w-8"
                  style={{
                    background: ACCENT,
                  }}
                />

                <span
                  className="text-xs font-bold uppercase tracking-[0.2em]"
                  style={{
                    color: ACCENT,
                  }}
                >
                  Privacy at Devad
                </span>
              </div>

              <div
                className="space-y-5 text-[15px] leading-8 md:text-base"
                style={{
                  color: TEXT_SECONDARY,
                }}
              >
                <p>
                  At{" "}
                  <strong
                    style={{
                      color: TEXT_PRIMARY,
                    }}
                  >
                    Devad Tech Academy
                  </strong>
                  , we respect your privacy and are committed to
                  handling your personal information responsibly.
                </p>

                <p>
                  This Privacy Policy explains how we collect, use,
                  disclose, retain, protect, and otherwise process
                  personal information when you visit our website,
                  create an account, use our learning platform,
                  enroll in courses, communicate with us, apply to
                  teach, make payments, or use other services that
                  link to this policy.
                </p>

                <p>
                  Devad Tech Academy operates from Nigeria. Where
                  applicable, our processing practices are designed
                  to comply with the{" "}
                  <strong
                    style={{
                      color: TEXT_PRIMARY,
                    }}
                  >
                    Nigeria Data Protection Act 2023
                  </strong>{" "}
                  and other applicable data-protection requirements.
                </p>

                <ImportantNote>
                  This Privacy Policy is intended to provide clear
                  information about our data practices. It does not
                  replace any rights you may have under applicable
                  data-protection law.
                </ImportantNote>
              </div>
            </div>

            {/* ─────────────────────────────────────────────
                SECTION 01
            ───────────────────────────────────────────── */}

            <PolicySection
              id="information-we-collect"
              number="01"
              title="Information We Collect"
              icon={Database}
            >
              <p>
                We collect information that you provide directly,
                information generated through your use of our
                services, and limited information that may be
                received from authentication or service providers.
              </p>

              <h3
                className="pt-2 text-lg font-bold"
                style={{
                  color: TEXT_PRIMARY,
                }}
              >
                Information you provide
              </h3>

              <BulletList>
                <li>
                  First name and last name.
                </li>

                <li>
                  Email address.
                </li>

                <li>
                  Phone number.
                </li>

                <li>
                  Password and authentication information.
                </li>

                <li>
                  Account role and verification status.
                </li>

                <li>
                  Course enrollment and learning-related
                  information.
                </li>

                <li>
                  Payment and transaction-related information.
                </li>

                <li>
                  Messages and information submitted through
                  contact or support forms.
                </li>

                <li>
                  Instructor application information.
                </li>

                <li>
                  CVs, resumes, portfolio links, GitHub links,
                  LinkedIn links, and other information voluntarily
                  supplied as part of an instructor application.
                </li>
              </BulletList>

              <h3
                className="pt-2 text-lg font-bold"
                style={{
                  color: TEXT_PRIMARY,
                }}
              >
                Technical and usage information
              </h3>

              <p>
                Depending on the features you use, we may collect
                technical information such as IP address, browser
                type, device information, operating system, pages or
                resources accessed, timestamps, authentication
                events, error information, and security-related
                logs.
              </p>

              <h3
                className="pt-2 text-lg font-bold"
                style={{
                  color: TEXT_PRIMARY,
                }}
              >
                Information from third parties
              </h3>

              <p>
                If you use a third-party authentication or service
                provider, such as Google Sign-In, we may receive
                information that the provider makes available to us
                in accordance with your authorization and that
                provider's policies.
              </p>
            </PolicySection>

            {/* ─────────────────────────────────────────────
                SECTION 02
            ───────────────────────────────────────────── */}

            <PolicySection
              id="lawful-basis"
              number="02"
              title="Lawful Basis for Processing"
              icon={Scale}
            >
              <p>
                We process personal information on an appropriate
                lawful basis depending on the circumstances and the
                purpose of the processing.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <InfoCard
                  icon={CheckCircle2}
                  title="Contract / Service"
                >
                  Processing may be necessary to create and manage
                  your account, provide courses, process enrollment,
                  provide requested services, or perform obligations
                  connected with a service you request.
                </InfoCard>

                <InfoCard
                  icon={UserCheck}
                  title="Consent"
                >
                  Where consent is the appropriate legal basis, we
                  may ask for your consent before carrying out the
                  relevant processing. Where legally permitted, you
                  may withdraw consent.
                </InfoCard>

                <InfoCard
                  icon={ShieldCheck}
                  title="Legal Obligations"
                >
                  We may process information where necessary to
                  comply with applicable laws, lawful requests,
                  accounting requirements, regulatory obligations, or
                  other legal duties.
                </InfoCard>

                <InfoCard
                  icon={LockKeyhole}
                  title="Legitimate Interests"
                >
                  Where permitted by applicable law, we may process
                  information for legitimate interests such as
                  security, fraud prevention, service improvement,
                  platform administration, and protecting our users
                  and systems.
                </InfoCard>
              </div>

              <p>
                The applicable basis depends on the specific
                processing activity. We do not rely on one single
                legal basis for every processing operation.
              </p>
            </PolicySection>

            {/* ─────────────────────────────────────────────
                SECTION 03
            ───────────────────────────────────────────── */}

            <PolicySection
              id="how-we-use-information"
              number="03"
              title="How We Use Your Information"
              icon={Eye}
            >
              <p>
                We use personal information for purposes connected
                with providing, securing, administering, and
                improving Devad Tech Academy.
              </p>

              <BulletList>
                <li>
                  Creating and managing user accounts.
                </li>

                <li>
                  Verifying email addresses and phone numbers.
                </li>

                <li>
                  Authenticating users and maintaining account
                  security.
                </li>

                <li>
                  Providing access to courses and learning
                  resources.
                </li>

                <li>
                  Managing course enrollment and related records.
                </li>

                <li>
                  Processing and confirming payments.
                </li>

                <li>
                  Sending verification codes and authentication
                  messages.
                </li>

                <li>
                  Sending password-reset and account-recovery
                  communications.
                </li>

                <li>
                  Responding to enquiries and support requests.
                </li>

                <li>
                  Reviewing instructor applications.
                </li>

                <li>
                  Detecting and preventing fraud, spam, abuse, and
                  unauthorized access.
                </li>

                <li>
                  Monitoring and improving system reliability,
                  security, and performance.
                </li>

                <li>
                  Improving our website, platform, educational
                  content, and user experience.
                </li>

                <li>
                  Maintaining appropriate business and
                  administrative records.
                </li>

                <li>
                  Complying with applicable legal requirements.
                </li>
              </BulletList>

              <p>
                We do not sell your personal information as a
                commercial product.
              </p>
            </PolicySection>

            {/* ─────────────────────────────────────────────
                SECTION 04
            ───────────────────────────────────────────── */}

            <PolicySection
              id="account-information"
              number="04"
              title="Account & Authentication"
              icon={UserRound}
            >
              <p>
                When you create an account with Devad Tech Academy,
                we collect information required to establish and
                maintain the account.
              </p>

              <p>
                This may include your name, email address, phone
                number, password, account role, account status,
                verification status, and security-related
                information.
              </p>

              <p>
                Passwords are not intended to be stored as readable
                plain-text passwords. Authentication credentials are
                processed using security mechanisms designed to
                protect account information.
              </p>

              <h3
                className="pt-2 text-lg font-bold"
                style={{
                  color: TEXT_PRIMARY,
                }}
              >
                Google authentication
              </h3>

              <p>
                If you choose to authenticate through Google or
                another supported identity provider, we may receive
                information made available by that provider, such as
                your name, email address, and relevant account
                identifiers or profile information.
              </p>

              <p>
                Third-party authentication is subject to the
                applicable provider's own terms and privacy policy.
              </p>
            </PolicySection>

            {/* ─────────────────────────────────────────────
                SECTION 05
            ───────────────────────────────────────────── */}

            <PolicySection
              id="communications"
              number="05"
              title="Communications"
              icon={Mail}
            >
              <p>
                We may communicate with you through email, SMS, or
                other supported channels when necessary to operate
                our services.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <InfoCard
                  icon={Mail}
                  title="Email"
                >
                  Account verification, password recovery, service
                  notifications, support responses, and other
                  transactional communications.
                </InfoCard>

                <InfoCard
                  icon={Phone}
                  title="SMS / Phone"
                >
                  Phone verification, one-time passwords,
                  authentication, security-related notifications, or
                  other service communications where supported.
                </InfoCard>
              </div>

              <p>
                Some communications are necessary for providing the
                service and cannot be treated as optional marketing
                messages.
              </p>

              <p>
                Where we send optional promotional communications, we
                will provide appropriate choices or opt-out
                mechanisms where required by applicable law.
              </p>
            </PolicySection>

            {/* ─────────────────────────────────────────────
                SECTION 06
            ───────────────────────────────────────────── */}

            <PolicySection
              id="payments"
              number="06"
              title="Payments & Transactions"
              icon={CreditCard}
            >
              <p>
                If you purchase a paid course or other paid service,
                payment processing may be performed through a
                third-party payment provider.
              </p>

              <p>
                Depending on the payment method and provider, we may
                receive information such as transaction reference,
                amount, currency, payment status, customer
                information, and other information necessary to
                reconcile and manage the transaction.
              </p>

              <ImportantNote>
                Payment card, banking, or other sensitive payment
                credentials should be entered through the designated
                secure payment interface rather than sent directly
                to Devad Tech Academy through ordinary forms, email,
                or chat.
              </ImportantNote>

              <p>
                Payment providers may process information according
                to their own privacy policies, security practices,
                and terms.
              </p>
            </PolicySection>

            {/* ─────────────────────────────────────────────
                SECTION 07
            ───────────────────────────────────────────── */}

            <PolicySection
              id="instructor-applications"
              number="07"
              title="Instructor Applications"
              icon={FileText}
            >
              <p>
                If you apply to become an instructor, we may collect
                additional information needed to review and manage
                your application.
              </p>

              <BulletList>
                <li>
                  Full name.
                </li>

                <li>
                  Email address.
                </li>

                <li>
                  Phone number.
                </li>

                <li>
                  Area of expertise.
                </li>

                <li>
                  Years of professional experience.
                </li>

                <li>
                  Course or subject you would like to teach.
                </li>

                <li>
                  Portfolio, LinkedIn, GitHub, or similar links.
                </li>

                <li>
                  Teaching or mentoring experience.
                </li>

                <li>
                  CV or resume, where submitted.
                </li>

                <li>
                  Availability.
                </li>

                <li>
                  Your reasons for wanting to teach at Devad Tech
                  Academy.
                </li>
              </BulletList>

              <p>
                This information may be used for recruitment,
                screening, communication, interview coordination,
                application management, and related administrative
                purposes.
              </p>

              <p>
                Submission of an instructor application does not
                guarantee employment, appointment, selection,
                approval, or creation of an instructor account.
              </p>
            </PolicySection>

            {/* ─────────────────────────────────────────────
                SECTION 08
            ───────────────────────────────────────────── */}

            <PolicySection
              id="cookies"
              number="08"
              title="Cookies & Similar Technologies"
              icon={Cookie}
            >
              <p>
                Devad Tech Academy may use cookies, local storage,
                session technologies, and similar technologies to
                support the operation and security of the platform.
              </p>

              <h3
                className="pt-2 text-lg font-bold"
                style={{
                  color: TEXT_PRIMARY,
                }}
              >
                Necessary technologies
              </h3>

              <p>
                Some technologies may be required for authentication,
                session management, security, preferences, or core
                website functionality.
              </p>

              <h3
                className="pt-2 text-lg font-bold"
                style={{
                  color: TEXT_PRIMARY,
                }}
              >
                Optional technologies
              </h3>

              <p>
                Where applicable, additional technologies may be used
                for analytics, performance monitoring, or improving
                the user experience.
              </p>

              <p>
                Your browser may allow you to manage or disable
                certain cookies. Disabling technologies required for
                core functionality may affect your ability to use
                some features.
              </p>
            </PolicySection>

            {/* ─────────────────────────────────────────────
                SECTION 09
            ───────────────────────────────────────────── */}

            <PolicySection
              id="third-party-services"
              number="09"
              title="Third-Party Services"
              icon={Globe2}
            >
              <p>
                We may use third-party providers to help operate
                specific parts of the Devad Tech Academy platform.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <InfoCard
                  icon={KeyRound}
                  title="Authentication"
                >
                  Third-party identity or authentication providers
                  may be used when you choose an external sign-in
                  option.
                </InfoCard>

                <InfoCard
                  icon={Mail}
                  title="Email & Messaging"
                >
                  Email or SMS providers may process contact
                  information to deliver verification codes,
                  transactional messages, or other requested
                  communications.
                </InfoCard>

                <InfoCard
                  icon={CreditCard}
                  title="Payments"
                >
                  Payment processors may handle payment information
                  and transaction processing when you make a
                  purchase.
                </InfoCard>

                <InfoCard
                  icon={Server}
                  title="Cloud & Infrastructure"
                >
                  Hosting, storage, monitoring, security, or
                  infrastructure providers may process technical
                  information necessary to operate the platform.
                </InfoCard>
              </div>

              <p>
                Depending on the service and feature involved, these
                providers may process information on our behalf or
                process certain information independently under their
                own terms.
              </p>

              <p>
                We aim to work with service providers that maintain
                reasonable safeguards appropriate to the information
                they process.
              </p>
            </PolicySection>

            {/* ─────────────────────────────────────────────
                SECTION 10
            ───────────────────────────────────────────── */}

            <PolicySection
              id="data-security"
              number="10"
              title="Data Security & Breaches"
              icon={LockKeyhole}
            >
              <p>
                We take reasonable technical and organizational
                measures designed to protect personal information
                against unauthorized access, alteration, disclosure,
                loss, misuse, or destruction.
              </p>

              <h3
                className="pt-2 text-lg font-bold"
                style={{
                  color: TEXT_PRIMARY,
                }}
              >
                Security measures may include
              </h3>

              <BulletList>
                <li>
                  Password hashing.
                </li>

                <li>
                  Authentication and authorization controls.
                </li>

                <li>
                  Email and phone verification.
                </li>

                <li>
                  Rate limiting and abuse-prevention mechanisms.
                </li>

                <li>
                  Access controls.
                </li>

                <li>
                  Security logging and monitoring.
                </li>

                <li>
                  Secure network connections where supported.
                </li>

                <li>
                  Application and infrastructure security controls.
                </li>
              </BulletList>

              <p>
                Despite these measures, no internet transmission,
                computer system, cloud service, or electronic storage
                system can be guaranteed to be completely secure.
              </p>

              <h3
                className="pt-2 text-lg font-bold"
                style={{
                  color: TEXT_PRIMARY,
                }}
              >
                Security incidents
              </h3>

              <p>
                If we become aware of a personal-data breach that
                requires notification under applicable law, we will
                take appropriate steps to investigate, contain,
                remediate, and provide notifications where legally
                required.
              </p>

              <p>
                If you believe your account has been compromised,
                contact us promptly and change your password where
                possible.
              </p>
            </PolicySection>

            {/* ─────────────────────────────────────────────
                SECTION 11
            ───────────────────────────────────────────── */}

            <PolicySection
              id="data-retention"
              number="11"
              title="Data Retention"
              icon={Server}
            >
              <p>
                We retain personal information for as long as
                reasonably necessary for the purposes for which it
                was collected, including providing services,
                maintaining account records, fulfilling contractual
                obligations, resolving disputes, preventing abuse,
                maintaining security, and complying with applicable
                legal requirements.
              </p>

              <p>
                Retention periods may differ depending on the type of
                information, the purpose for which it was collected,
                whether your account remains active, and applicable
                legal or operational requirements.
              </p>

              <p>
                When information is no longer reasonably required, it
                may be deleted, anonymized, or securely disposed of,
                subject to applicable legal requirements and legitimate
                business needs.
              </p>
            </PolicySection>

            {/* ─────────────────────────────────────────────
                SECTION 12
            ───────────────────────────────────────────── */}

            <PolicySection
              id="your-rights"
              number="12"
              title="Your Privacy Rights"
              icon={UserCheck}
            >
              <p>
                Depending on your circumstances and applicable law,
                you may have rights regarding personal information we
                hold about you.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <InfoCard
                  icon={Eye}
                  title="Access"
                >
                  You may have the right to request access to
                  personal information we hold about you.
                </InfoCard>

                <InfoCard
                  icon={RefreshCw}
                  title="Correction"
                >
                  You may request correction of inaccurate or
                  incomplete personal information.
                </InfoCard>

                <InfoCard
                  icon={UserX}
                  title="Deletion"
                >
                  In applicable circumstances, you may request
                  deletion of personal information.
                </InfoCard>

                <InfoCard
                  icon={LockKeyhole}
                  title="Restriction / Objection"
                >
                  Where applicable, you may request restriction of
                  certain processing or object to particular
                  processing activities.
                </InfoCard>

                <InfoCard
                  icon={CheckCircle2}
                  title="Withdraw Consent"
                >
                  Where processing is based on consent, you may have
                  the right to withdraw that consent, subject to
                  applicable limitations.
                </InfoCard>

                <InfoCard
                  icon={MessageSquare}
                  title="Complaint / Remediation"
                >
                  You may contact us regarding privacy concerns and
                  seek available internal remediation.
                </InfoCard>
              </div>

              <p>
                Exercising a privacy right does not necessarily mean
                that we must delete every record we hold. Certain
                information may need to be retained because of legal,
                security, contractual, accounting, or other lawful
                requirements.
              </p>

              <h3
                className="pt-2 text-lg font-bold"
                style={{
                  color: TEXT_PRIMARY,
                }}
              >
                How to make a request
              </h3>

              <p>
                Send your privacy request to{" "}
                <a
                  href="mailto:devadacademy@gmail.com"
                  className="font-semibold transition-colors hover:text-white"
                  style={{
                    color: ACCENT,
                  }}
                >
                  devadacademy@gmail.com
                </a>
                .
              </p>

              <p>
                We may need to verify your identity before fulfilling
                certain requests in order to protect your information
                from unauthorized disclosure.
              </p>

              <p>
                We aim to respond to valid requests within the period
                required by applicable law.
              </p>

              <ImportantNote>
                If you are not satisfied with how a privacy concern
                is handled, applicable Nigerian data-protection
                requirements may provide a route for you to lodge a
                complaint with the Nigeria Data Protection Commission
                (NDPC).
              </ImportantNote>
            </PolicySection>

            {/* ─────────────────────────────────────────────
                SECTION 13
            ───────────────────────────────────────────── */}

            <PolicySection
              id="children"
              number="13"
              title="Children's Privacy"
              icon={ShieldCheck}
            >
              <p>
                Our services are intended to be used in accordance
                with applicable age and legal requirements.
              </p>

              <p>
                We do not knowingly collect personal information from
                children in circumstances where doing so is prohibited
                by applicable law.
              </p>

              <p>
                If you believe that a child has provided personal
                information to us in circumstances where such
                collection is not permitted, please contact us so we
                can investigate and take appropriate action.
              </p>
            </PolicySection>

            {/* ─────────────────────────────────────────────
                SECTION 14
            ───────────────────────────────────────────── */}

            <PolicySection
              id="international-transfers"
              number="14"
              title="International Data Transfers"
              icon={Globe2}
            >
              <p>
                Devad Tech Academy operates from Nigeria, but some
                technology and service providers we use may operate
                infrastructure or process information outside
                Nigeria.
              </p>

              <p>
                As a result, personal information may be processed or
                stored in another country depending on the service
                involved.
              </p>

              <p>
                Where applicable, we will take appropriate measures
                required by relevant data-protection laws when
                personal information is transferred or processed
                internationally.
              </p>
            </PolicySection>

            {/* ─────────────────────────────────────────────
                SECTION 15
            ───────────────────────────────────────────── */}

            <PolicySection
              id="policy-changes"
              number="15"
              title="Changes & Contact"
              icon={AlertTriangle}
            >
              <h3
                className="text-lg font-bold"
                style={{
                  color: TEXT_PRIMARY,
                }}
              >
                Changes to this Privacy Policy
              </h3>

              <p>
                We may update this Privacy Policy from time to time
                to reflect changes to our services, technology,
                security practices, business operations, legal
                requirements, or data-processing activities.
              </p>

              <p>
                When we make changes, we will update the "Last
                updated" date displayed at the beginning of this
                policy.
              </p>

              <p>
                Where appropriate and where required by applicable
                law, we may provide additional notice of material
                changes through our website, platform, account
                notifications, or other appropriate communication
                channels.
              </p>

              <div
                className="my-7 h-px"
                style={{
                  background: BORDER,
                }}
              />

              <h3
                className="text-lg font-bold"
                style={{
                  color: TEXT_PRIMARY,
                }}
              >
                Contact Devad Tech Academy
              </h3>

              <p>
                If you have questions, concerns, requests, or
                complaints regarding this Privacy Policy or the
                handling of your personal information, contact us
                using the details below.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <InfoCard
                  icon={Mail}
                  title="Email"
                >
                  <a
                    href="mailto:devadacademy@gmail.com"
                    className="font-semibold transition-colors hover:text-white"
                    style={{
                      color: ACCENT,
                    }}
                  >
                    devadacademy@gmail.com
                  </a>
                </InfoCard>

                <InfoCard
                  icon={Phone}
                  title="Phone"
                >
                  <a
                    href="tel:+2348106551348"
                    className="font-semibold transition-colors hover:text-white"
                    style={{
                      color: ACCENT,
                    }}
                  >
                    +234 810 655 1348
                  </a>
                </InfoCard>
              </div>

              <div
                className="mt-6 rounded-2xl border p-5"
                style={{
                  background:
                    "rgba(56,189,248,0.035)",
                  borderColor: BORDER,
                }}
              >
                <div className="flex items-start gap-3">
                  <MessageSquare
                    size={19}
                    className="mt-1 shrink-0"
                    style={{
                      color: ACCENT,
                    }}
                  />

                  <div>
                    <div
                      className="font-semibold"
                      style={{
                        color: TEXT_PRIMARY,
                      }}
                    >
                      Privacy requests
                    </div>

                    <p
                      className="mt-1 text-sm leading-7"
                      style={{
                        color: TEXT_SECONDARY,
                      }}
                    >
                      For privacy requests, please include enough
                      information for us to understand your request.
                      We may request additional information to verify
                      your identity before taking action.
                    </p>
                  </div>
                </div>
              </div>

              <p className="pt-4">
                You may also have the right, under applicable
                Nigerian data-protection law, to lodge a complaint
                with the{" "}
                <strong
                  style={{
                    color: TEXT_PRIMARY,
                  }}
                >
                  Nigeria Data Protection Commission (NDPC)
                </strong>
                .
              </p>

              <a
                href="https://www.ndpc.gov.ng/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-white"
                style={{
                  color: ACCENT,
                }}
              >
                Visit the NDPC
                <ExternalLink size={14} />
              </a>
            </PolicySection>

            {/* ─────────────────────────────────────────────
                FINAL COMMITMENT
            ───────────────────────────────────────────── */}

            <div
              className="my-10 rounded-2xl border p-6 md:p-8"
              style={{
                background:
                  "linear-gradient(135deg, rgba(37,99,235,0.10), rgba(56,189,248,0.045))",
                borderColor: ACCENT_BORDER,
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background:
                      "rgba(56,189,248,0.10)",
                  }}
                >
                  <ShieldCheck
                    size={23}
                    style={{
                      color: ACCENT,
                    }}
                  />
                </div>

                <div>
                  <h3
                    className="text-lg font-bold"
                    style={{
                      color: TEXT_PRIMARY,
                    }}
                  >
                    Our commitment to responsible data handling
                  </h3>

                  <p
                    className="mt-2 text-sm leading-7"
                    style={{
                      color: TEXT_SECONDARY,
                    }}
                  >
                    We aim to collect information that is reasonably
                    necessary for operating our services, protecting
                    our users, fulfilling legitimate business and
                    legal responsibilities, and delivering a reliable
                    learning experience. As Devad Tech Academy grows,
                    we will continue reviewing and improving our
                    privacy and security practices.
                  </p>
                </div>
              </div>
            </div>

            {/* ─────────────────────────────────────────────
                FOOT NAVIGATION
            ───────────────────────────────────────────── */}

            <div
              className="flex flex-col gap-5 border-t py-9 sm:flex-row sm:items-center sm:justify-between"
              style={{
                borderColor: BORDER,
              }}
            >
              <div>
                <div
                  className="text-sm font-semibold"
                  style={{
                    color: TEXT_PRIMARY,
                  }}
                >
                  Need help or have a privacy question?
                </div>

                <div
                  className="mt-1 text-sm"
                  style={{
                    color: TEXT_MUTED,
                  }}
                >
                  Contact the Devad Tech Academy team.
                </div>
              </div>

              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all hover:-translate-y-0.5"
                style={{
                  color: "#FFFFFF",
                  background:
                    "linear-gradient(135deg, #2563EB, #38BDF8)",
                  boxShadow:
                    "0 10px 30px rgba(37,99,235,0.20)",
                }}
              >
                Contact Devad
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
