import { Header } from "@/components/header";
import dynamic from "next/dynamic";

// Dynamically import our custom voice landing page components
const DynamicVoiceHero = dynamic(() => import('@/components/VoiceHero').then(mod => mod.VoiceHero), {
  loading: () => <div className="h-[600px]" />,
  ssr: true
});

const DynamicValueProposition = dynamic(() => import('@/components/ValueProposition').then(mod => mod.ValueProposition), {
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


export default function HomePage() {
  return (
    <div className="overflow-x-hidden relative">
      <Header />
      <main className="w-full relative pt-[64px] sm:pt-0">
        <DynamicVoiceHero />
        <DynamicPainPointsSolutions />
        <DynamicValueProposition />
        <DynamicFeaturesAndBenefits />
        <DynamicHowItWorks />
        <DynamicVoiceSocialProof />
        <DynamicPricing />
      </main>
    </div>
  );
}
