import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Code2,
  ArrowLeft,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle,
  FileText,
  Link as LinkIcon,
  User,
  Briefcase,
  GraduationCap,
  Award,
  FolderOpen,
} from "lucide-react";
import toast from "react-hot-toast";

import { submitInstructorApplication } from "../../../services/instructor/instructorApplicationService";
import {
  C,
  Label,
  SectionTitle,
  TextInput,
  TextArea,
  Select,
  RepeatableList,
} from "../../../components/instructor/applicationUI";

const EXPERTISE_OPTIONS = [
  "Software Development",
  "Data Analytics",
  "AI & Machine Learning",
  "Cybersecurity",
  "UI/UX Design",
  "Mobile App Development",
  "Embedded Systems",
  "Cloud & DevOps",
];

const EMPTY_EDU = { degree: "", institution: "", year: "" };
const EMPTY_CERT = { name: "", issuer: "", year: "", url: "" };

const EDU_FIELDS = [
  { key: "degree", placeholder: "Degree / Qualification" },
  { key: "institution", placeholder: "Institution" },
  { key: "year", placeholder: "Year" },
];

const CERT_FIELDS = [
  { key: "name", placeholder: "Certification name" },
  { key: "issuer", placeholder: "Issuer" },
  { key: "year", placeholder: "Year" },
  { key: "url", placeholder: "Certificate URL (optional)" },
];

const initialForm = {
  name: "",
  email: "",
  phone: "",
  expertise: [],
  otherExpertise: "",
  experience: "",
  portfolio: "",
  teachingExperience: "",
  course: "",
  availability: "",
  coverLetter: "",
  cv: null,
};

const grid2 = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 12,
};

export default function InstructorApplication() {
  const [form, setForm] = useState(initialForm);
  const [education, setEducation] = useState([{ ...EMPTY_EDU }]);
  const [certifications, setCertifications] = useState([]);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((p) => ({ ...p, [name]: files ? files[0] || null : value }));
    if (error) setError("");
  };

  const toggleExpertise = (item) => {
    setForm((p) => ({
      ...p,
      expertise: p.expertise.includes(item)
        ? p.expertise.filter((x) => x !== item)
        : [...p.expertise, item],
    }));
    if (error) setError("");
  };

  const rowHandlers = (setter, empty) => ({
    onChange: (i, key, value) =>
      setter((rows) =>
        rows.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)),
      ),
    onAdd: () => setter((rows) => [...rows, { ...empty }]),
    onRemove: (i) => setter((rows) => rows.filter((_, idx) => idx !== i)),
  });

  const fail = (message) => {
    setError(message);
    toast.error(message);
  };

  const validate = () => {
    const otherSkills = form.otherExpertise
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!form.name.trim()) return "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      return "Please enter a valid email address.";
    if (!form.phone.trim()) return "Please enter your phone number.";
    if (form.expertise.length === 0 && otherSkills.length === 0)
      return "Select at least one area of expertise.";
    if (form.experience === "" || Number(form.experience) < 0)
      return "Please enter your years of experience.";
    if (!form.course.trim())
      return "Please specify the course you would like to teach.";
    if (!form.teachingExperience.trim())
      return "Please describe your teaching or mentoring experience.";
    if (!form.availability.trim()) return "Please provide your availability.";
    if (!form.coverLetter.trim())
      return "Please tell us why you want to teach at Devad.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const problem = validate();
    if (problem) return fail(problem);

    const otherSkills = form.otherExpertise
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("email", form.email.trim());
    formData.append("phone", form.phone.trim());
    formData.append("expertise", [...form.expertise, ...otherSkills].join(","));
    formData.append("experience", String(form.experience));
    formData.append("portfolio", form.portfolio.trim());
    formData.append("teachingExperience", form.teachingExperience.trim());
    formData.append("course", form.course.trim());
    formData.append("availability", form.availability.trim());
    formData.append("coverLetter", form.coverLetter.trim());
    formData.append(
      "education",
      JSON.stringify(
        education.filter((r) => r.degree.trim() || r.institution.trim()),
      ),
    );
    formData.append(
      "certifications",
      JSON.stringify(certifications.filter((r) => r.name.trim())),
    );
    if (form.cv) formData.append("cv", form.cv);

    try {
      setSubmitting(true);
      setError("");
      await submitInstructorApplication(formData);
      setSent(true);
      setForm(initialForm);
      setEducation([{ ...EMPTY_EDU }]);
      setCertifications([]);
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast.success("Application submitted successfully!");
    } catch (err) {
      console.error("[DEVAD INSTRUCTOR APPLICATION]", err);
      fail(
        err?.response?.data?.message ||
          "We could not submit your application. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.BG,
        color: C.TEXT_PRIMARY,
        fontFamily: "'Inter', system-ui, sans-serif",
        lineHeight: 1.7,
      }}
    >
      <header
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          padding: "0 1.5rem",
          borderBottom: `1px solid ${C.BORDER}`,
          background: "rgba(5,11,20,0.85)",
          backdropFilter: "blur(16px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: 820,
            width: "100%",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg, #0EA5E9, #2563EB)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Code2 size={18} color="#fff" />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700 }}>
              DEVAD TECH ACADEMY
            </span>
          </div>

          <Link
            to="/contact"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: C.TEXT_SECONDARY,
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={14} /> Back to contact
          </Link>
        </div>
      </header>

      <main
        style={{ maxWidth: 820, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}
      >
        <div style={{ marginBottom: "2rem" }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.13em",
              textTransform: "uppercase",
              color: C.ACCENT,
              marginBottom: 8,
            }}
          >
            Join Our Team
          </div>
          <h1
            style={{
              fontSize: "clamp(1.9rem, 5vw, 2.8rem)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1.15,
              margin: "0 0 0.75rem",
            }}
          >
            Instructor Application
          </h1>
          <p
            style={{
              color: C.TEXT_SECONDARY,
              fontSize: 14,
              margin: 0,
              maxWidth: 600,
            }}
          >
            Tell us about your experience and how you can contribute to learners
            at Devad Tech Academy. No account needed.
          </p>
        </div>

        <div
          style={{
            background:
              "linear-gradient(145deg, rgba(13,23,40,0.98), rgba(7,14,25,0.98))",
            border: `1px solid ${C.ACCENT_BORDER}`,
            borderRadius: 20,
            padding: "clamp(1.25rem, 4vw, 2rem)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.22)",
          }}
        >
          {sent ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: C.GREEN_BG,
                  border: "1px solid rgba(74,222,128,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.25rem",
                }}
              >
                <CheckCircle size={30} color={C.GREEN} />
              </div>
              <h3 style={{ margin: "0 0 0.5rem", fontSize: 18 }}>
                Application received
              </h3>
              <p style={{ margin: 0, color: C.TEXT_SECONDARY, fontSize: 14 }}>
                Thank you for applying. Our team will review your application
                and email you with the outcome.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  justifyContent: "center",
                  marginTop: 22,
                  flexWrap: "wrap",
                }}
              >
                <Link
                  to="/contact"
                  style={{
                    border: `1px solid ${C.ACCENT_BORDER}`,
                    background: C.ACCENT_LIGHT,
                    color: C.ACCENT,
                    borderRadius: 9,
                    padding: "0.7rem 1.1rem",
                    fontSize: 12,
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Back to contact
                </Link>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  style={{
                    border: `1px solid ${C.BORDER}`,
                    background: "transparent",
                    color: C.TEXT_SECONDARY,
                    borderRadius: 9,
                    padding: "0.7rem 1.1rem",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Submit another application
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {error && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 9,
                    padding: "0.85rem 1rem",
                    borderRadius: 10,
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    color: C.RED,
                    fontSize: 12,
                    lineHeight: 1.5,
                  }}
                >
                  <AlertCircle
                    size={16}
                    style={{ flexShrink: 0, marginTop: 1 }}
                  />
                  <span>{error}</span>
                </div>
              )}

              {/* PERSONAL */}
              <div style={{ ...grid2 }}>
                <div>
                  <Label>Full Name *</Label>
                  <TextInput
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <Label>Email Address *</Label>
                  <TextInput
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@email.com"
                  />
                </div>
                <div>
                  <Label>Phone Number *</Label>
                  <TextInput
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+234 800 000 0000"
                  />
                </div>
              </div>

              {/* EXPERTISE */}
              <SectionTitle icon={Briefcase}>
                Expertise & Experience
              </SectionTitle>

              <div>
                <Label>Areas of Expertise *</Label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {EXPERTISE_OPTIONS.map((item) => {
                    const active = form.expertise.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleExpertise(item)}
                        style={{
                          padding: "0.5rem 0.9rem",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          color: active ? C.ACCENT : C.TEXT_SECONDARY,
                          background: active ? C.ACCENT_LIGHT : C.SURFACE2,
                          border: `1px solid ${active ? C.ACCENT : C.BORDER}`,
                        }}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label optional>Other skills (comma separated)</Label>
                <TextInput
                  name="otherExpertise"
                  value={form.otherExpertise}
                  onChange={handleChange}
                  placeholder="e.g. Blockchain, Game Development"
                />
              </div>

              <div style={grid2}>
                <div>
                  <Label>Years of Experience *</Label>
                  <TextInput
                    name="experience"
                    type="number"
                    min="0"
                    max="60"
                    step="0.5"
                    value={form.experience}
                    onChange={handleChange}
                    placeholder="e.g. 4"
                  />
                </div>
                <div>
                  <Label>Course You'd Like to Teach *</Label>
                  <TextInput
                    name="course"
                    value={form.course}
                    onChange={handleChange}
                    placeholder="e.g. Full-Stack Development"
                  />
                </div>
              </div>

              <div>
                <Label optional>Portfolio / LinkedIn / GitHub</Label>
                <div style={{ position: "relative" }}>
                  <LinkIcon
                    size={15}
                    color={C.TEXT_MUTED}
                    style={{ position: "absolute", left: 12, top: 13 }}
                  />
                  <TextInput
                    name="portfolio"
                    value={form.portfolio}
                    onChange={handleChange}
                    placeholder="https://..."
                    style={{ paddingLeft: 36 }}
                  />
                </div>
              </div>

              <div>
                <Label>Teaching / Mentoring Experience *</Label>
                <TextArea
                  name="teachingExperience"
                  value={form.teachingExperience}
                  onChange={handleChange}
                  rows={4}
                  minHeight={105}
                  placeholder="Tell us briefly about your teaching, mentoring, training, or knowledge-sharing experience."
                />
              </div>

              {/* EDUCATION */}
              <SectionTitle icon={GraduationCap}>Education</SectionTitle>
              <RepeatableList
                rows={education}
                fields={EDU_FIELDS}
                addLabel="Add education"
                {...rowHandlers(setEducation, EMPTY_EDU)}
              />

              {/* CERTIFICATIONS */}
              <SectionTitle icon={Award}>
                Certifications (Optional)
              </SectionTitle>
              <RepeatableList
                rows={certifications}
                fields={CERT_FIELDS}
                addLabel="Add certification"
                {...rowHandlers(setCertifications, EMPTY_CERT)}
              />

              {/* DOCUMENTS */}
              <SectionTitle icon={FolderOpen}>
                Application Documents
              </SectionTitle>

              <div>
                <Label optional>CV / Resume</Label>
                <div
                  style={{
                    border: `1px dashed ${C.ACCENT_BORDER}`,
                    borderRadius: 10,
                    background: C.ACCENT_LIGHT,
                    padding: "1rem",
                  }}
                >
                  <input
                    type="file"
                    name="cv"
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      color: C.TEXT_SECONDARY,
                      fontSize: 12,
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      marginTop: 7,
                      color: C.TEXT_MUTED,
                      fontSize: 11,
                    }}
                  >
                    <FileText size={13} /> PDF, DOC, DOCX, PPT or PPTX
                  </div>
                  {form.cv && (
                    <div
                      style={{
                        marginTop: 8,
                        color: C.ACCENT,
                        fontSize: 11,
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Selected: {form.cv.name}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label>Why would you like to teach at Devad? *</Label>
                <TextArea
                  name="coverLetter"
                  value={form.coverLetter}
                  onChange={handleChange}
                  rows={5}
                  minHeight={125}
                  placeholder="Tell us why you're interested in joining the academy and what you can bring to our learners."
                />
              </div>

              <div>
                <Label>Availability *</Label>
                <TextInput
                  name="availability"
                  value={form.availability}
                  onChange={handleChange}
                  placeholder="e.g. Weekday evenings / Weekends"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 9,
                  background: submitting
                    ? "rgba(37,99,235,0.5)"
                    : "linear-gradient(135deg, #0EA5E9, #2563EB)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "0.85rem 1.5rem",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: submitting ? "not-allowed" : "pointer",
                  marginTop: 6,
                  boxShadow: "0 10px 25px rgba(37,99,235,0.2)",
                  fontFamily: "inherit",
                }}
              >
                {submitting ? (
                  <>
                    <Loader2
                      size={15}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    Submit Instructor Application
                  </>
                )}
              </button>

              <p
                style={{
                  margin: 0,
                  textAlign: "center",
                  color: C.TEXT_MUTED,
                  fontSize: 11,
                }}
              >
                By submitting this application, you confirm the information
                provided is accurate.
              </p>
            </form>
          )}
        </div>
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
