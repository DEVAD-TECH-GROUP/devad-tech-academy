import { useState } from "react";
import {
  Mail,
  Phone,
  MessageCircle,
  Clock,
  Send,
  BookOpen,
  UserPlus,
  Map,
  Wrench,
  Handshake,
  Building2,
  HelpCircle,
  Code2,
  ArrowRight,
  CheckCircle,
  Briefcase,
  GraduationCap,
  FileText,
  Link as LinkIcon,
  Users,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const ACCENT = "#38BDF8";
const ACCENT_BLUE = "#2563EB";
const ACCENT_LIGHT = "rgba(56,189,248,0.10)";
const ACCENT_BORDER = "rgba(56,189,248,0.22)";

const BG = "#050B14";
const SURFACE = "#0A1220";
const SURFACE2 = "#0D1728";
const BORDER = "rgba(148,163,184,0.12)";

const TEXT_PRIMARY = "#F8FAFC";
const TEXT_SECONDARY = "#94A3B8";
const TEXT_MUTED = "#64748B";

const GREEN = "#4ADE80";
const GREEN_BG = "rgba(74,222,128,0.08)";

const helpTopics = [
  { icon: BookOpen, label: "Course Information" },
  { icon: UserPlus, label: "Admissions & Enrollment" },
  { icon: Map, label: "Learning Paths & Career Guidance" },
  { icon: Wrench, label: "Technical Support" },
  { icon: Handshake, label: "Partnership Opportunities" },
  { icon: Building2, label: "Corporate Training" },
  { icon: HelpCircle, label: "General Questions" },
];

const expertiseOptions = [
  "Software Development",
  "Data Analytics",
  "AI & Machine Learning",
  "Cybersecurity",
  "UI/UX Design",
  "Mobile App Development",
  "Embedded Systems",
  "Other",
];

const inputStyle = {
  width: "100%",
  background: SURFACE2,
  border: `1px solid ${BORDER}`,
  borderRadius: 10,
  padding: "0.78rem 0.95rem",
  fontSize: 14,
  color: TEXT_PRIMARY,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

function Label({ children }) {
  return (
    <label
      style={{
        display: "block",
        fontSize: 12,
        fontWeight: 600,
        color: TEXT_SECONDARY,
        marginBottom: 7,
        letterSpacing: "0.03em",
      }}
    >
      {children}
    </label>
  );
}

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

function ContactCard({ icon: Icon, label, lines }) {
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

function FieldIcon({ children }) {
  return (
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: 9,
        background: ACCENT_LIGHT,
        border: `1px solid ${ACCENT_BORDER}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
}

export default function ContactUs() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    expertise: "",
    experience: "",
    portfolio: "",
    teachingExperience: "",
    course: "",
    availability: "",
    coverLetter: "",
    cv: null,
  });

  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    /*
      UI ONLY FOR NOW.

      Later this will connect to something like:

      POST /instructor-applications

      and submit the application to the backend,
      including CV upload and application status.
    */

    setSent(true);
  };

  const fieldStyle = (name) => ({
    ...inputStyle,
    borderColor: focused === name ? ACCENT : BORDER,
    boxShadow:
      focused === name
        ? "0 0 0 3px rgba(56,189,248,0.08)"
        : "none",
  });

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
          NAV
      ───────────────────────────────────────────── */}
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
              background:
                "linear-gradient(135deg, #0EA5E9, #2563EB)",
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
        {/* Background grid */}
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
            maskImage:
              "linear-gradient(to bottom, black, transparent 85%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            maxWidth: 800,
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
                background:
                  "linear-gradient(90deg, #38BDF8, #60A5FA, #818CF8)",
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

      {/* ─────────────────────────────────────────────
          BODY
      ───────────────────────────────────────────── */}
      <main
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "0 1.5rem",
        }}
      >
        <section style={{ padding: "5rem 0 3rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(280px, 0.75fr) minmax(400px, 1.25fr)",
              gap: "2.5rem",
              alignItems: "start",
            }}
          >
            {/* ─────────────────────────────────────
                LEFT SIDE
            ───────────────────────────────────── */}
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
                Whether you're interested in learning with us, partnering
                with us, or becoming part of our teaching team, we're here
                to help.
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
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
                  lines={[
                    "+234 810 655 1348",
                    "Quick responses via chat",
                  ]}
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

              {/* Instructor CTA */}
              <div
                style={{
                  marginTop: "1.25rem",
                  padding: "1.25rem",
                  borderRadius: 14,
                  border: `1px solid ${ACCENT_BORDER}`,
                  background:
                    "linear-gradient(145deg, rgba(14,165,233,0.08), rgba(10,18,32,0.9))",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  <Briefcase size={17} color={ACCENT} />

                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: TEXT_PRIMARY,
                    }}
                  >
                    Interested in teaching?
                  </span>
                </div>

                <p
                  style={{
                    margin: "0 0 12px",
                    fontSize: 12.5,
                    color: TEXT_SECONDARY,
                    lineHeight: 1.65,
                  }}
                >
                  We're building a community of knowledgeable instructors
                  who can help learners develop practical technology skills.
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: ACCENT,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  Instructor applications are welcome
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>

            {/* ─────────────────────────────────────
                APPLICATION FORM
            ───────────────────────────────────── */}
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
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  marginBottom: "1.5rem",
                }}
              >
                <FieldIcon>
                  <GraduationCap size={18} color={ACCENT} />
                </FieldIcon>

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
                    Instructor Application
                  </h2>

                  <p
                    style={{
                      color: TEXT_SECONDARY,
                      fontSize: 13,
                      lineHeight: 1.7,
                      margin: "0.5rem 0 0",
                    }}
                  >
                    Tell us about your experience, expertise, and how you
                    could contribute to the learning experience at Devad
                    Tech Academy.
                  </p>
                </div>
              </div>

              {sent ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "3rem 1rem",
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      background: GREEN_BG,
                      border: "1px solid rgba(74,222,128,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 1.25rem",
                    }}
                  >
                    <CheckCircle size={30} color={GREEN} />
                  </div>

                  <h3
                    style={{
                      margin: "0 0 0.5rem",
                      fontSize: 18,
                      color: TEXT_PRIMARY,
                    }}
                  >
                    Application received
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      color: TEXT_SECONDARY,
                      fontSize: 14,
                    }}
                  >
                    Thank you for your interest in teaching at Devad Tech
                    Academy. Our team will review your application.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  {/* PERSONAL INFORMATION */}
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: ACCENT,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      paddingBottom: 3,
                    }}
                  >
                    Personal Information
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                    }}
                  >
                    <div>
                      <Label>Full Name *</Label>

                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        onFocus={() => setFocused("name")}
                        onBlur={() => setFocused(null)}
                        placeholder="Your full name"
                        style={fieldStyle("name")}
                        required
                      />
                    </div>

                    <div>
                      <Label>Email Address *</Label>

                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        onFocus={() => setFocused("email")}
                        onBlur={() => setFocused(null)}
                        placeholder="you@email.com"
                        style={fieldStyle("email")}
                        required
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                    }}
                  >
                    <div>
                      <Label>Phone Number *</Label>

                      <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        onFocus={() => setFocused("phone")}
                        onBlur={() => setFocused(null)}
                        placeholder="+234 800 000 0000"
                        style={fieldStyle("phone")}
                        required
                      />
                    </div>

                    <div>
                      <Label>Area of Expertise *</Label>

                      <select
                        name="expertise"
                        value={form.expertise}
                        onChange={handleChange}
                        onFocus={() => setFocused("expertise")}
                        onBlur={() => setFocused(null)}
                        style={{
                          ...fieldStyle("expertise"),
                          cursor: "pointer",
                        }}
                        required
                      >
                        <option value="" disabled>
                          Select expertise
                        </option>

                        {expertiseOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* EXPERIENCE */}
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: ACCENT,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      paddingTop: 8,
                      paddingBottom: 3,
                    }}
                  >
                    Professional Background
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                    }}
                  >
                    <div>
                      <Label>Years of Experience *</Label>

                      <select
                        name="experience"
                        value={form.experience}
                        onChange={handleChange}
                        onFocus={() => setFocused("experience")}
                        onBlur={() => setFocused(null)}
                        style={{
                          ...fieldStyle("experience"),
                          cursor: "pointer",
                        }}
                        required
                      >
                        <option value="" disabled>
                          Select experience
                        </option>
                        <option value="less-than-1">
                          Less than 1 year
                        </option>
                        <option value="1-2">1–2 years</option>
                        <option value="3-5">3–5 years</option>
                        <option value="6-10">6–10 years</option>
                        <option value="10+">10+ years</option>
                      </select>
                    </div>

                    <div>
                      <Label>Course You'd Like to Teach *</Label>

                      <input
                        name="course"
                        value={form.course}
                        onChange={handleChange}
                        onFocus={() => setFocused("course")}
                        onBlur={() => setFocused(null)}
                        placeholder="e.g. Full-Stack Development"
                        style={fieldStyle("course")}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label>
                      Portfolio / LinkedIn / GitHub{" "}
                      <span
                        style={{
                          color: TEXT_MUTED,
                          fontWeight: 400,
                        }}
                      >
                        (Optional)
                      </span>
                    </Label>

                    <div style={{ position: "relative" }}>
                      <LinkIcon
                        size={15}
                        color={TEXT_MUTED}
                        style={{
                          position: "absolute",
                          left: 12,
                          top: 13,
                        }}
                      />

                      <input
                        name="portfolio"
                        value={form.portfolio}
                        onChange={handleChange}
                        onFocus={() => setFocused("portfolio")}
                        onBlur={() => setFocused(null)}
                        placeholder="https://..."
                        style={{
                          ...fieldStyle("portfolio"),
                          paddingLeft: 36,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Teaching / Mentoring Experience *</Label>

                    <textarea
                      name="teachingExperience"
                      value={form.teachingExperience}
                      onChange={handleChange}
                      onFocus={() =>
                        setFocused("teachingExperience")
                      }
                      onBlur={() => setFocused(null)}
                      placeholder="Tell us briefly about your teaching, mentoring, training, or knowledge-sharing experience."
                      rows={4}
                      style={{
                        ...fieldStyle("teachingExperience"),
                        resize: "vertical",
                        minHeight: 105,
                      }}
                      required
                    />
                  </div>

                  {/* DOCUMENTS */}
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: ACCENT,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      paddingTop: 8,
                      paddingBottom: 3,
                    }}
                  >
                    Application Documents
                  </div>

                  <div>
                    <Label>
                      CV / Resume{" "}
                      <span
                        style={{
                          color: TEXT_MUTED,
                          fontWeight: 400,
                        }}
                      >
                        (Optional for now)
                      </span>
                    </Label>

                    <div
                      style={{
                        position: "relative",
                        border: `1px dashed ${ACCENT_BORDER}`,
                        borderRadius: 10,
                        background: ACCENT_LIGHT,
                        padding: "1rem",
                      }}
                    >
                      <input
                        type="file"
                        name="cv"
                        accept=".pdf,.doc,.docx"
                        onChange={handleChange}
                        style={{
                          width: "100%",
                          color: TEXT_SECONDARY,
                          fontSize: 12,
                        }}
                      />

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                          marginTop: 7,
                          color: TEXT_MUTED,
                          fontSize: 11,
                        }}
                      >
                        <FileText size={13} />
                        PDF, DOC or DOCX
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Why would you like to teach at Devad? *</Label>

                    <textarea
                      name="coverLetter"
                      value={form.coverLetter}
                      onChange={handleChange}
                      onFocus={() => setFocused("coverLetter")}
                      onBlur={() => setFocused(null)}
                      placeholder="Tell us why you're interested in joining the academy and what you can bring to our learners."
                      rows={5}
                      style={{
                        ...fieldStyle("coverLetter"),
                        resize: "vertical",
                        minHeight: 125,
                      }}
                      required
                    />
                  </div>

                  <div>
                    <Label>Availability *</Label>

                    <input
                      name="availability"
                      value={form.availability}
                      onChange={handleChange}
                      onFocus={() => setFocused("availability")}
                      onBlur={() => setFocused(null)}
                      placeholder="e.g. Weekday evenings / Weekends"
                      style={fieldStyle("availability")}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 9,
                      background:
                        "linear-gradient(135deg, #0EA5E9, #2563EB)",
                      color: "#fff",
                      border: "none",
                      borderRadius: 10,
                      padding: "0.85rem 1.5rem",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                      marginTop: 6,
                      boxShadow:
                        "0 10px 25px rgba(37,99,235,0.2)",
                    }}
                  >
                    <Send size={15} />
                    Submit Instructor Application
                  </button>

                  <p
                    style={{
                      margin: 0,
                      textAlign: "center",
                      color: TEXT_MUTED,
                      fontSize: 11,
                      lineHeight: 1.6,
                    }}
                  >
                    By submitting this application, you confirm that the
                    information provided is accurate.
                  </p>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────
            GENERAL HELP
        ───────────────────────────────────────────── */}
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
            Have a question that isn't related to instructor applications?
            These are some of the areas our team can assist with.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(210px, 1fr))",
              gap: 10,
            }}
          >
            {helpTopics.map(({ icon: Icon, label }) => (
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
                  transition:
                    "border-color 0.2s, transform 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor =
                    ACCENT_BORDER;
                  e.currentTarget.style.transform =
                    "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = BORDER;
                  e.currentTarget.style.transform =
                    "translateY(0)";
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: ACCENT_LIGHT,
                    border: `1px solid ${ACCENT_BORDER}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={15} color={ACCENT} />
                </div>

                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: TEXT_PRIMARY,
                    lineHeight: 1.35,
                  }}
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

