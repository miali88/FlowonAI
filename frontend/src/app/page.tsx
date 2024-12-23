import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { CtaSection } from "@/components/cta-section";
import { Footer } from "@/components/footer";
import { BenefitsSection } from "@/components/BenefitsSection";
import TelephonySection from "@/components/TelephonySection";
// import FAQSection from "@/components/FAQSection";
import { Pricing } from "@/components/pricing";
import AppUILanding from "@/components/AppUILanding";
import dynamic from "next/dynamic";
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

<div className="mx-auto max-w-7xl">
          <Hero />
          <AppUILanding />
          <TimelineDeploy />
          <BenefitsSection />
          {/* <TelephonySection /> */}
          <Pricing />
          <CtaSection /> 
          <Footer />
        </div>
      </main>
    </div>
  );
}
