'use client';

import React from "react";
import { StarIcon } from "lucide-react";
import { useTranslations } from 'next-intl';

export function VoiceSocialProof() {
  const t = useTranslations('voiceSocialProof');
  
  return (
    <section className="w-full py-12 md:py-24 bg-gradient-to-b from-background to-background/90">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
            {t('sectionTitle')}
          </h2>
          <p className="max-w-[85%] md:max-w-[65%] text-muted-foreground text-lg">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mx-auto max-w-2xl justify-items-center">
          {/* <div className="p-8 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg transition-all duration-300 hover:bg-white/10">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <blockquote className="text-md md:text-lg italic text-center">
                {t('testimonial1.quote')}
              </blockquote>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">{t('testimonial1.company')}</p>
              </div>
            </div>
          </div> */}

          <div className="p-8 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg transition-all duration-300 hover:bg-white/10">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <blockquote className="text-md md:text-lg italic text-center">
                {t('testimonial2.quote')}
              </blockquote>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">{t('testimonial2.company')}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
} 