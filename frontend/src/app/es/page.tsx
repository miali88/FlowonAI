import { Header } from "@/components/header";
import dynamic from "next/dynamic";

// Import all components from the primary English components
const DynamicVoiceHero = dynamic(() => import('@/components/VoiceHero').then(mod => mod.VoiceHero), {
  loading: () => <div className="h-[600px]" />,
  ssr: true
});

const DynamicHowItWorks = dynamic(() => import('@/components/HowItWorks').then(mod => mod.HowItWorks), {
  loading: () => <div className="h-[600px]" />,
  ssr: true
});

const DynamicFeaturesAndBenefits = dynamic(() => import('@/components/FeaturesAndBenefits').then(mod => mod.FeaturesAndBenefits), {
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

const DynamicGuidedSetupSection = dynamic(() => import('@/components/GuidedSetupSection').then(mod => mod.GuidedSetupSection), {
  loading: () => <div className="h-[600px]" />,
  ssr: true
});

export const metadata = {
  title: 'Flowon AI - Respuesta telefónica con IA para tu negocio',
  description: 'Crea tus propios agentes de chatbot con Flowon AI. Nuestra plataforma te permite crear, entrenar y desplegar tus propios agentes de chatbot con facilidad.'
};

export default function HomePage() {
  return (
    <div className="overflow-x-hidden relative">
      <Header locale="es" />
      <main className="w-full relative pt-[64px] sm:pt-0">
        <DynamicVoiceHero />
        <DynamicPainPointsSolutions />
        <DynamicGuidedSetupSection />
        <DynamicCarouselTestimonials />
        <DynamicFeaturesAndBenefits />
        <DynamicHowItWorks />
        <DynamicVoiceSocialProof />
        <DynamicPricing />  
        <DynamicCtaSection />
      </main>
      <DynamicFooter />
    </div>
  );
} 