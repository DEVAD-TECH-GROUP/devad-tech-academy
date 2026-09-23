import {
  FiUserPlus,
  FiBook,
  FiCode,
  FiAward,
  FiBriefcase,
  FiTrendingUp,
} from "react-icons/fi";

const steps = [
  {
    icon: FiUserPlus,
    label: "Enroll",
    description:
      "Join your chosen program and gain access to the full learning platform and community.",
  },
  {
    icon: FiBook,
    label: "Learn",
    description:
      "Attend live classes, complete assignments, and master industry-relevant concepts at your pace.",
  },
  {
    icon: FiCode,
    label: "Build",
    description:
      "Work on real-world projects and create a portfolio that demonstrates your abilities to employers.",
  },
  {
    icon: FiAward,
    label: "Graduate",
    description:
      "Complete your training, sit your assessments, and earn your verified certificate.",
  },
  {
    icon: FiBriefcase,
    label: "Career Preparation",
    description:
      "Optimize your CV, portfolio, LinkedIn profile, and sharpen your interview skills with expert guidance.",
  },
  {
    icon: FiTrendingUp,
    label: "Apply & Get Hired",
    description:
      "Pursue internships, freelance opportunities, remote roles, and full-time positions with confidence.",
  },
];

const styles = {
  section: {
    background: "linear-gradient(160deg, #0A0B1A 0%, #0F1030 100%)",
    padding: "96px 24px",
    fontFamily: "'Inter', sans-serif",
  },
  inner: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  eyebrow: {
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "#6C63FF",
    marginBottom: "16px",
  },
  heading: {
    fontFamily: "'Space Grotesk', 'Inter', sans-serif",
    fontSize: "clamp(28px, 5vw, 44px)",
    fontWeight: 700,
    color: "#E2E8F0",
    lineHeight: 1.15,
    marginBottom: "56px",
  },
  timeline: {
    position: "relative",
    paddingLeft: "48px",
  },
  track: {
    position: "absolute",
    left: "15px",
    top: "8px",
    bottom: "8px",
    width: "2px",
    background:
      "linear-gradient(to bottom, #6C63FF 0%, #A78BFA 60%, transparent 100%)",
    borderRadius: "2px",
  },
  step: {
    position: "relative",
    marginBottom: "48px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  nodeWrap: {
    position: "absolute",
    left: "-48px",
    top: "0px",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  nodeGlow: {
    position: "absolute",
    inset: "-6px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(108,99,255,0.25) 0%, transparent 70%)",
  },
  nodeDot: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "#1A1B3A",
    border: "2px solid #6C63FF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    zIndex: 1,
  },
  stepLabel: {
    fontFamily: "'Space Grotesk', 'Inter', sans-serif",
    fontSize: "18px",
    fontWeight: 600,
    color: "#E2E8F0",
    lineHeight: 1.3,
  },
  stepDesc: {
    fontSize: "15px",
    color: "#94A3B8",
    lineHeight: 1.65,
    maxWidth: "560px",
  },
};

export default function JourneySection() {
  return (
    <section style={styles.section}>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@600;700&display=swap"
        rel="stylesheet"
      />
      <div style={styles.inner}>
        <p style={styles.eyebrow}>Student Journey</p>
        <h2 style={styles.heading}>Your Journey to a Tech Career</h2>

        <div style={styles.timeline}>
          <div style={styles.track} />
          {steps.map(({ icon: Icon, label, description }, i) => (
            <div key={i} style={styles.step}>
              <div style={styles.nodeWrap}>
                <div style={styles.nodeGlow} />
                <div style={styles.nodeDot}>
                  <Icon size={14} color="#A78BFA" />
                </div>
              </div>
              <p style={styles.stepLabel}>{label}</p>
              <p style={styles.stepDesc}>{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

