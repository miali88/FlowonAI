'use client';

import { Header } from "@/components/header";
import dynamic from "next/dynamic";
import { ProductHuntBadge } from "@/components/ProductHuntBadge";

// Dynamically import components with SSR disabled for client-side components
const DynamicVoiceHero = dynamic(() => import('@/components/VoiceHero').then(mod => mod.VoiceHero), {
  loading: () => <div className="h-[600px]" />,
  ssr: false
});

const DynamicFeaturesAndBenefits = dynamic(() => import('@/components/FeaturesAndBenefits').then(mod => mod.FeaturesAndBenefits), {
  loading: () => <div className="h-[600px]" />,
  ssr: false
});

const DynamicEmailNotifications = dynamic(() => import('@/components/EmailNotifications').then(mod => mod.EmailNotifications), {
  loading: () => <div className="h-[600px]" />,
  ssr: false
});

const DynamicPainPointsSolutions = dynamic(() => import('@/components/PainPointsSolutions').then(mod => mod.PainPointsSolutions), {
  loading: () => <div className="h-[600px]" />,
  ssr: false
});

const DynamicVoiceSocialProof = dynamic(() => import('@/components/VoiceSocialProof').then(mod => mod.VoiceSocialProof), {
  loading: () => <div className="h-[600px]" />,
  ssr: false
});

const DynamicPricing = dynamic(() => import('@/components/pricing').then(mod => mod.Pricing), {
  loading: () => <div className="h-[600px]" />,
  ssr: false
});

const DynamicCtaSection = dynamic(() => import('@/components/CtaSection').then(mod => mod.CtaSection), {
  loading: () => <div className="h-[600px]" />,
  ssr: false
});

const DynamicFooter = dynamic(() => import('@/components/footer').then(mod => mod.Footer), {
  loading: () => <div className="h-[200px]" />,
  ssr: false
});

const DynamicProductDemo = dynamic(() => import('@/components/ProductDemo').then(mod => mod.ProductDemo), {
  loading: () => <div className="h-[600px]" />,
  ssr: false
});

const DynamicIndustriesGrid = dynamic(() => import('@/components/IndustriesGrid').then(mod => mod.IndustriesGrid), {
  loading: () => <div className="h-[600px]" />,
  ssr: false
});

const DynamicFAQSection = dynamic(() => import('@/components/FAQSection'), {
  loading: () => <div className="h-[600px]" />,
  ssr: false
});

export default function HomePage({ params }: { params: { locale: string } }) {
  // Use the locale from params
  const locale = params.locale;

  return (
    <div className="overflow-x-hidden relative">
      <Header locale={locale} />
      <ProductHuntBadge />
      <main className="w-full relative pt-[64px] sm:pt-0">
        <DynamicVoiceHero />
        <DynamicPainPointsSolutions />
        <DynamicProductDemo />
        <DynamicIndustriesGrid />
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