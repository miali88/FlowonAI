import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { SetupSection } from "@/components/SetupSection";
import { CtaSection } from "@/components/cta-section";
import { Footer } from "@/components/footer";
import { Particles } from "@/components/magicui/particles";
import { DeploySection } from "@/components/deploy";
import { BenefitsSection } from "@/components/BenefitsSection";
import TelephonySection from "@/components/TelephonySection";
// import FAQSection from "@/components/FAQSection";
import { Pricing } from "@/components/pricing";
import { LeadsMarquee } from "@/components/LeadsMarquee";
import AppUILanding from "@/components/AppUILanding";
import dynamic from "next/dynamic";
import { QandA } from "@/components/QandA";
import { TimelineDeploy } from "@/components/TimelineDeploy";

const ComparisonSection = dynamic(() => import('@/components/Compare'), {
  loading: () => <div className="h-[600px]" />, // Adjust height as needed
  ssr: false
});

export default function HomePage() {
  return (
    <div className="overflow-x-hidden relative">
      <Header />
      <main className="w-full relative">
        {/* <Particles
          ease={70}
          size={0.80}
          color="#ffffff"
          quantity={235}
          staticity={40}
          className="absolute inset-0 -z-10 h-full"
        /> */}

<div className="mx-auto max-w-7xl">
          <Hero />
          <AppUILanding />
          <TimelineDeploy />
          <SetupSection />
          <LeadsMarquee /> 
          <DeploySection />
          <TelephonySection />
          <ComparisonSection />
          <BenefitsSection />
          {/* <FAQSection /> */}
          <Pricing />
          <CtaSection /> 
          <Footer />
        </div>
      </main>
    </div>
  );
}
