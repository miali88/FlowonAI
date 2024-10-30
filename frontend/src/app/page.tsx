import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { FeaturesSection } from "@/components/features-section";
import { Pricing } from "@/components/pricing";
import { CtaSection } from "@/components/cta-section";
import { Testimonials } from "@/components/testimonials";
import { Footer } from "@/components/footer";
import { Widget } from "@/components/widget";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl">
      <Header />
      <Hero />
      <FeaturesSection />
      <Pricing />
      <CtaSection />
      <Testimonials />
      <Footer />
      <Widget 
        agentId="10433ad9-ddfc-4592-b316-7e3b2082ec30"
        domain="www.flowonwidget.pages.dev"
      />
    </div>
  );
}
