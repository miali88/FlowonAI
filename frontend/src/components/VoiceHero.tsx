'use client';

import { memo } from "react";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from "lucide-react";
import { useTranslations } from 'next-intl';

// Shared button component
const CallToActionButton = () => {
  const t = useTranslations('home');
  
  return (
    <div className="flex flex-col items-center relative z-20 animate-fade-in [--animation-delay:600ms]">
      <Link 
        href="https://calendly.com/michael-flowon/catch-up" 
        className="inline-block"
      >
        <Button 
          className="text-lg sm:px-8 sm:py-6 px-6 py-4 sm:text-lg text-base group bg-black hover:bg-black/90 text-white shadow-lg"
        >
          {t('cta')}
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </Link>
      <p className="text-sm text-gray-500 mt-2">{t('noCreditCard')}</p>
    </div>
  );
};

// Mobile Hero component
const MobileHero = memo(() => {
  const t = useTranslations('home');
  
  return (
    <section className="relative mx-auto px-4 text-center max-w-[100rem] sm:hidden
      before:content-[''] before:absolute before:w-[30rem] before:h-[30rem] before:rounded-full before:bg-[#ff69b450] before:blur-[80px] before:-z-10 before:animate-blob before:top-[10%] before:left-[5%]
      after:content-[''] after:absolute after:w-[30rem] after:h-[30rem] after:rounded-full after:bg-[#4ea8de50] after:blur-[80px] after:-z-10 after:animate-blob after:animation-delay-2000 after:top-[20%] after:right-[5%]">
      <div className="min-h-[50dvh] flex flex-col items-center justify-start pt-8 pb-32 relative overflow-hidden">
        <h1 className="text-4xl font-medium font-heading leading-[1.1] tracking-tighter py-1">
          <span className="block">{t('title')}</span>
        </h1>

        <p className="mb-2 text-sm tracking-tight text-muted-foreground max-w-[90vw] mx-auto px-2 mt-4">
          {t('description')}
        </p>

        <div className="mt-8">
          <CallToActionButton />
        </div> 
      </div>
    </section>
  );
});
MobileHero.displayName = 'MobileHero';

// Desktop Hero component
const DesktopHero = memo(() => {
  const t = useTranslations('home');
  
  return (
    <section className="relative mx-auto px-4 sm:px-6 text-center md:px-8 max-w-[100rem] hidden sm:block
      before:content-[''] before:absolute before:w-[60rem] before:h-[60rem] before:rounded-full before:bg-[#ff69b450] before:blur-[100px] before:-z-10 before:animate-blob before:top-[-15%] before:left-[5%]
      after:content-[''] after:absolute after:w-[60rem] after:h-[60rem] after:rounded-full after:bg-[#4ea8de50] after:blur-[100px] after:-z-10 after:animate-blob after:animation-delay-2000 after:top-[20%] after:right-[5%]">
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-16 relative overflow-hidden">
        <h1 className="py-8 text-center text-5xl font-medium font-heading leading-tight tracking-tighter sm:text-6xl md:text-7xl">
          <span className="block">{t('title')}</span>
        </h1>

        <p className="mb-16 text-lg tracking-tight text-muted-foreground md:text-xl lg:text-2xl max-w-3xl mx-auto">
          {t('description')}
        </p>

        <div className="mt-8">
          <CallToActionButton />
        </div>
      </div>

      <div className="mt-12 flex flex-wrap justify-center gap-8">
        <div className="w-full lg:w-[45%] max-w-xl p-6 bg-black/5 rounded-lg shadow-md border border-gray-100">
          <div className="p-4 rounded-md">
            <div className="text-xl text-center font-medium">
              {t('neverMissCall')}
            </div>
            <div className="mt-4 text-center text-gray-600 text-sm">
              {t('neverMissCallDesc')}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[45%] max-w-xl p-6 bg-black/5 rounded-lg shadow-md border border-gray-100">
          <div className="p-4 rounded-md">
            <div className="text-xl text-center font-medium">
              {t('smartConversations')}
            </div>
            <div className="mt-4 text-center text-gray-600 text-sm">
              {t('smartConversationsDesc')}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
DesktopHero.displayName = 'DesktopHero';

export function VoiceHero() {
  return (
    <>
      <MobileHero />
      <DesktopHero />
    </>
  );
} 