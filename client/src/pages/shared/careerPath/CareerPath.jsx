// PreviewAll.jsx — import this in your app to see all three sections stacked
// Each section can be used independently in your routing/page structure

import JourneySection from "../sections/career/journey";
import CareerSection from "../sections/career/career";
import CompaniesSection from "../sections/career/company";

export default function PreviewAll() {
  return (
    <div style={{ background: "#0A0B1A", minHeight: "100vh" }}>
      <JourneySection />
      <CareerSection />
      <CompaniesSection />
    </div>
  );
}