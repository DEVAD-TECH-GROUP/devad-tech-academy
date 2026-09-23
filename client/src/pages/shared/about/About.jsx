import { useState } from "react";
import {
  Code2, Layers, Globe, Shield, Phone, Brain,
  Palette, Cpu, Target, Eye, BookOpen, Users,
  Briefcase, Clock, Award, TrendingUp, Zap, Heart,
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

const h2Style = {
  fontSize: "clamp(1.4rem, 2.5vw, 1.85rem)",
  fontWeight: 700,
  letterSpacing: "-0.025em",
  color: TEXT_PRIMARY,
  margin: 0,
  lineHeight: 1.25,
};

const programs = [
  { icon: Layers, label: "Full-Stack Development" },
  { icon: Globe, label: "Frontend Development" },
  { icon: Zap, label: "Backend Development" },
  { icon: Brain, label: "AI & Machine Learning" },
  { icon: TrendingUp, label: "Data Analytics" },
  { icon: Shield, label: "Cybersecurity" },
  { icon: Phone, label: "Mobile App Development" },
  { icon: Palette, label: "UI/UX Design" },
];

const reasons = [
  { icon: BookOpen, text: "Practical, project-based learning approach" },
  { icon: Target, text: "Structured learning paths for different career goals" },
  { icon: Layers, text: "Industry-relevant curriculum and technologies" },
  { icon: Briefcase, text: "Portfolio-building through real projects" },
  { icon: Users, text: "Guidance and mentorship throughout the journey" },
  { icon: Clock, text: "Flexible online learning experience" },
  { icon: TrendingUp, text: "Career-focused skill development" },
  { icon: Globe, text: "Supportive learning community" },
  { icon: Award, text: "Continuous growth and lifelong learning mindset" },
  { icon: Zap, text: "Emphasis on technical and professional development" },
];

function SectionLabel({ children }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
      textTransform: "uppercase", color: ACCENT, marginBottom: "0.6rem",
    }}>
      <span style={{ width: 16, height: 2, background: ACCENT, borderRadius: 2, display: "inline-block" }} />
      {children}
    </div>
  );
}

function MvCard({ icon, label, children }) {
  return (
    <div style={{ background: SURFACE2, border: `1px solid ${ACCENT_BORDER}`, borderRadius: 12, padding: "1.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: ACCENT_LIGHT, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon}
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: ACCENT }}>
          {label}
        </span>
      </div>
      <p style={{ fontSize: "0.9375rem", color: TEXT_SECONDARY, lineHeight: 1.7, margin: 0 }}>{children}</p>
    </div>
  );
}

export default function AboutUs() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: BG, color: TEXT_PRIMARY, lineHeight: 1.7 }}>

      {/* NAV */}
      <header style={{
        background: SURFACE, borderBottom: `1px solid ${BORDER}`,
        padding: "0 2rem", display: "flex", alignItems: "center", gap: "0.5rem", height: 56,
      }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: ACCENT_MID, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Code2 size={16} color="#fff" />
        </div>
        <span style={{ fontWeight: 600, fontSize: 15, color: TEXT_PRIMARY, letterSpacing: "-0.01em" }}>
          Devad Tech Academy
        </span>
      </header>

      {/* HERO */}
      <section style={{
        background: `radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.18) 0%, transparent 70%), ${BG}`,
        borderBottom: `1px solid ${BORDER}`, padding: "5rem 2rem 4rem", textAlign: "center",
      }}>
        <span style={{
          display: "inline-block", background: ACCENT_LIGHT, color: ACCENT,
          fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
          padding: "4px 14px", borderRadius: 999, border: `1px solid ${ACCENT_BORDER}`, marginBottom: "1.5rem",
        }}>
          About Us
        </span>

        <h1 style={{
          fontSize: "clamp(2rem, 5vw, 3.25rem)", fontWeight: 700,
          letterSpacing: "-0.03em", lineHeight: 1.15,
          maxWidth: 760, margin: "0 auto 1.5rem", color: TEXT_PRIMARY,
        }}>
          Practical technology education<br />
          <span style={{ color: ACCENT }}>built for real careers.</span>
        </h1>

        <p style={{ fontSize: "1.05rem", color: TEXT_SECONDARY, maxWidth: 660, margin: "0 auto 2.5rem" }}>
          Devad Tech Academy is an online technology academy committed to helping individuals develop practical digital skills that lead to real opportunities.
        </p>

        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "1.5rem" }}>
          {[
            { val: "7+", label: "Programs" },
            { val: "50+", label: "Hands-on Projects" },
            { val: "Flexible", label: "Online Learning" },
          ].map(({ val, label }) => (
            <div key={label} style={{ background: SURFACE, border: `1px solid ${ACCENT_BORDER}`, borderRadius: 12, padding: "0.85rem 1.5rem", minWidth: 120 }}>
              <div style={{ fontSize: "1.6rem", fontWeight: 700, color: ACCENT, lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* BODY */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 1.5rem" }}>

        {/* ABOUT */}
        <section style={{ padding: "4rem 0 3rem" }}>
          <SectionLabel>Who we are</SectionLabel>
          <h2 style={h2Style}>Technology education that goes further</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem", marginTop: "2rem" }}>
            {[
              "We believe technology education should be accessible, engaging, and focused on the skills that matter in today's world. Through structured learning paths, hands-on projects, mentorship, and industry-relevant training, we help learners grow from beginners into capable technology professionals.",
              "Our programs combine theory with practical application, ensuring learners gain experience solving real problems rather than simply memorizing concepts — supporting everyone from first-time explorers to career-changers to professionals expanding their skillset.",
              "At Devad Tech Academy, learning extends beyond the classroom. We foster creativity, critical thinking, collaboration, and innovation while helping individuals build the mindset and discipline needed to succeed in a rapidly evolving digital world.",
            ].map((text, i) => (
              <div key={i} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "1.5rem", fontSize: "0.9375rem", color: TEXT_SECONDARY, lineHeight: 1.75 }}>
                {text}
              </div>
            ))}
          </div>
        </section>

        {/* MISSION & VISION */}
        <section style={{ padding: "1rem 0 4rem" }}>
          <SectionLabel>Our direction</SectionLabel>
          <h2 style={h2Style}>Mission &amp; Vision</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem", marginTop: "2rem" }}>
            <MvCard icon={<Target size={20} color={ACCENT} />} label="Mission">
              To empower individuals with practical, high-quality technology education that equips them with the knowledge, skills, and confidence to build meaningful careers, create innovative solutions, and contribute positively to the digital economy.
            </MvCard>
            <MvCard icon={<Eye size={20} color="#A78BFA" />} label="Vision">
              To become a leading destination for technology education, recognized for developing skilled professionals, fostering innovation, and creating opportunities for learners across diverse backgrounds.
            </MvCard>
          </div>
        </section>

        {/* PROGRAMS */}
        <section style={{ padding: "1rem 0 4rem" }}>
          <SectionLabel>Curriculum</SectionLabel>
          <h2 style={h2Style}>What we offer</h2>
          <p style={{ color: TEXT_MUTED, fontSize: "0.9375rem", marginBottom: "2rem", maxWidth: 560 }}>
            Comprehensive training across the most in-demand areas of technology.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))", gap: "0.75rem" }}>
            {programs.map(({ icon: Icon, label }) => (
              <div key={label}
                style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "1rem 1.1rem", display: "flex", alignItems: "center", gap: 10, cursor: "default", transition: "border-color 0.2s, box-shadow 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(129,140,248,0.1)`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 8, background: ACCENT_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={16} color={ACCENT} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: TEXT_PRIMARY, lineHeight: 1.35 }}>{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* WHY CHOOSE */}
        <section style={{ padding: "1rem 0 4rem" }}>
          <SectionLabel>Why us</SectionLabel>
          <h2 style={h2Style}>Why choose Devad Tech Academy</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.75rem", marginTop: "2rem" }}>
            {reasons.map(({ icon: Icon, text }, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "1rem 1.1rem" }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  <Icon size={15} color="#4ADE80" />
                </div>
                <span style={{ fontSize: 13.5, color: TEXT_SECONDARY, lineHeight: 1.55 }}>{text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* PHILOSOPHY */}
        <section style={{ padding: "1rem 0 6rem" }}>
          <SectionLabel>Our approach</SectionLabel>
          <h2 style={h2Style}>Learning philosophy</h2>
          <div style={{
            marginTop: "2rem",
            background: `radial-gradient(ellipse 100% 100% at 50% 0%, rgba(99,102,241,0.1) 0%, transparent 70%), ${SURFACE}`,
            border: `1px solid ${ACCENT_BORDER}`,
            borderRadius: 16, padding: "2.5rem 2rem",
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1.5rem", textAlign: "center",
          }}>
            {[
              { icon: BookOpen, word: "Explore", desc: "Discover and question concepts" },
              { icon: Zap, word: "Practice", desc: "Repetition builds real skill" },
              { icon: Cpu, word: "Experiment", desc: "Try, fail, and iterate" },
              { icon: Briefcase, word: "Build", desc: "Create projects that matter" },
            ].map(({ icon: Icon, word, desc }) => (
              <div key={word}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: ACCENT_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.75rem", border: `1px solid ${ACCENT_BORDER}` }}>
                  <Icon size={20} color={ACCENT} />
                </div>
                <div style={{ fontWeight: 600, fontSize: 14, color: TEXT_PRIMARY, marginBottom: 4 }}>{word}</div>
                <div style={{ fontSize: 12.5, color: TEXT_MUTED }}>{desc}</div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: "1.5rem", fontSize: "0.9375rem", color: TEXT_SECONDARY, maxWidth: 680 }}>
            We believe the best way to learn technology is by building. By combining foundational knowledge with hands-on experience, learners gain a deeper understanding of concepts and develop the confidence to apply their skills in real-world situations.
          </p>
        </section>

      </div>
    </div>
  );
}