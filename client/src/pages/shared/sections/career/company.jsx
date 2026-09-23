import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faGoogle, 
  faMicrosoft, 
  faAmazon, 
  faMeta, 
  faApple, 
  // faNetflix, 
  faShopify 
} from "@fortawesome/free-brands-svg-icons";
import { faStar, faCreditCard, faMoneyBillWave, faGlobe } from "@fortawesome/free-solid-svg-icons";

// Font Awesome covers global tech perfectly out of the box. 
// For specific regional fintechs (Flutterwave, Paystack, Moniepoint) that are not in FA's core font library,
// we map highly accurate alternative FA indicators to keep the icon geometry razor-sharp and clean.
const companies = [
  { name: "Google",       tag: "Search & Cloud",       icon: faGoogle,        brandColor: "#4285F4" },
  { name: "Microsoft",    tag: "Enterprise & Cloud",    icon: faMicrosoft,     brandColor: "#00A4EF" },
  { name: "Amazon",       tag: "E-commerce & AWS",     icon: faAmazon,        brandColor: "#FF9900" },
  { name: "Meta",         tag: "Social & AR",           icon: faMeta,          brandColor: "#0064E0" },
  { name: "Apple",        tag: "Consumer Tech",         icon: faApple,         brandColor: "#FFFFFF" },
  // { name: "Netflix",      tag: "Streaming & Data",      icon: faNetflix,       brandColor: "#E50914" },
  { name: "Shopify",      tag: "E-commerce Platform",   icon: faShopify,       brandColor: "#7AB55C" },
  { name: "Flutterwave",  tag: "African Fintech",       icon: faGlobe,         brandColor: "#F5A623" },
  { name: "Paystack",     tag: "Nigerian Fintech",      icon: faCreditCard,    brandColor: "#00C3F7" },
  { name: "Moniepoint",   tag: "Business Payments",     icon: faMoneyBillWave, brandColor: "#00DF9A" },
];

const s = {
  section: {
    background: "linear-gradient(160deg, #0F1030 0%, #0A0B1A 100%)", // Immersive dark tech background
    padding: "96px 24px 112px",
    fontFamily: "'Inter', sans-serif",
    borderTop: "1px solid #1E2040",
  },
  inner: { maxWidth: "1000px", margin: "0 auto" },
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
    fontSize: "clamp(28px, 5vw, 42px)",
    fontWeight: 700,
    color: "#E2E8F0",
    lineHeight: 1.15,
    marginBottom: "16px",
  },
  subtext: {
    fontSize: "16px",
    color: "#64748B",
    lineHeight: 1.7,
    maxWidth: "580px",
    marginBottom: "56px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
    gap: "16px",
    marginBottom: "48px",
  },
  card: {
    background: "#13142E", // Modern translucent dark slate cards
    border: "1px solid #252660",
    borderRadius: "14px",
    padding: "24px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.2)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
    cursor: "pointer",
  },
  logoBox: {
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  companyName: {
    fontFamily: "'Space Grotesk', 'Inter', sans-serif",
    fontSize: "15px",
    fontWeight: 600,
    color: "#E2E8F0",
    marginBottom: "3px",
  },
  companyTag: { 
    fontSize: "12px", 
    color: "#4A5568", 
    fontWeight: 500 
  },
  footer: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    background: "#0E0F28",
    border: "1px solid #1E2050",
    borderRadius: "12px",
    padding: "20px 24px",
  },
  footerText: { 
    fontSize: "14px", 
    color: "#94A3B8", 
    lineHeight: 1.6 
  },
  footerHighlight: { 
    color: "#A78BFA", 
    fontWeight: 600 
  },
};

export default function CompaniesSection() {
  return (
    <section style={s.section}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet"/>
      <div style={s.inner}>
        <p style={s.eyebrow}>Where You Can Work</p>
        <h2 style={s.heading}>Companies That Hire Tech Talent</h2>
        <p style={s.subtext}>
          Tech professionals are employed by organizations of all sizes, from
          innovative startups to global technology leaders.
        </p>

        <div style={s.grid}>
          {companies.map(({ name, tag, icon, brandColor }) => (
            <div 
              key={name} 
              style={s.card}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 20px -3px rgba(0, 0, 0, 0.4)";
                e.currentTarget.style.borderColor = "#6C63FF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.2)";
                e.currentTarget.style.borderColor = "#252660";
              }}
            >
              <div style={s.logoBox}>
                <FontAwesomeIcon icon={icon} size="2x" style={{ color: brandColor }} />
              </div>
              <div>
                <p style={s.companyName}>{name}</p>
                <p style={s.companyTag}>{tag}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={s.footer}>
          <div style={{ marginTop: "2px", flexShrink: 0 }}>
            <FontAwesomeIcon icon={faStar} style={{ color: "#6C63FF" }} />
          </div>
          <p style={s.footerText}>
            And{" "}
            <span style={s.footerHighlight}>thousands of companies worldwide</span>{" "}
            actively hiring skilled tech professionals across every industry and continent.
          </p>
        </div>
      </div>
    </section>
  );
}