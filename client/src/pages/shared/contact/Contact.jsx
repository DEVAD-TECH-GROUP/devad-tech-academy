import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MessageCircle,
  Clock,
  BookOpen,
  UserPlus,
  Map,
  Wrench,
  Handshake,
  Building2,
  HelpCircle,
  Code2,
  ArrowRight,
  Briefcase,
  GraduationCap,
  ChevronRight,
  FileText,
} from "lucide-react";

import { C } from "../../../components/instructor/applicationUI";

const {
  ACCENT,
  ACCENT_LIGHT,
  ACCENT_BORDER,
  BG,
  SURFACE,
  BORDER,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_MUTED,
} = C;

const APPLY_PATH = "/apply-instructor";

const helpTopics = [
  { icon: BookOpen, label: "Course Information" },
  { icon: UserPlus, label: "Admissions & Enrollment" },
  { icon: Map, label: "Learning Paths & Career Guidance" },
  { icon: Wrench, label: "Technical Support" },
  { icon: Handshake, label: "Partnership Opportunities" },
  { icon: Building2, label: "Corporate Training" },
  { icon: HelpCircle, label: "General Questions" },
];

const applicationChecklist = [
  "Your expertise and years of experience",
  "Education and certifications",
  "Teaching or mentoring background",
  "CV / resume (optional)",
];

function SectionLabel({ children }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.13em",
        textTransform: "uppercase",
        color: ACCENT,
        marginBottom: "0.7rem",
      }}
    >
      <span
        style={{
          width: 20,
          height: 1,
          background: ACCENT,
          display: "inline-block",
          boxShadow: `0 0 8px ${ACCENT}`,
        }}
      />
      {children}
    </div>
  );
}

function IconBox({ icon: Icon, size = 38, iconSize = 17 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        background: ACCENT_LIGHT,
        border: `1px solid ${ACCENT_BORDER}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon size={iconSize} color={ACCENT} />
    </div>
  );
}

function ContactCard({ icon, label, lines }) {
  return (
    <div
      style={{
        background: SURFACE,
        border: `1px solid ${BORDER}`,
        borderRadius: 14,
        padding: "1.15rem 1.25rem",
        display: "flex",
        gap: 13,
        alignItems: "flex-start",
      }}
    >
      <IconBox icon={icon} />

      <div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: TEXT_MUTED,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 4,
          }}
        >
          {label}
        </div>

        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              fontSize: i === 0 ? 14 : 12,
              color: i === 0 ? TEXT_PRIMARY : TEXT_SECONDARY,
              lineHeight: 1.6,
            }}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ContactUs() {
  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "'Inter', system-ui, sans-serif",
        background: BG,
        color: TEXT_PRIMARY,
        lineHeight: 1.7,
        overflow: "hidden",
      }}
    >
      {/* NAV */}
      <header
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          padding: "0 1.5rem",
          borderBottom: `1px solid ${BORDER}`,
          background: "rgba(5,11,20,0.85)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            width: "100%",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #0EA5E9, #2563EB)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 24px rgba(37,99,235,0.3)",
            }}
          >
            <Code2 size={18} color="#fff" />
          </div>

          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>
              DEVAD TECH ACADEMY
            </div>
            <div
              style={{
                fontSize: 9,
                color: TEXT_MUTED,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}
            >
              Learn • Build • Grow
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "6rem 1.5rem 4.5rem",
          textAlign: "center",
          borderBottom: `1px solid ${BORDER}`,
          background: `
            radial-gradient(circle at 50% -15%, rgba(37,99,235,0.28), transparent 48%),
            radial-gradient(circle at 15% 60%, rgba(56,189,248,0.06), transparent 30%),
            ${BG}
          `,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.17,
            backgroundImage: `
              linear-gradient(rgba(56,189,248,0.12) 1px, transparent 1px),
              linear-gradient(90deg, rgba(56,189,248,0.12) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
            maskImage: "linear-gradient(to bottom, black, transparent 85%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", maxWidth: 800, margin: "0 auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              borderRadius: 999,
              background: ACCENT_LIGHT,
              border: `1px solid ${ACCENT_BORDER}`,
              color: ACCENT,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: "1.5rem",
            }}
          >
            <MessageCircle size={13} />
            Contact Devad
          </div>

          <h1
            style={{
              fontSize: "clamp(2.3rem, 7vw, 4.2rem)",
              fontWeight: 800,
              letterSpacing: "-0.055em",
              lineHeight: 1.05,
              margin: "0 auto 1.5rem",
            }}
          >
            Let's build the
            <br />
            <span
              style={{
                background: "linear-gradient(90deg, #38BDF8, #60A5FA, #818CF8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              future together.
            </span>
          </h1>

          <p
            style={{
              maxWidth: 650,
              margin: "0 auto",
              color: TEXT_SECONDARY,
              fontSize: "1rem",
              lineHeight: 1.8,
            }}
          >
            Have a question about our programs, enrollment, partnerships, or
            joining our instructor team? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* BODY */}
      <main style={{ maxWidth: 1120, margin: "0 auto", padding: "0 1.5rem" }}>
        <section style={{ padding: "5rem 0 3rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "2.5rem",
              alignItems: "start",
            }}
          >
            {/* LEFT */}
            <div>
              <SectionLabel>Contact Information</SectionLabel>

              <h2
                style={{
                  fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
                  fontWeight: 750,
                  letterSpacing: "-0.035em",
                  lineHeight: 1.2,
                  margin: "0 0 0.75rem",
                }}
              >
                Reach the academy
              </h2>

              <p
                style={{
                  color: TEXT_SECONDARY,
                  fontSize: 14,
                  lineHeight: 1.75,
                  margin: "0 0 1.75rem",
                }}
              >
                Whether you're interested in learning with us, partnering with
                us, or becoming part of our teaching team, we're here to help.
              </p>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <ContactCard
                  icon={Mail}
                  label="Email"
                  lines={[
                    "devadacademy@gmail.com",
                    "General inquiries, support & admissions",
                  ]}
                />
                <ContactCard
                  icon={Phone}
                  label="Phone"
                  lines={["+234 810 655 1348"]}
                />
                <ContactCard
                  icon={MessageCircle}
                  label="WhatsApp"
                  lines={["+234 810 655 1348", "Quick responses via chat"]}
                />
                <ContactCard
                  icon={Clock}
                  label="Support Hours"
                  lines={[
                    "Mon – Fri: 6:00 AM – 6:00 PM",
                    "Saturday: 6:00 AM – 4:00 PM",
                    "Sunday: Closed",
                  ]}
                />
              </div>
            </div>

            {/* RIGHT — INSTRUCTOR CTA */}
            <div
              style={{
                background:
                  "linear-gradient(145deg, rgba(13,23,40,0.98), rgba(7,14,25,0.98))",
                border: `1px solid ${ACCENT_BORDER}`,
                borderRadius: 20,
                padding: "2rem",
                boxShadow: "0 20px 60px rgba(0,0,0,0.22)",
              }}
            >
              <div
                style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
              >
                <IconBox icon={GraduationCap} size={34} iconSize={18} />

                <div>
                  <SectionLabel>Join Our Team</SectionLabel>

                  <h2
                    style={{
                      fontSize: "clamp(1.4rem, 3vw, 1.9rem)",
                      fontWeight: 750,
                      letterSpacing: "-0.03em",
                      lineHeight: 1.2,
                      margin: 0,
                    }}
                  >
                    Become an Instructor
                  </h2>

                  <p
                    style={{
                      color: TEXT_SECONDARY,
                      fontSize: 13,
                      lineHeight: 1.7,
                      margin: "0.5rem 0 0",
                    }}
                  >
                    We're building a community of knowledgeable instructors who
                    help learners develop practical technology skills. No
                    account is required to apply.
                  </p>
                </div>
              </div>

              <div
                style={{
                  margin: "1.5rem 0",
                  padding: "1.1rem 1.25rem",
                  borderRadius: 14,
                  border: `1px solid ${BORDER}`,
                  background: SURFACE,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    color: TEXT_PRIMARY,
                    marginBottom: 10,
                  }}
                >
                  <Briefcase size={15} color={ACCENT} />
                  What you'll need
                </div>

                {applicationChecklist.map((item) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 12.5,
                      color: TEXT_SECONDARY,
                      lineHeight: 1.9,
                    }}
                  >
                    <FileText size={12} color={TEXT_MUTED} />
                    {item}
                  </div>
                ))}
              </div>

              <Link
                to={APPLY_PATH}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 9,
                  background: "linear-gradient(135deg, #0EA5E9, #2563EB)",
                  color: "#fff",
                  borderRadius: 10,
                  padding: "0.9rem 1.5rem",
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: "none",
                  boxShadow: "0 10px 25px rgba(37,99,235,0.2)",
                }}
              >
                Apply as an Instructor
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* GENERAL HELP */}
        <section style={{ padding: "2rem 0 6rem" }}>
          <SectionLabel>General Support</SectionLabel>

          <h2
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
              fontWeight: 750,
              letterSpacing: "-0.035em",
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            What can we help you with?
          </h2>

          <p
            style={{
              color: TEXT_SECONDARY,
              fontSize: 14,
              maxWidth: 600,
              margin: "0.7rem 0 2rem",
            }}
          >
            Have a question that isn't related to instructor applications? These
            are some of the areas our team can assist with.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
              gap: 10,
            }}
          >
            {helpTopics.map(({ icon, label }) => (
              <div
                key={label}
                style={{
                  background: SURFACE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 12,
                  padding: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  transition: "border-color 0.2s, transform 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = ACCENT_BORDER;
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = BORDER;
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <IconBox icon={icon} size={34} iconSize={15} />

                <span
                  style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.35 }}
                >
                  {label}
                </span>

                <ChevronRight
                  size={14}
                  color={TEXT_MUTED}
                  style={{ marginLeft: "auto" }}
                />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
