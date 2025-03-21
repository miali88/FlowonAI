'use client';

import { memo } from "react";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from "lucide-react";
import { useTranslations } from 'next-intl';
import { WavyBackground } from "@/components/ui/wavy-background";

// Shared button component
const CallToActionButton = () => {
  const t = useTranslations('home');
  
  return (
    <>
      <div className="flex flex-col items-center relative z-20 animate-fade-in [--animation-delay:600ms]">
        <Link 
          href="https://cal.com/michael-ali-5fcg8p/30min" 
          className="inline-block"
        >
          <Button 
            className="text-lg sm:px-8 sm:py-6 px-6 py-4 sm:text-lg text-base group bg-black hover:bg-black/90 text-white shadow-lg"
          >
            {t('cta')}
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
      <div className="opacity-0 animate-fade-in [--animation-delay:800ms]">
        <p className="text-sm text-gray-500 mt-2">{t('noCreditCard')}</p>
      </div>
    </>
  );
};

// Mobile Hero component
const MobileHero = memo(() => {
  const t = useTranslations('home');
  
  return (
    <div className="w-screen sm:hidden">
      <WavyBackground 
        containerClassName="min-h-[50dvh]"
        className="max-w-[90rem] mx-auto px-4"
        colors={['#38bdf8', '#818cf8', '#c084fc']}
        blur={10}
        speed="slow"
        waveWidth={50}
        backgroundFill="white"
        waveOpacity={0.5}
      >
        <div className="flex flex-col items-center justify-start pt-8">
          <h1 className="text-4xl font-medium font-heading leading-[1.1] tracking-tighter py-1 opacity-0 animate-fade-in [--animation-delay:200ms] text-black">
            <span className="block">{t('title')}</span>
          </h1>

          <p className="mb-2 text-sm tracking-tight text-gray-600 max-w-[90vw] mx-auto mt-4 opacity-0 animate-fade-in [--animation-delay:400ms]">
            {t('description')}
          </p>

          <div className="mt-8 mb-16">
            <CallToActionButton />
          </div> 
        </div>
      </WavyBackground>
    </div>
  );
});
MobileHero.displayName = 'MobileHero';

// Desktop Hero component
const DesktopHero = memo(() => {
  const t = useTranslations('home');
  
  return (
    <div className="w-screen hidden sm:block">
      <WavyBackground 
        containerClassName="min-h-[60dvh]"
        className="max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8"
        colors={['#38bdf8', '#818cf8', '#c084fc']}
        blur={10}
        speed="slow"
        waveWidth={50}
        backgroundFill="white"
        waveOpacity={0.5}
      >
        <div className="flex flex-col items-center justify-center py-16">
          <h1 className="py-8 text-center text-5xl font-medium font-heading leading-tight tracking-tighter sm:text-6xl md:text-7xl opacity-0 animate-fade-in [--animation-delay:200ms] text-black">
            <span className="block">{t('title')}</span>
          </h1>

          <p className="mb-16 text-lg tracking-tight text-gray-600 md:text-xl lg:text-2xl max-w-3xl mx-auto opacity-0 animate-fade-in [--animation-delay:400ms]">
            {t('description')}
          </p>

          <div className="mt-8 mb-16">
            <CallToActionButton />
          </div>
        </div>
      </WavyBackground>
    </div>
  );
});
DesktopHero.displayName = 'DesktopHero';

export function VoiceHero() {
  return (
    <section className="relative w-screen overflow-x-hidden">
      <MobileHero />
      <DesktopHero />
    </section>
  );
} 