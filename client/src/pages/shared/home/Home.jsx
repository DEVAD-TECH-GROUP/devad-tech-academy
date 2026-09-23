import HeroSection from "../sections/homeSections/HeroSection";
import WhyChooseUs from "../sections/homeSections/HomeAuthoritySection";
import ProgramsSection from "../sections/homeSections/Process";
import LearningJourney from "../sections/homeSections/Projects"
import FAQSection from "../sections/homeSections/Testimonial";
import FinalCTA from "../sections/homeSections/HomeActSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <WhyChooseUs />
      <ProgramsSection />
      <LearningJourney />
      <FAQSection />
      <FinalCTA />
      
      {/* Other home sections will go here later */}
    </>
  );
}