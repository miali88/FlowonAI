import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { SocialProof } from "@/components/social-proof";
import { FeaturesSection } from "@/components/features-section";
import { Pricing } from "@/components/pricing";
import { CtaSection } from "@/components/cta-section";
import { Testimonials } from "@/components/testimonials";
import { Footer } from "@/components/footer";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl">
      <Header />
      <Hero />
      <SocialProof />
      <FeaturesSection />
      <Pricing />
      <CtaSection />
      <Testimonials />
      <Footer />
    </div>
  );
}
