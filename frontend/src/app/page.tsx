import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { SetupSection } from "@/components/SetupSection";
import { CtaSection } from "@/components/cta-section";
import { Footer } from "@/components/footer";
import { Particles } from "@/components/magicui/particles";
import { DeploySection } from "@/components/deploy";
import { KeySection } from "@/components/KeySection";
import { BenefitsSection } from "@/components/BenefitsSection";
import ComparisonSection from "@/components/ComparisonSection";
import LeadGenSection from "@/components/LeadGenSection";
import IndustrySection from "@/components/IndustrySection";
import CommunicationSection from "@/components/CommunicationSection";
import WorkloadSection from "@/components/WorkloadSection";
import PsychologySection from "@/components/PsychologySection";
import ROISection from "@/components/ROISection";
import TelephonySection from "@/components/TelephonySection";
import FAQSection from "@/components/FAQSection";
import { Pricing } from "@/components/pricing";



export default function HomePage() {
  return (
    <div className="overflow-x-hidden relative">
      <Header />
      <main className="w-full relative">
        <Particles
          ease={70}
          size={0.10}
          color="#ffffff"
          quantity={235}
          staticity={40}
          className="absolute inset-0 -z-10 h-full"
        />
        <Hero />
        <div className="mx-auto max-w-7xl">
          <KeySection /> 
          <SetupSection />
          <DeploySection />
          <BenefitsSection />
          <ComparisonSection />
          <LeadGenSection />
          <IndustrySection />
          <CommunicationSection />
          <WorkloadSection />
          <PsychologySection />
          <ROISection />  
          <TelephonySection />
          <FAQSection />
          <Pricing />
          <CtaSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}
