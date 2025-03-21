import { Header } from "@/components/header";
import dynamic from "next/dynamic";

// Dynamically import components
const DynamicVoiceHero = dynamic(() => import('@/components/VoiceHero').then(mod => mod.VoiceHero), {
  loading: () => <div className="h-[600px]" />,
  ssr: true
});

const DynamicFeaturesAndBenefits = dynamic(() => import('@/components/FeaturesAndBenefits').then(mod => mod.FeaturesAndBenefits), {
  loading: () => <div className="h-[600px]" />,
  ssr: true
});

const DynamicEmailNotifications = dynamic(() => import('@/components/EmailNotifications').then(mod => mod.EmailNotifications), {
  loading: () => <div className="h-[600px]" />,
  ssr: true
});

const DynamicPainPointsSolutions = dynamic(() => import('@/components/PainPointsSolutions').then(mod => mod.PainPointsSolutions), {
  loading: () => <div className="h-[600px]" />,
  ssr: true
});

const DynamicVoiceSocialProof = dynamic(() => import('@/components/VoiceSocialProof').then(mod => mod.VoiceSocialProof), {
  loading: () => <div className="h-[600px]" />,
  ssr: true
});

const DynamicPricing = dynamic(() => import('@/components/pricing').then(mod => mod.Pricing), {
  loading: () => <div className="h-[600px]" />,
  ssr: true
});

const DynamicCtaSection = dynamic(() => import('@/components/CtaSection').then(mod => mod.CtaSection), {
  loading: () => <div className="h-[600px]" />,
  ssr: true
});

const DynamicCarouselTestimonials = dynamic(() => import('@/components/CarouselTestimonials').then(mod => mod.CarouselTestimonials), {
  loading: () => <div className="h-[600px]" />,
  ssr: true
});

const DynamicFooter = dynamic(() => import('@/components/footer').then(mod => mod.Footer), {
  loading: () => <div className="h-[200px]" />,
  ssr: true
});

const DynamicProductDemo = dynamic(() => import('@/components/ProductDemo').then(mod => mod.ProductDemo), {
  loading: () => <div className="h-[600px]" />,
  ssr: true
});

const DynamicIndustriesGrid = dynamic(() => import('@/components/IndustriesGrid').then(mod => mod.IndustriesGrid), {
  loading: () => <div className="h-[600px]" />,
  ssr: true
});

const DynamicFAQSection = dynamic(() => import('@/components/FAQSection'), {
  loading: () => <div className="h-[600px]" />,
  ssr: true
});

export default function HomePage({ params }: { params: { locale: string } }) {
  // Use the locale from params
  const locale = params.locale;

  return (
    <div className="overflow-x-hidden relative">
      <Header locale={locale} />
      <main className="w-full relative pt-[64px] sm:pt-0">
        <DynamicVoiceHero />
        <DynamicPainPointsSolutions />
        <DynamicProductDemo />
        <DynamicIndustriesGrid />
        <DynamicCarouselTestimonials />
        <DynamicFeaturesAndBenefits />
        <DynamicEmailNotifications />
        <DynamicVoiceSocialProof />
        <DynamicPricing />
        <DynamicFAQSection />  
        <DynamicCtaSection />
      </main>
      <DynamicFooter />
    </div>
  );
} 