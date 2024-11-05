import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { FeaturesSection } from "@/components/features-section";
import { SetupSection } from "@/components/SetupSection";
import { ConversationLogs } from "@/components/conversation-logs";
import { Pricing } from "@/components/pricing";
import { CtaSection } from "@/components/cta-section";
import { Testimonials } from "@/components/testimonials";
import { Footer } from "@/components/footer";

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      <Header />
      <main className="w-full">
        <Hero />
        <div className="mx-auto max-w-7xl">
          <ConversationLogs />
          <FeaturesSection />
          <SetupSection />
          <Pricing />
          <CtaSection />
          <Testimonials />
        </div>
      </main>
      <Footer />
    </div>
  );
}
