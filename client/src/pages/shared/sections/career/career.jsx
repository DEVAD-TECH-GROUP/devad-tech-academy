import {
  FiCode,
  FiLayout,
  FiServer,
  FiLayers,
  FiBarChart2,
  FiShield,
  FiPenTool,
  FiCpu,
  FiPackage,
  FiSettings,
  FiGlobe,
  FiZap,
  FiShoppingCart,
  FiHome,
  FiFlag,
  FiWifi,
  FiBriefcase,
} from "react-icons/fi";

const roles = [
  { icon: FiCode,      label: "Software Developer" },
  { icon: FiLayout,   label: "Frontend Developer" },
  { icon: FiServer,   label: "Backend Developer" },
  { icon: FiLayers,   label: "Full Stack Developer" },
  { icon: FiBarChart2,label: "Data Analyst" },
  { icon: FiShield,   label: "Cybersecurity Analyst" },
  { icon: FiPenTool,  label: "UI/UX Designer" },
  { icon: FiCpu,      label: "AI Engineer" },
  { icon: FiPackage,  label: "Product Manager" },
  { icon: FiSettings, label: "DevOps Engineer" },
];

const salaryRows = [
  { level: "Entry Level",  range: "₦150,000 – ₦400,000" },
  { level: "Mid Level",    range: "₦400,000 – ₦1,000,000" },
  { level: "Senior Level", range: "₦1,000,000 – ₦2,000,000+" },
];

const workplaces = [
  { icon: FiZap,         label: "Startups" },
  { icon: FiGlobe,       label: "Fintech Companies" },
  { icon: FiShoppingCart,label: "E-commerce Companies" },
  { icon: FiLayers,      label: "Software Agencies" },
  { icon: FiFlag,        label: "Government Organizations" },
  { icon: FiWifi,        label: "International Remote Teams" },
];

const s = {
  section: {
    background: "#0A0B1A",
    padding: "96px 24px",
    fontFamily: "'Inter', sans-serif",
    borderTop: "1px solid #1E2040",
  },
  inner: {
    maxWidth: "1000px",
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
    marginBottom: "60px",
  },
  subHeading: {
    fontFamily: "'Space Grotesk', 'Inter', sans-serif",
    fontSize: "20px",
    fontWeight: 600,
    color: "#A78BFA",
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  block: {
    marginBottom: "64px",
  },
  rolesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "12px",
  },
  roleCard: {
    background: "#13142E",
    border: "1px solid #252660",
    borderRadius: "10px",
    padding: "16px 18px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#C4C9E8",
    fontSize: "14px",
    fontWeight: 500,
  },
  iconBox: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    background: "#1F2050",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#6C63FF",
    padding: "12px 18px",
    borderBottom: "1px solid #252660",
    background: "#0E0F28",
  },
  td: {
    padding: "16px 18px",
    color: "#C4C9E8",
    fontSize: "15px",
    borderBottom: "1px solid #1A1B3A",
  },
  tdLevel: {
    padding: "16px 18px",
    color: "#E2E8F0",
    fontSize: "15px",
    fontWeight: 600,
    borderBottom: "1px solid #1A1B3A",
  },
  tableWrap: {
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #252660",
  },
  workGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "12px",
  },
  workCard: {
    background: "#13142E",
    border: "1px solid #252660",
    borderRadius: "10px",
    padding: "16px 18px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#C4C9E8",
    fontSize: "14px",
    fontWeight: 500,
  },
};

export default function CareerSection() {
  return (
    <section style={s.section}>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@600;700&display=swap"
        rel="stylesheet"
      />
      <div style={s.inner}>
        <p style={s.eyebrow}>What You Can Become</p>
        <h2 style={s.heading}>Career Opportunities & Salary Potential</h2>

        {/* Roles */}
        <div style={s.block}>
          <h3 style={s.subHeading}>
            <FiLayers size={18} /> Career Opportunities
          </h3>
          <div style={s.rolesGrid}>
            {roles.map(({ icon: Icon, label }) => (
              <div key={label} style={s.roleCard}>
                <div style={s.iconBox}>
                  <Icon size={15} color="#A78BFA" />
                </div>
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Salary */}
        <div style={s.block}>
          <h3 style={s.subHeading}>
            <FiBarChart2 size={18} /> Salary Potential (Nigeria)
          </h3>
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Level</th>
                  <th style={s.th}>Monthly Salary</th>
                </tr>
              </thead>
              <tbody>
                {salaryRows.map(({ level, range }) => (
                  <tr key={level}>
                    <td style={s.tdLevel}>{level}</td>
                    <td style={s.td}>{range}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Work Opportunities */}
        <div style={s.block}>
          <h3 style={s.subHeading}>
            <FiBriefcase size={18} /> Work Opportunities
          </h3>
          <div style={s.workGrid}>
            {workplaces.map(({ icon: Icon, label }) => (
              <div key={label} style={s.workCard}>
                <div style={s.iconBox}>
                  <Icon size={15} color="#A78BFA" />
                </div>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}