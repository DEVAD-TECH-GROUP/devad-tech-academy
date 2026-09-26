import {
  Code2,
  Layers,
  Globe,
  Shield,
  Smartphone,
  Brain,
  Palette,
  Cpu,
  Target,
  Eye,
  BookOpen,
  Users,
  Briefcase,
  Clock,
  Award,
  TrendingUp,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const ACCENT = "#38BDF8";
const ACCENT_BLUE = "#2563EB";
const ACCENT_LIGHT = "rgba(56,189,248,0.10)";
const ACCENT_BORDER = "rgba(56,189,248,0.20)";

const BG = "#050B14";
const SURFACE = "#0A1220";
const SURFACE_2 = "#0D1728";
const BORDER = "rgba(148,163,184,0.12)";

const TEXT_PRIMARY = "#F8FAFC";
const TEXT_SECONDARY = "#94A3B8";
const TEXT_MUTED = "#64748B";

const programs = [
  { icon: Layers, label: "Full-Stack Development" },
  { icon: Globe, label: "Frontend Development" },
  { icon: Zap, label: "Backend Development" },
  { icon: Brain, label: "AI & Machine Learning" },
  { icon: TrendingUp, label: "Data Analytics" },
  { icon: Shield, label: "Cybersecurity" },
  { icon: Smartphone, label: "Mobile App Development" },
  { icon: Palette, label: "UI/UX Design" },
];

const reasons = [
  {
    icon: BookOpen,
    title: "Practical Learning",
    text: "Learn through practical lessons, exercises, and projects instead of relying only on theory.",
  },
  {
    icon: Target,
    title: "Structured Paths",
    text: "Follow organized learning paths designed around different technology and career goals.",
  },
  {
    icon: Layers,
    title: "Relevant Skills",
    text: "Develop skills around modern tools, technologies, and practices used across the digital industry.",
  },
  {
    icon: Briefcase,
    title: "Build Your Portfolio",
    text: "Turn what you learn into practical projects that demonstrate your growing technical ability.",
  },
  {
    icon: Users,
    title: "Mentorship & Support",
    text: "Learn with guidance, feedback, and a community that supports your growth.",
  },
  {
    icon: Clock,
    title: "Flexible Online Learning",
    text: "Access your learning journey online and develop your skills around your schedule.",
  },
  {
    icon: TrendingUp,
    title: "Career Development",
    text: "Build technical and professional skills that can support long-term career development.",
  },
  {
    icon: Globe,
    title: "Learning Community",
    text: "Connect, collaborate, share knowledge, and grow alongside other learners.",
  },
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
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: ACCENT,
        marginBottom: "0.8rem",
      }}
    >
      <span
        style={{
          width: 22,
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

function MvCard({ icon: Icon, label, children, color = ACCENT }) {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(145deg, ${SURFACE_2}, ${SURFACE})`,
        border: `1px solid ${ACCENT_BORDER}`,
        borderRadius: 18,
        padding: "2rem",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -50,
          right: -50,
          width: 140,
          height: 140,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: "1.25rem",
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 11,
            background: `${color}12`,
            border: `1px solid ${color}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={20} color={color} />
        </div>

        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color,
          }}
        >
          {label}
        </span>
      </div>

      <p
        style={{
          fontSize: "0.95rem",
          color: TEXT_SECONDARY,
          lineHeight: 1.8,
          margin: 0,
        }}
      >
        {children}
      </p>
    </div>
  );
}

function StatCard({ value, label, description, highlight = false }) {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        minWidth: 150,
        flex: "1 1 170px",
        background: highlight
          ? "linear-gradient(145deg, rgba(14,116,144,0.18), rgba(8,20,35,0.9))"
          : "rgba(10,18,32,0.82)",
        border: `1px solid ${
          highlight ? "rgba(56,189,248,0.3)" : BORDER
        }`,
        borderRadius: 16,
        padding: "1.25rem 1.4rem",
        textAlign: "left",
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "rgba(56,189,248,0.08)",
          filter: "blur(20px)",
          top: -35,
          right: -25,
        }}
      />

      <div
        style={{
          position: "relative",
          fontSize: "1.55rem",
          fontWeight: 800,
          color: highlight ? ACCENT : TEXT_PRIMARY,
          lineHeight: 1,
          letterSpacing: "-0.03em",
        }}
      >
        {value}
      </div>

      <div
        style={{
          position: "relative",
          fontSize: 12,
          fontWeight: 700,
          color: TEXT_PRIMARY,
          marginTop: 8,
        }}
      >
        {label}
      </div>

      {description && (
        <div
          style={{
            position: "relative",
            fontSize: 11,
            color: TEXT_MUTED,
            marginTop: 3,
          }}
        >
          {description}
        </div>
      )}
    </div>
  );
}

export default function AboutUs() {
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
      {/* ─────────────────────────────────────────────
          TOP NAV
      ───────────────────────────────────────────── */}
      <header
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          padding: "0 1.5rem",
          borderBottom: `1px solid ${BORDER}`,
          background: "rgba(5,11,20,0.82)",
          backdropFilter: "blur(16px)",
          position: "relative",
          zIndex: 10,
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
              background:
                "linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 24px rgba(37,99,235,0.3)",
            }}
          >
            <Code2 size={18} color="#fff" />
          </div>

          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: TEXT_PRIMARY,
                letterSpacing: "-0.01em",
              }}
            >
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

      {/* ─────────────────────────────────────────────
          HERO
      ───────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          padding: "6.5rem 1.5rem 5rem",
          textAlign: "center",
          overflow: "hidden",
          background: `
            radial-gradient(circle at 50% -20%, rgba(37,99,235,0.28), transparent 48%),
            radial-gradient(circle at 15% 50%, rgba(14,165,233,0.07), transparent 30%),
            radial-gradient(circle at 85% 60%, rgba(37,99,235,0.06), transparent 30%),
            ${BG}
          `,
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        {/* grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.18,
            backgroundImage: `
              linear-gradient(rgba(56,189,248,0.12) 1px, transparent 1px),
              linear-gradient(90deg, rgba(56,189,248,0.12) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
            maskImage:
              "linear-gradient(to bottom, black, transparent 85%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            maxWidth: 850,
            margin: "0 auto",
          }}
        >
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
            <Sparkles size={13} />
            About Devad Tech Academy
          </div>

          <h1
            style={{
              fontSize: "clamp(2.4rem, 7vw, 4.6rem)",
              fontWeight: 800,
              letterSpacing: "-0.055em",
              lineHeight: 1.05,
              margin: "0 auto 1.5rem",
              color: TEXT_PRIMARY,
            }}
          >
            Learn technology.
            <br />
            <span
              style={{
                background:
                  "linear-gradient(90deg, #38BDF8, #60A5FA, #818CF8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Build your future.
            </span>
          </h1>

          <p
            style={{
              fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
              color: TEXT_SECONDARY,
              maxWidth: 680,
              margin: "0 auto 2.75rem",
              lineHeight: 1.8,
            }}
          >
            Devad Tech Academy is an online technology academy focused on
            practical learning, hands-on development, mentorship, and the
            skills people need to grow in today's digital world.
          </p>

          {/* KPI / VALUE CARDS */}
          <div
            style={{
              maxWidth: 720,
              margin: "0 auto",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 12,
            }}
          >
            <StatCard
              value="7+"
              label="Technology Programs"
              description="Structured learning paths"
              highlight
            />

            <StatCard
              value="Project-Based"
              label="Learning"
              description="Learn by building"
              highlight
            />

            <StatCard
              value="100%"
              label="Online"
              description="Flexible learning experience"
            />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          MAIN CONTENT
      ───────────────────────────────────────────── */}
      <main
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "0 1.5rem",
        }}
      >
        {/* ABOUT */}
        <section style={{ padding: "5rem 0 3rem" }}>
          <SectionLabel>Who We Are</SectionLabel>

          <h2
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
              fontWeight: 750,
              letterSpacing: "-0.035em",
              lineHeight: 1.2,
              color: TEXT_PRIMARY,
              margin: 0,
              maxWidth: 650,
            }}
          >
            Technology education designed to move from knowledge to ability.
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
              marginTop: "2.5rem",
            }}
          >
            {[
              {
                number: "01",
                title: "Learn",
                text: "Build strong foundations through structured lessons and carefully organized learning paths.",
              },
              {
                number: "02",
                title: "Practice",
                text: "Apply concepts through exercises and practical challenges that encourage active learning.",
              },
              {
                number: "03",
                title: "Build",
                text: "Turn knowledge into practical projects and develop the confidence to solve real problems.",
              },
              {
                number: "04",
                title: "Grow",
                text: "Continue developing technical, professional, and problem-solving skills for long-term growth.",
              },
            ].map(({ number, title, text }) => (
              <div
                key={number}
                style={{
                  position: "relative",
                  background: SURFACE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 16,
                  padding: "1.5rem",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: ACCENT,
                    letterSpacing: "0.1em",
                    marginBottom: "1rem",
                  }}
                >
                  {number}
                </div>

                <h3
                  style={{
                    fontSize: 18,
                    color: TEXT_PRIMARY,
                    margin: "0 0 0.5rem",
                  }}
                >
                  {title}
                </h3>

                <p
                  style={{
                    fontSize: 13.5,
                    color: TEXT_SECONDARY,
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* MISSION / VISION */}
        <section style={{ padding: "3rem 0 5rem" }}>
          <SectionLabel>Our Direction</SectionLabel>

          <h2
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
              fontWeight: 750,
              letterSpacing: "-0.035em",
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            Mission & Vision
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 18,
              marginTop: "2rem",
            }}
          >
            <MvCard icon={Target} label="Mission">
              To empower individuals with practical, high-quality technology
              education that equips them with the knowledge, skills, and
              confidence to build meaningful careers, create innovative
              solutions, and contribute positively to the digital economy.
            </MvCard>

            <MvCard icon={Eye} label="Vision" color="#818CF8">
              To become a leading destination for technology education,
              recognized for developing skilled professionals, fostering
              innovation, and creating opportunities for learners across
              diverse backgrounds.
            </MvCard>
          </div>
        </section>

        {/* PROGRAMS */}
        <section style={{ padding: "2rem 0 5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 20,
              flexWrap: "wrap",
              marginBottom: "2rem",
            }}
          >
            <div>
              <SectionLabel>Curriculum</SectionLabel>

              <h2
                style={{
                  fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                  fontWeight: 750,
                  letterSpacing: "-0.035em",
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                Explore our programs
              </h2>
            </div>

            <p
              style={{
                color: TEXT_MUTED,
                fontSize: 13.5,
                maxWidth: 400,
                margin: 0,
                lineHeight: 1.7,
              }}
            >
              Technology-focused programs designed to help learners develop
              practical and relevant digital skills.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(210px, 1fr))",
              gap: 12,
            }}
          >
            {programs.map(({ icon: Icon, label }, index) => (
              <div
                key={label}
                style={{
                  background:
                    index === 0
                      ? "linear-gradient(145deg, rgba(14,165,233,0.10), rgba(10,18,32,1))"
                      : SURFACE,
                  border: `1px solid ${
                    index === 0 ? ACCENT_BORDER : BORDER
                  }`,
                  borderRadius: 14,
                  padding: "1.1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  transition:
                    "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.borderColor = ACCENT_BORDER;
                  e.currentTarget.style.boxShadow =
                    "0 10px 30px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor =
                    index === 0 ? ACCENT_BORDER : BORDER;
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: ACCENT_LIGHT,
                    border: `1px solid ${ACCENT_BORDER}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={17} color={ACCENT} />
                </div>

                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: TEXT_PRIMARY,
                    lineHeight: 1.4,
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* WHY CHOOSE US */}
        <section style={{ padding: "2rem 0 5rem" }}>
          <SectionLabel>Why Devad</SectionLabel>

          <h2
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
              fontWeight: 750,
              letterSpacing: "-0.035em",
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            More than just watching lessons.
          </h2>

          <p
            style={{
              color: TEXT_SECONDARY,
              fontSize: 14,
              maxWidth: 620,
              marginTop: 12,
              lineHeight: 1.8,
            }}
          >
            Our approach is centered around active learning, practical
            application, continuous improvement, and helping learners become
            capable problem-solvers.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 12,
              marginTop: "2rem",
            }}
          >
            {reasons.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 13,
                  background: SURFACE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 14,
                  padding: "1.25rem",
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: "rgba(34,197,94,0.08)",
                    border: "1px solid rgba(34,197,94,0.14)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} color="#4ADE80" />
                </div>

                <div>
                  <h3
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: TEXT_PRIMARY,
                      margin: "0 0 4px",
                    }}
                  >
                    {title}
                  </h3>

                  <p
                    style={{
                      fontSize: 12.5,
                      color: TEXT_SECONDARY,
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* LEARNING PHILOSOPHY */}
        <section style={{ padding: "2rem 0 6rem" }}>
          <SectionLabel>Our Approach</SectionLabel>

          <h2
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
              fontWeight: 750,
              letterSpacing: "-0.035em",
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            Learn. Practice. Build. Grow.
          </h2>

          <div
            style={{
              position: "relative",
              overflow: "hidden",
              marginTop: "2rem",
              background:
                "radial-gradient(circle at 50% 0%, rgba(37,99,235,0.15), transparent 55%), #0A1220",
              border: `1px solid ${ACCENT_BORDER}`,
              borderRadius: 20,
              padding: "2.5rem 1.5rem",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "10%",
                right: "10%",
                height: 1,
                background:
                  "linear-gradient(90deg, transparent, rgba(56,189,248,0.5), transparent)",
              }}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(170px, 1fr))",
                gap: "2rem",
              }}
            >
              {[
                {
                  icon: BookOpen,
                  word: "Learn",
                  desc: "Build strong foundations and understand the fundamentals.",
                },
                {
                  icon: Zap,
                  word: "Practice",
                  desc: "Apply concepts through exercises and technical challenges.",
                },
                {
                  icon: Cpu,
                  word: "Build",
                  desc: "Turn knowledge into practical projects and solutions.",
                },
                {
                  icon: TrendingUp,
                  word: "Grow",
                  desc: "Keep improving your skills and professional capability.",
                },
              ].map(({ icon: Icon, word, desc }, index) => (
                <div
                  key={word}
                  style={{
                    textAlign: "center",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 15,
                      background: ACCENT_LIGHT,
                      border: `1px solid ${ACCENT_BORDER}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 1rem",
                      boxShadow: "0 0 25px rgba(56,189,248,0.06)",
                    }}
                  >
                    <Icon size={22} color={ACCENT} />
                  </div>

                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: TEXT_PRIMARY,
                      marginBottom: 5,
                    }}
                  >
                    {word}
                  </div>

                  <div
                    style={{
                      fontSize: 12.5,
                      color: TEXT_MUTED,
                      lineHeight: 1.6,
                      maxWidth: 180,
                      margin: "0 auto",
                    }}
                  >
                    {desc}
                  </div>

                  {index < 3 && (
                    <ArrowRight
                      size={15}
                      color="rgba(56,189,248,0.3)"
                      style={{
                        position: "absolute",
                        right: -12,
                        top: 20,
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            <div
              style={{
                maxWidth: 720,
                margin: "2.5rem auto 0",
                paddingTop: "1.75rem",
                borderTop: `1px solid ${BORDER}`,
                textAlign: "center",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: TEXT_SECONDARY,
                  lineHeight: 1.8,
                }}
              >
                We believe technology is best learned by doing. Our goal is
                to help learners move beyond simply understanding concepts
                toward confidently applying them to real problems and
                practical projects.
              </p>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section
          style={{
            marginBottom: "5rem",
            padding: "3rem 1.5rem",
            textAlign: "center",
            borderRadius: 20,
            border: `1px solid ${ACCENT_BORDER}`,
            background:
              "radial-gradient(circle at 50% 0%, rgba(37,99,235,0.18), transparent 65%), #091321",
          }}
        >
          <CheckCircle2
            size={28}
            color={ACCENT}
            style={{ marginBottom: 12 }}
          />

          <h2
            style={{
              fontSize: "clamp(1.5rem, 4vw, 2.1rem)",
              fontWeight: 750,
              letterSpacing: "-0.03em",
              margin: "0 0 0.75rem",
            }}
          >
            Your technology journey starts with learning.
          </h2>

          <p
            style={{
              maxWidth: 560,
              margin: "0 auto",
              color: TEXT_SECONDARY,
              fontSize: 14,
              lineHeight: 1.7,
            }}
          >
            Develop practical skills, work on meaningful projects, and keep
            growing with Devad Tech Academy.
          </p>
        </section>
      </main>
    </div>
  );
}

