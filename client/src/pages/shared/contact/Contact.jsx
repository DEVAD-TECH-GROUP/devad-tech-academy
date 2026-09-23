import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail, Phone, MessageCircle, Clock, Send,
  BookOpen, UserPlus, Map, Wrench, Handshake,
  Building2, HelpCircle, Code2, ArrowRight, CheckCircle,
} from "lucide-react";

const ACCENT = "#818CF8";
const ACCENT_LIGHT = "rgba(129,140,248,0.12)";
const ACCENT_MID = "#6366F1";
const ACCENT_BORDER = "rgba(129,140,248,0.25)";
const BG = "#0F0F14";
const SURFACE = "#16161F";
const SURFACE2 = "#1C1C28";
const BORDER = "rgba(255,255,255,0.07)";
const TEXT_PRIMARY = "#F1F0FF";
const TEXT_SECONDARY = "#9B99B4";
const TEXT_MUTED = "#5C5A72";
const GREEN = "#4ADE80";
const GREEN_BG = "rgba(74,222,128,0.1)";

const helpTopics = [
  { icon: BookOpen,    label: "Course Information" },
  { icon: UserPlus,   label: "Admissions & Enrollment" },
  { icon: Map,        label: "Learning Paths & Career Guidance" },
  { icon: Wrench,     label: "Technical Support" },
  { icon: Handshake,  label: "Partnership Opportunities" },
  { icon: Building2,  label: "Corporate Training" },
  { icon: HelpCircle, label: "General Questions" },
];

const inputStyle = {
  width: "100%",
  background: SURFACE2,
  border: `1px solid ${BORDER}`,
  borderRadius: 8,
  padding: "0.7rem 1rem",
  fontSize: 14,
  color: TEXT_PRIMARY,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 0.2s",
};

function Label({ children }) {
  return (
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: TEXT_SECONDARY, marginBottom: 6, letterSpacing: "0.04em" }}>
      {children}
    </label>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: ACCENT, marginBottom: "0.6rem" }}>
      <span style={{ width: 16, height: 2, background: ACCENT, borderRadius: 2, display: "inline-block" }} />
      {children}
    </div>
  );
}

function ContactCard({ icon: Icon, label, lines, accent }) {
  return (
    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "1.25rem 1.5rem", display: "flex", gap: 14, alignItems: "flex-start" }}>
      <div style={{ width: 38, height: 38, borderRadius: 9, background: accent || ACCENT_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={18} color={ACCENT} />
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>{label}</div>
        {lines.map((line, i) => (
          <div key={i} style={{ fontSize: 14, color: i === 0 ? TEXT_PRIMARY : TEXT_SECONDARY, lineHeight: 1.6 }}>{line}</div>
        ))}
      </div>
    </div>
  );
}

export default function ContactUs() {

  const navigate = useNavigate()
  
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.name && form.email && form.subject && form.message) setSent(true);
  };

  const fieldStyle = (name) => ({
    ...inputStyle,
    borderColor: focused === name ? ACCENT : BORDER,
    boxShadow: focused === name ? `0 0 0 3px rgba(129,140,248,0.1)` : "none",
  });

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: BG, color: TEXT_PRIMARY, lineHeight: 1.7 }}>

      {/* NAV */}
      <header style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, padding: "0 2rem", display: "flex", alignItems: "center", gap: "0.5rem", height: 56 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: ACCENT_MID, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Code2 size={16} color="#fff" />
        </div>
        <span style={{ fontWeight: 600, fontSize: 15, color: TEXT_PRIMARY, letterSpacing: "-0.01em" }}>Devad Tech Academy</span>
      </header>

      {/* HERO */}
      <section style={{
        background: `radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.18) 0%, transparent 70%), ${BG}`,
        borderBottom: `1px solid ${BORDER}`, padding: "4.5rem 2rem 3.5rem", textAlign: "center",
      }}>
        <span style={{ display: "inline-block", background: ACCENT_LIGHT, color: ACCENT, fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 14px", borderRadius: 999, border: `1px solid ${ACCENT_BORDER}`, marginBottom: "1.25rem" }}>
          Contact Us
        </span>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15, maxWidth: 700, margin: "0 auto 1.25rem", color: TEXT_PRIMARY }}>
          Get In <span style={{ color: ACCENT }}>Touch</span>
        </h1>
        <p style={{ fontSize: "1rem", color: TEXT_SECONDARY, maxWidth: 580, margin: "0 auto" }}>
          Whether you have questions about our programs, enrollment, or anything else — we'd love to hear from you. Our team is committed to timely support and helping you take the next step.
        </p>
      </section>

      {/* BODY */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 1.5rem" }}>

        {/* CONTACT INFO + FORM */}
        <section style={{ padding: "4rem 0 3rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2.5rem", alignItems: "start" }}>

            {/* LEFT: Contact Details */}
            <div>
              <SectionLabel>Contact Information</SectionLabel>
              <h2 style={{ ...h2Style, marginBottom: "0.5rem" }}>Reach us directly</h2>
              <p style={{ color: TEXT_SECONDARY, fontSize: "0.9rem", marginBottom: "1.75rem" }}>
                We're available through multiple channels. Reach out in whichever way works best for you.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <ContactCard icon={Mail} label="Email" lines={["devadacademy@gmail.com", "General inquiries, support & admissions"]} />
                <ContactCard icon={Phone} label="Phone" lines={["+234 810 655 1348"]} />
                <ContactCard icon={MessageCircle} label="WhatsApp" lines={["+234 810 655 1348", "Quick responses via chat"]} />
                <ContactCard icon={Clock} label="Support Hours" lines={["Mon – Fri: 6:00 AM – 6:00 PM", "Saturday: 6:00 AM – 4:00 PM", "Sunday: Closed"]} />
              </div>
            </div>

            {/* RIGHT: Form */}
            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "2rem" }}>
              <SectionLabel>Send a Message</SectionLabel>
              <h2 style={{ ...h2Style, marginBottom: "0.4rem" }}>We'll get back to you</h2>
              <p style={{ color: TEXT_SECONDARY, fontSize: "0.875rem", marginBottom: "1.75rem" }}>
                Fill out the form below and a member of our team will respond as soon as possible.
              </p>

              {sent ? (
                <div style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: GREEN_BG, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                    <CheckCircle size={28} color={GREEN} />
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 16, color: TEXT_PRIMARY, marginBottom: 8 }}>Message sent!</div>
                  <div style={{ color: TEXT_SECONDARY, fontSize: 14 }}>We'll be in touch shortly.</div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div>
                      <Label>Full Name *</Label>
                      <input name="name" value={form.name} onChange={handleChange} onFocus={() => setFocused("name")} onBlur={() => setFocused(null)} placeholder="David Adeleke" style={fieldStyle("name")} required />
                    </div>
                    <div>
                      <Label>Email Address *</Label>
                      <input name="email" type="email" value={form.email} onChange={handleChange} onFocus={() => setFocused("email")} onBlur={() => setFocused(null)} placeholder="you@email.com" style={fieldStyle("email")} required />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div>
                      <Label>Phone Number <span style={{ color: TEXT_MUTED, fontWeight: 400 }}>(Optional)</span></Label>
                      <input name="phone" value={form.phone} onChange={handleChange} onFocus={() => setFocused("phone")} onBlur={() => setFocused(null)} placeholder="+234 800 000 0000" style={fieldStyle("phone")} />
                    </div>
                    <div>
                      <Label>Subject *</Label>
                      <input name="subject" value={form.subject} onChange={handleChange} onFocus={() => setFocused("subject")} onBlur={() => setFocused(null)} placeholder="Course inquiry" style={fieldStyle("subject")} required />
                    </div>
                  </div>

                  <div>
                    <Label>Message *</Label>
                    <textarea name="message" value={form.message} onChange={handleChange} onFocus={() => setFocused("message")} onBlur={() => setFocused(null)} placeholder="Tell us how we can help…" rows={5} style={{ ...fieldStyle("message"), resize: "vertical", minHeight: 120 }} required />
                  </div>

                  <button type="submit" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: ACCENT_MID, color: "#fff", border: "none", borderRadius: 8, padding: "0.8rem 1.5rem", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "background 0.2s", marginTop: 4 }}
                    onMouseEnter={e => e.currentTarget.style.background = "#4F46E5"}
                    onMouseLeave={e => e.currentTarget.style.background = ACCENT_MID}
                  >
                    <Send size={15} />
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* WHAT CAN WE HELP WITH */}
        <section style={{ padding: "1rem 0 4rem" }}>
          <SectionLabel>Topics</SectionLabel>
          <h2 style={{ ...h2Style, marginBottom: "0.5rem" }}>What can we help you with?</h2>
          <p style={{ color: TEXT_SECONDARY, fontSize: "0.9rem", marginBottom: "1.75rem", maxWidth: 520 }}>
            Our team is equipped to answer questions across all areas of the academy.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: "0.75rem" }}>
            {helpTopics.map(({ icon: Icon, label }) => (
              <div key={label} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "1rem 1.1rem", display: "flex", alignItems: "center", gap: 10, cursor: "default", transition: "border-color 0.2s, box-shadow 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(129,140,248,0.1)`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 8, background: ACCENT_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={16} color={ACCENT} />
                </div>
                <span style={{ fontSize: 13.5, fontWeight: 500, color: TEXT_PRIMARY, lineHeight: 1.35 }}>{label}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

const h2Style = {
  fontSize: "clamp(1.4rem, 2.5vw, 1.85rem)",
  fontWeight: 700,
  letterSpacing: "-0.025em",
  color: TEXT_PRIMARY,
  margin: 0,
  lineHeight: 1.25,
};