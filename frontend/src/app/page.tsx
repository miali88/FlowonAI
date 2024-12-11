'use client';
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { FeaturesSection } from "@/components/features-section";
import { SetupSection } from "@/components/SetupSection";
import { ConversationLogs } from "@/components/conversation-logs";
import { Pricing } from "@/components/pricing";
import { CtaSection } from "@/components/cta-section";
import { Testimonials } from "@/components/testimonials";
import { Footer } from "@/components/footer";
import { Particles } from "@/components/magicui/particles";
import { DeploySection } from "@/components/deploy";
import { Information } from "@/components/Information";

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
          <SetupSection />
          <DeploySection />
          <Information />
          <ConversationLogs />
          <FeaturesSection />
          {/* <div id="pricing" className="scroll-mt-20">
            <Pricing />
          </div> */}
          <CtaSection />
          {/* <Testimonials /> */}
        </div>
      </main>
      <Footer />
    </div>
  );
}
