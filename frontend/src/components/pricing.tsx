"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { memo, useState, useCallback } from "react";

import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import React from "react";
import { useTranslations } from 'next-intl';

interface PricingProps {
  currentPlan?: string;
}

// Extract price configuration
const PRICING_CONFIG = {
  professional: {
    name: 'Professional',
    description: 'Perfect for small businesses starting with automation',
    monthlyPrice: '49',
    yearlyPrice: '490',
    features: [
      'Up to 250 minutes',
      'Then $0.25 per minute',
      'Message taking with custom questions',
      'Smart spam detection',
      'Bilingual agent - English + Spanish'
    ]
  },
  scale: {
    name: 'Scale',
    description: 'For growing businesses with higher call volume',
    monthlyPrice: '99',
    yearlyPrice: '990',
    features: [
      'Up to 600 minutes',
      'Then $0.20 per minute',
      'Everything in Professional',
      'Custom call routing logic',
      'Priority support'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    description: 'For established businesses with complex needs',
    monthlyPrice: '249',
    yearlyPrice: '2490',
    features: [
      'Up to 2000 minutes',
      'Then $0.15 per minute',
      'Everything in Scale',
      'Dedicated account manager',
      'Custom integrations',
      'Multi-location support'
    ]
  }
};

// Pricing tier label component
const PricingTierLabel = memo(function PricingTierLabel({ currentPlan, tierName }: { currentPlan?: string; tierName: string }) {
  const isCurrentPlan = currentPlan?.toLowerCase() === tierName.toLowerCase();
  
  if (isCurrentPlan) {
    return (
      <div className="absolute -top-3 right-0 z-10 rounded-l-full bg-primary px-3 py-1 text-xs font-semibold uppercase text-foreground shadow-lg">
        Current Plan
      </div>
    );
  }
  
  if (tierName.toLowerCase() === "scale") {
    return (
      <div className="absolute -top-3 right-0 z-10 rounded-l-full bg-primary px-3 py-1 text-xs font-semibold uppercase text-background shadow-lg">
        Popular
      </div>
    );
  }
  
  return null;
});

// Feature check icon
const FeatureCheck = memo(function FeatureCheck() {
  return (
    <div className="flex-shrink-0">
      <Check className="h-5 w-5 text-green-500" />
    </div>
  );
});

// Feature list component
const FeatureList = memo(function FeatureList({ features }: { features: string[] }) {
  return (
    <ul className="mt-6 space-y-4">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start">
          <FeatureCheck />
          <span className="ml-3 text-sm text-muted-foreground">{feature}</span>
        </li>
      ))}
    </ul>
  );
});

export function Pricing({ currentPlan }: PricingProps) {
  const [isAnnual, setIsAnnual] = useState(false);
  const t = useTranslations('pricing');
  
  // Memoize handlers
  const handlePlanClick = useCallback((planName: string) => {
    if (currentPlan?.toLowerCase() === planName.toLowerCase()) return;
    window.location.href = "/sign-up";
  }, [currentPlan]);

  const getButtonText = useCallback((planName: string) => {
    if (currentPlan?.toLowerCase() === planName.toLowerCase()) return t('currentPlan');
    return t('getCurrentPlan');
  }, [currentPlan, t]);

  return (
    <section className="mx-auto flex max-w-screen-xl flex-col gap-8 px-4 py-14 md:px-8">
      <div className="mx-auto max-w-screen-xl px-4 md:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight sm:text-6xl font-heading">
            {t('title')}
          </h2>
          <p className="mt-6 text-xl leading-8">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex w-full items-center justify-center space-x-2 mx-2 my-6">
          <Switch 
            id="interval" 
            checked={isAnnual}
            onCheckedChange={(checked) => setIsAnnual(checked)}
          />
          <span>{isAnnual ? t('yearly') : t('monthly')}</span>
          {isAnnual && (
            <span className="inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase leading-5 tracking-wide bg-foreground text-background">
              {t('yearlyDiscount')}
            </span>
          )}
        </div>
        <div className="mx-auto grid w-full justify-center sm:grid-cols-2 lg:grid-cols-3 flex-col gap-4 place-items-center">
          <Card className="relative max-w-[300px] overflow-hidden rounded-2xl shadow-lg border">
            <PricingTierLabel currentPlan={currentPlan} tierName="professional" />
            <CardContent className="flex flex-col gap-8 p-4">
              <div className="flex flex-col pl-4">
                <h2 className="text-base font-semibold leading-7">{t('professional.name')}</h2>
                <p className="h-12 text-sm leading-5 flex justify-center justify-items-center place-content-center origin-center bg-center place-self-center">
                  {t('professional.description')}
                </p>
              </div>
              <motion.div
                animate="animate"
                initial="initial"
                variants={{ animate: { y: 0, opacity: 1 }, initial: { y: 12, opacity: 0 } }}
                transition={{ ease: [0.21, 0.47, 0.32, 0.98], delay: 0.1, duration: 0.4 }}
                className="flex flex-row gap-1 justify-start items-end"
              >
                <span className="text-4xl font-bold leading-7">${isAnnual ? t('professional.yearlyPrice') : t('professional.monthlyPrice')}</span>
                <span className="text-xs mb-1">/{isAnnual ? 'year' : 'month'}</span>
              </motion.div>
              <Button 
                className="group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-2"
                variant="outline"
                onClick={() => handlePlanClick("professional")}
              >
                {getButtonText("professional")}
              </Button>
              <Separator className="my-4" />
              <FeatureList features={t.raw('professional.features') as string[]} />
            </CardContent>
          </Card>

          <Card className="relative max-w-[300px] overflow-hidden rounded-2xl shadow-lg border border-primary">
            <PricingTierLabel currentPlan={currentPlan} tierName="scale" />
            <CardContent className="flex flex-col gap-8 p-4">
              <div className="flex flex-col pl-4">
                <h2 className="text-base font-semibold leading-7">{t('scale.name')}</h2>
                <p className="h-12 text-sm leading-5 flex justify-center justify-items-center place-content-center origin-center bg-center place-self-center">
                  {t('scale.description')}
                </p>
              </div>
              <motion.div
                animate="animate"
                initial="initial"
                variants={{ animate: { y: 0, opacity: 1 }, initial: { y: 12, opacity: 0 } }}
                transition={{ ease: [0.21, 0.47, 0.32, 0.98], delay: 0.1, duration: 0.4 }}
                className="flex flex-row gap-1 justify-start items-end"
              >
                <span className="text-4xl font-bold leading-7">${isAnnual ? t('scale.yearlyPrice') : t('scale.monthlyPrice')}</span>
                <span className="text-xs mb-1">/{isAnnual ? 'year' : 'month'}</span>
              </motion.div>
              <Button
                className="group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-2"
                onClick={() => handlePlanClick("scale")}
              >
                {getButtonText("scale")}
              </Button>
              <Separator className="my-4" />
              <FeatureList features={t.raw('scale.features') as string[]} />
            </CardContent>
          </Card>

          <Card className="relative max-w-[300px] overflow-hidden rounded-2xl shadow-lg border">
            <PricingTierLabel currentPlan={currentPlan} tierName="enterprise" />
            <CardContent className="flex flex-col gap-8 p-4">
              <div className="flex flex-col pl-4">
                <h2 className="text-base font-semibold leading-7">{t('enterprise.name')}</h2>
                <p className="h-12 text-sm leading-5 flex justify-center justify-items-center place-content-center origin-center bg-center place-self-center">
                  {t('enterprise.description')}
                </p>
              </div>
              <motion.div
                animate="animate"
                initial="initial"
                variants={{ animate: { y: 0, opacity: 1 }, initial: { y: 12, opacity: 0 } }}
                transition={{ ease: [0.21, 0.47, 0.32, 0.98], delay: 0.1, duration: 0.4 }}
                className="flex flex-row gap-1 justify-start items-end"
              >
                <span className="text-4xl font-bold leading-7">${isAnnual ? t('enterprise.yearlyPrice') : t('enterprise.monthlyPrice')}</span>
                <span className="text-xs mb-1">/{isAnnual ? 'year' : 'month'}</span>
              </motion.div>
              <Button
                className="group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-2"
                variant="outline"
                onClick={() => handlePlanClick("enterprise")}
              >
                {getButtonText("enterprise")}
              </Button>
              <Separator className="my-4" />
              <FeatureList features={t.raw('enterprise.features') as string[]} />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
