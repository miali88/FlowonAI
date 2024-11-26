import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { FeaturesSection } from "@/components/features-section";
import { SetupSection } from "@/components/SetupSection";
import { ConversationLogs } from "@/components/conversation-logs";
import { CtaSection } from "@/components/cta-section";
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
          <CtaSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}
