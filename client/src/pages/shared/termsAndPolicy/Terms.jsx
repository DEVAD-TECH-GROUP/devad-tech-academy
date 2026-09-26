import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileCheck2,
  FileText,
  Globe2,
  GraduationCap,
  Handshake,
  Info,
  KeyRound,
  LockKeyhole,
  Mail,
  Scale,
  Server,
  ShieldCheck,
  UserCheck,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";

const ACCENT = "#38BDF8";
const BG = "#050B14";
const SURFACE = "#0A1220";
const SURFACE_2 = "#0D1728";
const BORDER = "rgba(148,163,184,0.12)";
const ACCENT_BORDER = "rgba(56,189,248,0.20)";
const TEXT_PRIMARY = "#F8FAFC";
const TEXT_SECONDARY = "#94A3B8";
const TEXT_MUTED = "#64748B";

const sections = [
  {
    id: "acceptance",
    number: "01",
    title: "Acceptance of Terms",
    icon: FileCheck2,
  },
  {
    id: "about",
    number: "02",
    title: "About Devad Tech Academy",
    icon: GraduationCap,
  },
  {
    id: "eligibility",
    number: "03",
    title: "Eligibility",
    icon: UserCheck,
  },
  {
    id: "account",
    number: "04",
    title: "Account Registration",
    icon: UserRound,
  },
  {
    id: "responsibilities",
    number: "05",
    title: "User Responsibilities",
    icon: ShieldCheck,
  },
  {
    id: "courses",
    number: "06",
    title: "Courses & Learning Services",
    icon: BookOpen,
  },
  {
    id: "enrollment",
    number: "07",
    title: "Enrollment & Access",
    icon: KeyRound,
  },
  {
    id: "payments",
    number: "08",
    title: "Payments, Fees & Refunds",
    icon: CreditCard,
  },
  {
    id: "intellectual-property",
    number: "09",
    title: "Intellectual Property",
    icon: LockKeyhole,
  },
  {
    id: "student-work",
    number: "10",
    title: "Projects & Student Work",
    icon: FileText,
  },
  {
    id: "instructors",
    number: "11",
    title: "Instructor Terms",
    icon: Users,
  },
  {
    id: "prohibited",
    number: "12",
    title: "Prohibited Activities",
    icon: XCircle,
  },
  {
    id: "third-party",
    number: "13",
    title: "Third-Party Services",
    icon: Server,
  },
  {
    id: "disclaimers",
    number: "14",
    title: "Disclaimers",
    icon: Info,
  },
  {
    id: "liability",
    number: "15",
    title: "Limitation of Liability",
    icon: AlertTriangle,
  },
  {
    id: "termination",
    number: "16",
    title: "Suspension & Termination",
    icon: Scale,
  },
  {
    id: "changes",
    number: "17",
    title: "Changes to These Terms",
    icon: FileText,
  },
  {
    id: "governing-law",
    number: "18",
    title: "Governing Law",
    icon: Globe2,
  },
  {
    id: "contact",
    number: "19",
    title: "Contact Us",
    icon: Mail,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: "easeOut",
    },
  },
};

function Section({ id, number, title, icon: Icon, children }) {
  return (
    <motion.section
      id={id}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.08 }}
      className="scroll-mt-28"
    >
      <div
        className="overflow-hidden rounded-2xl border"
        style={{
          background: SURFACE,
          borderColor: BORDER,
          boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
        }}
      >
        <div
          className="flex items-center gap-4 border-b px-5 py-4 sm:px-7"
          style={{
            borderColor: BORDER,
            background:
              "linear-gradient(90deg, rgba(56,189,248,0.055), transparent)",
          }}
        >
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
            style={{
              color: ACCENT,
              borderColor: ACCENT_BORDER,
              background: "rgba(56,189,248,0.07)",
            }}
          >
            <Icon size={20} />
          </div>

          <div className="min-w-0">
            <div
              className="text-[11px] font-semibold tracking-[0.22em]"
              style={{ color: ACCENT }}
            >
              SECTION {number}
            </div>

            <h2
              className="mt-1 text-lg font-semibold sm:text-xl"
              style={{ color: TEXT_PRIMARY }}
            >
              {title}
            </h2>
          </div>
        </div>

        <div
          className="space-y-5 px-5 py-6 text-sm leading-7 sm:px-7 sm:py-7 sm:text-[15px]"
          style={{ color: TEXT_SECONDARY }}
        >
          {children}
        </div>
      </div>
    </motion.section>
  );
}

function Subheading({ children }) {
  return (
    <h3
      className="pt-1 text-base font-semibold"
      style={{ color: TEXT_PRIMARY }}
    >
      {children}
    </h3>
  );
}

function Paragraph({ children }) {
  return <p>{children}</p>;
}

function BulletList({ children }) {
  return (
    <ul className="space-y-3 pl-1">
      {children}
    </ul>
  );
}

function Bullet({ children }) {
  return (
    <li className="flex gap-3">
      <CheckCircle2
        size={17}
        className="mt-1 shrink-0"
        style={{ color: ACCENT }}
      />
      <span>{children}</span>
    </li>
  );
}

function Notice({ icon: Icon = Info, title, children }) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{
        borderColor: ACCENT_BORDER,
        background: "rgba(56,189,248,0.045)",
      }}
    >
      <div className="flex gap-3">
        <Icon
          size={18}
          className="mt-0.5 shrink-0"
          style={{ color: ACCENT }}
        />

        <div>
          <p
            className="font-semibold"
            style={{ color: TEXT_PRIMARY }}
          >
            {title}
          </p>

          <div className="mt-1 text-sm leading-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function TermsOfService() {
  const [activeSection, setActiveSection] = useState(sections[0].id);

  const sidebarRef = useRef(null);
  const activeButtonRef = useRef(null);
  const scrollingByClickRef = useRef(false);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, []);

  /*
   * Determine the section being read from the page's actual
   * scroll position instead of relying on IntersectionObserver.
   *
   * This prevents sections from rapidly switching when their
   * boundaries overlap the viewport.
   */
  useEffect(() => {
    let ticking = false;

    const updateActiveSection = () => {
      const headerOffset = 125;
      const currentPosition = window.scrollY + headerOffset;

      let currentSection = sections[0].id;

      for (const section of sections) {
        const element = document.getElementById(section.id);

        if (!element) continue;

        const sectionTop =
          element.getBoundingClientRect().top + window.scrollY;

        if (sectionTop <= currentPosition) {
          currentSection = section.id;
        } else {
          break;
        }
      }

      setActiveSection(currentSection);
      ticking = false;
    };

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;

      window.requestAnimationFrame(updateActiveSection);
    };

    const handleResize = () => {
      updateActiveSection();
    };

    updateActiveSection();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  /*
   * Keep the active sidebar item visible.
   */
  useEffect(() => {
    if (scrollingByClickRef.current) return;

    const button = activeButtonRef.current;
    const sidebar = sidebarRef.current;

    if (!button || !sidebar) return;

    const sidebarRect = sidebar.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();

    const topBoundary = sidebarRect.top + 55;
    const bottomBoundary = sidebarRect.bottom - 55;

    if (buttonRect.top < topBoundary) {
      sidebar.scrollTo({
        top:
          sidebar.scrollTop -
          (topBoundary - buttonRect.top),
        behavior: "smooth",
      });
    }

    if (buttonRect.bottom > bottomBoundary) {
      sidebar.scrollTo({
        top:
          sidebar.scrollTop +
          (buttonRect.bottom - bottomBoundary),
        behavior: "smooth",
      });
    }
  }, [activeSection]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);

    if (!element) return;

    scrollingByClickRef.current = true;

    setActiveSection(id);

    const headerOffset = 110;

    const targetPosition =
      element.getBoundingClientRect().top +
      window.scrollY -
      headerOffset;

    window.scrollTo({
      top: Math.max(targetPosition, 0),
      behavior: "smooth",
    });

    window.history.replaceState(
      null,
      "",
      `#${id}`
    );

    window.setTimeout(() => {
      scrollingByClickRef.current = false;
    }, 900);
  };

  return (
    <div
      className="min-h-screen pt-28"
      style={{
        background: BG,
        color: TEXT_PRIMARY,
      }}
    >
      {/* Background grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.16]"
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(rgba(56,189,248,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56,189,248,0.08) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage:
            "linear-gradient(to bottom, black, transparent 85%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black, transparent 85%)",
        }}
      />

      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed left-1/2 top-0 h-[520px] w-[720px] -translate-x-1/2 rounded-full blur-3xl"
        aria-hidden="true"
        style={{
          background: "rgba(37,99,235,0.08)",
        }}
      />

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className="mx-auto max-w-4xl text-center"
        >
          <div
            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border"
            style={{
              borderColor: ACCENT_BORDER,
              background: "rgba(56,189,248,0.07)",
              color: ACCENT,
              boxShadow:
                "0 0 35px rgba(56,189,248,0.10)",
            }}
          >
            <Handshake size={27} />
          </div>

          <div
            className="mb-3 text-xs font-semibold uppercase tracking-[0.28em]"
            style={{ color: ACCENT }}
          >
            DEVAD TECH ACADEMY
          </div>

          <h1
            className="text-3xl font-bold tracking-tight sm:text-5xl"
            style={{ color: TEXT_PRIMARY }}
          >
            Terms of Service
          </h1>

          <p
            className="mx-auto mt-5 max-w-2xl text-sm leading-7 sm:text-base"
            style={{ color: TEXT_SECONDARY }}
          >
            These Terms of Service explain the rules, responsibilities,
            conditions, and expectations that apply when you access or use
            Devad Tech Academy and its learning services.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs">
            <span
              className="rounded-full border px-4 py-2"
              style={{
                borderColor: BORDER,
                background: SURFACE,
                color: TEXT_MUTED,
              }}
            >
              Last Updated: September 2026
            </span>

            <Link
              to="/privacy"
              className="group inline-flex items-center gap-2 rounded-full border px-4 py-2 transition hover:border-sky-400/40"
              style={{
                borderColor: ACCENT_BORDER,
                background: "rgba(56,189,248,0.05)",
                color: ACCENT,
              }}
            >
              Privacy Policy
              <ArrowUpRight
                size={14}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </motion.div>

        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="mx-auto mt-10 max-w-4xl rounded-2xl border p-5 sm:p-7"
          style={{
            background:
              "linear-gradient(135deg, rgba(56,189,248,0.07), rgba(10,18,32,0.92))",
            borderColor: ACCENT_BORDER,
          }}
        >
          <div className="flex gap-4">
            <Scale
              size={21}
              className="mt-1 shrink-0"
              style={{ color: ACCENT }}
            />

            <div>
              <h2
                className="text-base font-semibold sm:text-lg"
                style={{ color: TEXT_PRIMARY }}
              >
                Please read these Terms carefully
              </h2>

              <p
                className="mt-2 text-sm leading-7"
                style={{ color: TEXT_SECONDARY }}
              >
                By creating an account, enrolling in a course, purchasing
                a service, applying as an instructor, or otherwise using
                Devad Tech Academy, you agree to follow these Terms and
                any policies or rules referenced in them.
              </p>

              <p
                className="mt-3 text-sm leading-7"
                style={{ color: TEXT_SECONDARY }}
              >
                If you do not agree with these Terms, please do not use
                the Academy or its services.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main layout */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div
              className="overflow-hidden rounded-2xl border"
              style={{
                background: "rgba(10,18,32,0.88)",
                borderColor: BORDER,
                backdropFilter: "blur(16px)",
              }}
            >
              <div
                className="border-b px-5 py-4"
                style={{
                  borderColor: BORDER,
                }}
              >
                <div
                  className="text-[10px] font-semibold uppercase tracking-[0.25em]"
                  style={{ color: TEXT_MUTED }}
                >
                  On this page
                </div>

                <div
                  className="mt-1 text-sm font-semibold"
                  style={{ color: TEXT_PRIMARY }}
                >
                  Terms Navigation
                </div>
              </div>

              <div
                ref={sidebarRef}
                className="relative p-3 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor:
                    "rgba(56,189,248,0.25) transparent",
                }}
              >
                <div className="space-y-1">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    const isActive =
                      activeSection === section.id;

                    return (
                      <button
                        key={section.id}
                        ref={
                          isActive
                            ? activeButtonRef
                            : null
                        }
                        type="button"
                        onClick={() =>
                          scrollToSection(section.id)
                        }
                        className="group relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200"
                        style={{
                          background: isActive
                            ? "rgba(56,189,248,0.075)"
                            : "transparent",
                          color: isActive
                            ? TEXT_PRIMARY
                            : TEXT_SECONDARY,
                        }}
                      >
                        {isActive && (
                          <span
                            className="absolute bottom-2 left-0 top-2 w-[2px] rounded-full"
                            style={{
                              background: ACCENT,
                              boxShadow:
                                "0 0 12px rgba(56,189,248,0.8)",
                            }}
                          />
                        )}

                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-[10px] font-bold"
                          style={{
                            borderColor: isActive
                              ? ACCENT_BORDER
                              : BORDER,
                            background: isActive
                              ? "rgba(56,189,248,0.08)"
                              : "rgba(148,163,184,0.025)",
                            color: isActive
                              ? ACCENT
                              : TEXT_MUTED,
                          }}
                        >
                          {section.number}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span
                            className="block truncate text-xs font-medium"
                            style={{
                              color: isActive
                                ? TEXT_PRIMARY
                                : TEXT_SECONDARY,
                            }}
                          >
                            {section.title}
                          </span>

                          {isActive && (
                            <span
                              className="mt-0.5 block text-[9px] uppercase tracking-[0.15em]"
                              style={{
                                color: ACCENT,
                              }}
                            >
                              Currently reading
                            </span>
                          )}
                        </span>

                        <Icon
                          size={15}
                          className="shrink-0"
                          style={{
                            color: isActive
                              ? ACCENT
                              : TEXT_MUTED,
                          }}
                        />

                        <ChevronRight
                          size={14}
                          className="shrink-0 transition-transform group-hover:translate-x-0.5"
                          style={{
                            color: isActive
                              ? ACCENT
                              : TEXT_MUTED,
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="space-y-6">
            <Section
              id="acceptance"
              number="01"
              title="Acceptance of Terms"
              icon={FileCheck2}
            >
              <Paragraph>
                These Terms of Service ("Terms") govern your access to
                and use of Devad Tech Academy, including our website,
                learning platform, courses, student accounts,
                instructor services, communications, and related
                digital services.
              </Paragraph>

              <Paragraph>
                By accessing or using any part of the Academy, you
                confirm that you have read, understood, and agree to
                these Terms. If you are using the Academy on behalf of
                another person or organization, you confirm that you
                have authority to accept these Terms on their behalf.
              </Paragraph>

              <Notice title="Agreement">
                If you do not agree to these Terms, you should not
                create an account, enroll in a paid service, or use
                the Academy.
              </Notice>
            </Section>

            <Section
              id="about"
              number="02"
              title="About Devad Tech Academy"
              icon={GraduationCap}
            >
              <Paragraph>
                Devad Tech Academy is a technology education platform
                focused on practical learning, mentorship, projects,
                technical skills, and professional development.
              </Paragraph>

              <Paragraph>
                Our services may include online courses, learning
                materials, practical sessions, projects, assessments,
                mentorship, communities, certificates, referrals,
                instructor-led sessions, career resources, and other
                educational services.
              </Paragraph>

              <Paragraph>
                The exact services available to you may depend on the
                program, course, enrollment plan, instructor, or
                offering you select.
              </Paragraph>
            </Section>

            <Section
              id="eligibility"
              number="03"
              title="Eligibility"
              icon={UserCheck}
            >
              <Paragraph>
                You must provide information that is accurate and
                sufficient for us to provide the service you request.
              </Paragraph>

              <BulletList>
                <Bullet>
                  You must be legally capable of entering into the
                  applicable agreement.
                </Bullet>

                <Bullet>
                  You must provide truthful registration and
                  enrollment information.
                </Bullet>

                <Bullet>
                  You must comply with applicable laws and regulations.
                </Bullet>

                <Bullet>
                  Where a service requires parental or guardian
                  authorization under applicable law, that
                  authorization must be obtained.
                </Bullet>
              </BulletList>

              <Paragraph>
                We may restrict access to a service where applicable
                legal, safety, age, verification, or program
                requirements are not satisfied.
              </Paragraph>
            </Section>

            <Section
              id="account"
              number="04"
              title="Account Registration"
              icon={UserRound}
            >
              <Paragraph>
                Some Academy features require you to create an account.
                You are responsible for maintaining the accuracy of
                your account information and keeping your login
                credentials secure.
              </Paragraph>

              <BulletList>
                <Bullet>
                  You must not create an account using false,
                  misleading, or impersonating information.
                </Bullet>

                <Bullet>
                  You must not share your password or authentication
                  credentials with another person.
                </Bullet>

                <Bullet>
                  You must promptly notify us if you believe your
                  account has been compromised.
                </Bullet>

                <Bullet>
                  You are responsible for activity performed through
                  your account, subject to applicable law.
                </Bullet>
              </BulletList>

              <Paragraph>
                We may use email verification, phone verification,
                Google Sign-In, security checks, rate limits, or other
                authentication measures to protect accounts and the
                Academy.
              </Paragraph>
            </Section>

            <Section
              id="responsibilities"
              number="05"
              title="User Responsibilities"
              icon={ShieldCheck}
            >
              <Paragraph>
                You agree to use the Academy respectfully, lawfully,
                and in a manner that does not interfere with other
                learners, instructors, staff, systems, or services.
              </Paragraph>

              <Subheading>
                You are responsible for:
              </Subheading>

              <BulletList>
                <Bullet>
                  Completing your own learning activities and
                  assignments honestly.
                </Bullet>

                <Bullet>
                  Respecting instructors, staff, mentors, and other
                  learners.
                </Bullet>

                <Bullet>
                  Keeping your account and access credentials secure.
                </Bullet>

                <Bullet>
                  Using course materials only for permitted educational
                  purposes.
                </Bullet>

                <Bullet>
                  Providing accurate information when registering,
                  enrolling, applying, or communicating with us.
                </Bullet>

                <Bullet>
                  Following applicable laws and the rules of any
                  Academy community or program.
                </Bullet>
              </BulletList>
            </Section>

            <Section
              id="courses"
              number="06"
              title="Courses & Learning Services"
              icon={BookOpen}
            >
              <Paragraph>
                Course descriptions, curriculum, schedules, instructors,
                learning materials, project requirements, session
                formats, and other educational details may vary between
                programs.
              </Paragraph>

              <Paragraph>
                We may update educational content when reasonably
                necessary to improve accuracy, relevance, technology,
                security, instructional quality, or program delivery.
              </Paragraph>

              <Paragraph>
                Educational materials are provided for learning and
                professional-development purposes. Completing a course
                does not by itself guarantee employment, promotion,
                income, admission, certification by an external body,
                or any particular professional outcome.
              </Paragraph>

              <Notice title="Learning outcomes">
                Your results can depend on factors including your
                participation, practice, prior knowledge, project work,
                assessment performance, available opportunities, and
                circumstances outside the Academy's control.
              </Notice>
            </Section>

            <Section
              id="enrollment"
              number="07"
              title="Enrollment & Access"
              icon={KeyRound}
            >
              <Paragraph>
                Enrollment gives you the access specifically described
                for the course or program you purchased or were
                otherwise authorized to use.
              </Paragraph>

              <BulletList>
                <Bullet>
                  Access may be limited by the duration or terms of the
                  selected program.
                </Bullet>

                <Bullet>
                  You may not transfer paid course access to another
                  person unless we expressly authorize the transfer.
                </Bullet>

                <Bullet>
                  You may not resell, sublicense, publish, or
                  redistribute restricted course access.
                </Bullet>

                <Bullet>
                  Access may depend on maintaining an active account
                  and complying with these Terms.
                </Bullet>
              </BulletList>

              <Paragraph>
                If a course includes live sessions, project reviews,
                mentorship, community access, or other scheduled
                activities, the applicable program information may
                contain additional participation requirements.
              </Paragraph>
            </Section>

            <Section
              id="payments"
              number="08"
              title="Payments, Fees & Refunds"
              icon={CreditCard}
            >
              <Paragraph>
                Prices, payment schedules, installment arrangements,
                discounts, promotions, and applicable taxes or charges
                will be presented with the relevant offering where
                applicable.
              </Paragraph>

              <Paragraph>
                Payments may be processed through third-party payment
                providers. We generally do not receive or store your
                full payment-card credentials when the payment provider
                processes those credentials directly.
              </Paragraph>

              <Subheading>
                Refunds and cancellations
              </Subheading>

              <Paragraph>
                Refund eligibility depends on the specific course,
                enrollment arrangement, promotional terms, and
                applicable law. Any refund terms presented to you at
                the time of purchase form part of the applicable
                transaction.
              </Paragraph>

              <Paragraph>
                Nothing in these Terms is intended to remove or limit
                any consumer right or remedy that cannot lawfully be
                excluded.
              </Paragraph>

              <Notice
                icon={CreditCard}
                title="Payment records"
              >
                Keep your payment confirmation, receipt, or transaction
                reference where available. These records may help us
                investigate payment or enrollment issues.
              </Notice>
            </Section>

            <Section
              id="intellectual-property"
              number="09"
              title="Intellectual Property"
              icon={LockKeyhole}
            >
              <Paragraph>
                Unless otherwise stated, the Academy's website,
                branding, logos, interface design, course materials,
                written content, graphics, videos, software, and other
                original materials are owned by or licensed to Devad
                Tech Academy and are protected by applicable
                intellectual-property laws.
              </Paragraph>

              <Paragraph>
                Your enrollment does not transfer ownership of Academy
                intellectual property to you.
              </Paragraph>

              <Subheading>
                Permitted use
              </Subheading>

              <BulletList>
                <Bullet>
                  You may access course materials for the educational
                  purpose for which they were provided.
                </Bullet>

                <Bullet>
                  You may make reasonable personal study notes and
                  copies where permitted.
                </Bullet>

                <Bullet>
                  You may use your own completed work in portfolios
                  subject to the rights of other contributors and any
                  applicable project restrictions.
                </Bullet>
              </BulletList>

              <Subheading>
                You may not:
              </Subheading>

              <BulletList>
                <Bullet>
                  Sell, reproduce, publish, or redistribute protected
                  Academy materials without authorization.
                </Bullet>

                <Bullet>
                  Upload restricted course materials to unauthorized
                  websites, repositories, or file-sharing platforms.
                </Bullet>

                <Bullet>
                  Remove copyright, ownership, attribution, or other
                  proprietary notices.
                </Bullet>

                <Bullet>
                  Claim Academy-created materials as your own original
                  work.
                </Bullet>
              </BulletList>
            </Section>

            <Section
              id="student-work"
              number="10"
              title="Projects & Student Work"
              icon={FileText}
            >
              <Paragraph>
                Devad Tech Academy encourages learners to build
                practical projects as part of their education.
              </Paragraph>

              <Paragraph>
                Unless separately agreed, you generally retain the
                rights you lawfully hold in original work that you
                independently create.
              </Paragraph>

              <Paragraph>
                However, a project may contain Academy materials,
                third-party software, open-source components, instructor
                contributions, team contributions, or other protected
                material. You are responsible for respecting the rights
                and licenses associated with those components.
              </Paragraph>

              <Notice title="Portfolio use">
                If you publish a project publicly, make sure you have
                permission to publish any material, code, data, images,
                credentials, or intellectual property belonging to
                someone else.
              </Notice>
            </Section>

            <Section
              id="instructors"
              number="11"
              title="Instructor Terms"
              icon={Users}
            >
              <Paragraph>
                Individuals who apply to teach, mentor, or contribute
                educational content through Devad Tech Academy may be
                subject to additional onboarding, verification,
                contractual, quality, and content requirements.
              </Paragraph>

              <BulletList>
                <Bullet>
                  Instructor applicants must provide accurate
                  professional information.
                </Bullet>

                <Bullet>
                  Instructors must provide educational content that
                  they have the right to use and distribute.
                </Bullet>

                <Bullet>
                  Instructors must respect learner privacy and
                  confidentiality.
                </Bullet>

                <Bullet>
                  Instructors must not intentionally provide
                  misleading, fraudulent, or unlawful educational
                  content.
                </Bullet>

                <Bullet>
                  Additional instructor agreements may apply to
                  compensation, ownership, confidentiality, content
                  licensing, and responsibilities.
                </Bullet>
              </BulletList>
            </Section>

            <Section
              id="prohibited"
              number="12"
              title="Prohibited Activities"
              icon={XCircle}
            >
              <Paragraph>
                You may not use the Academy to engage in activities
                that are unlawful, fraudulent, abusive, deceptive,
                harmful, or that interfere with the Academy or other
                users.
              </Paragraph>

              <BulletList>
                <Bullet>
                  Attempting to gain unauthorized access to accounts,
                  systems, databases, APIs, or infrastructure.
                </Bullet>

                <Bullet>
                  Circumventing security controls, rate limits,
                  verification systems, or access restrictions.
                </Bullet>

                <Bullet>
                  Creating accounts for abusive, fraudulent, or
                  deceptive purposes.
                </Bullet>

                <Bullet>
                  Uploading malware, malicious code, harmful files, or
                  destructive content.
                </Bullet>

                <Bullet>
                  Harassing, threatening, impersonating, or abusing
                  other users or Academy personnel.
                </Bullet>

                <Bullet>
                  Cheating, plagiarism, impersonation, or submitting
                  another person's work as your own.
                </Bullet>

                <Bullet>
                  Scraping, copying, extracting, or systematically
                  harvesting restricted Academy content without
                  authorization.
                </Bullet>

                <Bullet>
                  Using Academy services for activities that violate
                  applicable laws or third-party rights.
                </Bullet>
              </BulletList>
            </Section>

            <Section
              id="third-party"
              number="13"
              title="Third-Party Services"
              icon={Server}
            >
              <Paragraph>
                The Academy may rely on or integrate with third-party
                services for functions such as authentication,
                payments, email, SMS, hosting, cloud storage, analytics,
                security, communications, and other infrastructure.
              </Paragraph>

              <Paragraph>
                Third-party services may have their own terms,
                conditions, privacy policies, and operational
                requirements. Your use of those services may therefore
                also be subject to their respective terms.
              </Paragraph>

              <Paragraph>
                We are not responsible for the independent operation,
                availability, policies, or practices of third-party
                services outside our reasonable control.
              </Paragraph>
            </Section>

            <Section
              id="disclaimers"
              number="14"
              title="Disclaimers"
              icon={Info}
            >
              <Paragraph>
                We aim to provide reliable, useful, and current
                educational services, but the Academy cannot guarantee
                that every service, course, feature, system, or piece
                of content will always be uninterrupted, error-free,
                complete, or available.
              </Paragraph>

              <Paragraph>
                Educational information can change as technologies,
                standards, tools, frameworks, laws, and industry
                practices evolve. Learners should use appropriate
                judgment and verify information where the consequences
                of an error could be significant.
              </Paragraph>

              <Paragraph>
                Unless expressly stated in an applicable written
                agreement, the Academy does not guarantee a specific
                academic, employment, business, income, or career
                outcome.
              </Paragraph>
            </Section>

            <Section
              id="liability"
              number="15"
              title="Limitation of Liability"
              icon={AlertTriangle}
            >
              <Paragraph>
                To the extent permitted by applicable law, Devad Tech
                Academy will not be responsible for losses resulting
                from circumstances outside its reasonable control,
                including failures of third-party infrastructure,
                internet connectivity, unauthorized access caused by
                compromised user credentials, or events beyond the
                Academy's reasonable control.
              </Paragraph>

              <Paragraph>
                Nothing in these Terms is intended to exclude or limit
                liability where applicable law does not permit such
                exclusion or limitation.
              </Paragraph>

              <Notice
                icon={ShieldCheck}
                title="Consumer protections preserved"
              >
                These Terms are not intended to remove statutory
                consumer protections, remedies, or rights that cannot
                lawfully be excluded or waived.
              </Notice>
            </Section>

            <Section
              id="termination"
              number="16"
              title="Suspension & Termination"
              icon={Scale}
            >
              <Paragraph>
                You may stop using the Academy at any time. Certain
                contractual, payment, intellectual-property,
                confidentiality, or legal obligations may continue
                after you stop using the service where applicable.
              </Paragraph>

              <Paragraph>
                We may suspend or restrict an account where reasonably
                necessary to protect users, the Academy, its systems,
                educational materials, or third parties, including
                where there is suspected fraud, abuse, unauthorized
                access, serious misconduct, or violation of these
                Terms.
              </Paragraph>

              <Paragraph>
                Where appropriate and reasonably practicable, we may
                provide notice or an opportunity to resolve an issue
                before restricting access, except where immediate
                action is necessary for security, legal, or safety
                reasons.
              </Paragraph>

              <Paragraph>
                Termination or suspension does not automatically
                eliminate rights or obligations that accrued before
                termination.
              </Paragraph>
            </Section>

            <Section
              id="changes"
              number="17"
              title="Changes to These Terms"
              icon={FileText}
            >
              <Paragraph>
                We may update these Terms from time to time to reflect
                changes in our services, technology, legal requirements,
                security practices, or business operations.
              </Paragraph>

              <Paragraph>
                When changes are made, we may update the "Last Updated"
                date and, where appropriate, provide additional notice
                through the Academy or other reasonable communication
                channels.
              </Paragraph>

              <Paragraph>
                Your continued use of the Academy after updated Terms
                become effective indicates that you accept the updated
                Terms to the extent permitted by applicable law.
              </Paragraph>

              <Notice title="Material changes">
                Where a change materially affects your rights or
                obligations, we may provide additional notice or require
                renewed acceptance where appropriate.
              </Notice>
            </Section>

            <Section
              id="governing-law"
              number="18"
              title="Governing Law"
              icon={Globe2}
            >
              <Paragraph>
                These Terms are intended to be governed by the laws of
                the Federal Republic of Nigeria, subject to any
                mandatory legal protections or jurisdictional rules
                that may apply to a particular user or transaction.
              </Paragraph>

              <Paragraph>
                Any dispute should, where reasonably possible, first be
                raised with Devad Tech Academy so that the parties have
                an opportunity to seek an appropriate resolution.
              </Paragraph>

              <Paragraph>
                Nothing in these Terms prevents a consumer or other
                protected person from exercising rights or remedies
                available under applicable law.
              </Paragraph>
            </Section>

            <Section
              id="contact"
              number="19"
              title="Contact Us"
              icon={Mail}
            >
              <Paragraph>
                If you have questions about these Terms, a course,
                enrollment, payment, account, instructor application,
                or another Academy service, you can contact us using
                the details below.
              </Paragraph>

              <div className="grid gap-4 sm:grid-cols-2">
                <a
                  href="mailto:devadacademy@gmail.com"
                  className="group rounded-2xl border p-5 transition-all hover:-translate-y-0.5"
                  style={{
                    background: SURFACE_2,
                    borderColor: BORDER,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{
                        color: ACCENT,
                        background:
                          "rgba(56,189,248,0.08)",
                      }}
                    >
                      <Mail size={19} />
                    </div>

                    <ArrowUpRight
                      size={17}
                      style={{ color: TEXT_MUTED }}
                      className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </div>

                  <div
                    className="mt-4 text-xs uppercase tracking-[0.16em]"
                    style={{ color: TEXT_MUTED }}
                  >
                    Email
                  </div>

                  <div
                    className="mt-1 text-sm font-medium"
                    style={{ color: TEXT_PRIMARY }}
                  >
                    devadacademy@gmail.com
                  </div>
                </a>

                <a
                  href="tel:+2348106551348"
                  className="group rounded-2xl border p-5 transition-all hover:-translate-y-0.5"
                  style={{
                    background: SURFACE_2,
                    borderColor: BORDER,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{
                        color: ACCENT,
                        background:
                          "rgba(56,189,248,0.08)",
                      }}
                    >
                      <Handshake size={19} />
                    </div>

                    <ArrowUpRight
                      size={17}
                      style={{ color: TEXT_MUTED }}
                      className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </div>

                  <div
                    className="mt-4 text-xs uppercase tracking-[0.16em]"
                    style={{ color: TEXT_MUTED }}
                  >
                    Phone
                  </div>

                  <div
                    className="mt-1 text-sm font-medium"
                    style={{ color: TEXT_PRIMARY }}
                  >
                    +234 810 655 1348
                  </div>
                </a>
              </div>

              <Link
                to="/contact"
                className="group inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5"
                style={{
                  color: ACCENT,
                  borderColor: ACCENT_BORDER,
                  background: "rgba(56,189,248,0.06)",
                }}
              >
                Visit Contact Page
                <ArrowUpRight
                  size={16}
                  className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </Link>
            </Section>

            {/*
             * Extra bottom space is intentional.
             *
             * It allows Section 19 to reach the same reading position
             * as the earlier sections instead of becoming trapped at
             * the bottom of the document before the sidebar activates it.
             */}
            <div
              aria-hidden="true"
              className="h-[45vh] min-h-[300px]"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
