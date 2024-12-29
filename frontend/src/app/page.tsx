import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { CtaSection } from "@/components/cta-section";
import { Footer } from "@/components/footer";
import TelephonySection from "@/components/TelephonySection";
import AppUILanding from "@/components/AppUILanding";
import dynamic from "next/dynamic";

const ComparisonSection = dynamic(() => import('@/components/Compare'), {
  loading: () => <div className="h-[600px]" />, // Adjust height as needed
  ssr: false
});

// Convert components to dynamic imports
const DynamicTimelineDeploy = dynamic(() => import('@/components/TimelineDeploy').then(mod => mod.TimelineDeploy), {
  loading: () => <div className="h-[400px]" />,
  ssr: true
});

const DynamicBenefitsSection = dynamic(() => import('@/components/BenefitsSection').then(mod => mod.BenefitsSection), {
  loading: () => <div className="h-[400px]" />,
  ssr: true
});

const DynamicPricing = dynamic(() => import('@/components/pricing').then(mod => mod.Pricing), {
  loading: () => <div className="h-[600px]" />,
  ssr: true
});


export default function HomePage() {
  return (
    <div className="overflow-x-hidden relative">
      <Header />
      <main className="w-full relative pt-[64px] sm:pt-0">
        <div className="mx-auto max-w-7xl">
          <Hero />
          <AppUILanding />
          <DynamicTimelineDeploy />
          <DynamicBenefitsSection />
          {/* <TelephonySection /> */}
          <DynamicPricing />
          <CtaSection /> 
          <Footer />
        </div>
      </main>
    </div>
  );
}
