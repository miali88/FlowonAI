'use client';

import React from "react";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { PhoneOff, DollarSign, Mic } from "lucide-react";
import { useTranslations } from 'next-intl';

export function ValueProposition() {
  const t = useTranslations('valueProposition');
  
  return (
    <section className="relative w-full py-12 md:py-24 overflow-hidden bg-black/5 dark:bg-white/5">
      <div className="absolute inset-0 h-full w-full bg-black/5 dark:bg-white/5" />
      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
            {t('sectionTitle')}
          </h2>
        </div>

        <div className="mx-auto max-w-3xl text-center mb-12">
          <p className="text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          <CardSpotlight className="p-6 bg-black/10 backdrop-filter backdrop-blur-sm border border-white/10 rounded-xl">
            <div className="flex flex-col items-center text-center space-y-2">
              <PhoneOff className="h-10 w-10 text-red-500 mb-2" />
              <h3 className="text-xl font-semibold">{t('card1.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('card1.description')}</p>
            </div>
          </CardSpotlight>

          <CardSpotlight className="p-6 bg-black/10 backdrop-filter backdrop-blur-sm border border-white/10 rounded-xl">
            <div className="flex flex-col items-center text-center space-y-2">
              <DollarSign className="h-10 w-10 text-green-500 mb-2" />
              <h3 className="text-xl font-semibold">{t('card2.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('card2.description')}</p>
            </div>
          </CardSpotlight>

          <CardSpotlight className="p-6 bg-black/10 backdrop-filter backdrop-blur-sm border border-white/10 rounded-xl lg:col-span-1 md:col-span-2 lg:mx-auto lg:w-full md:max-w-md">
            <div className="flex flex-col items-center text-center space-y-2">
              <Mic className="h-10 w-10 text-blue-500 mb-2" />
              <h3 className="text-xl font-semibold">{t('card3.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('card3.description')}</p>
            </div>
          </CardSpotlight>
        </div>
      </div>
    </section>
  );
} 