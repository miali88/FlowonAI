"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { memo, useState, useCallback } from "react";

import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import React from "react";

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
    description: 'For growing businesses with moderate call volume',
    monthlyPrice: '99',
    yearlyPrice: '990',
    features: [
      'Up to 500 minutes',
      'Then $0.25 per minute',
      'Message taking with custom questions',
      'Smart spam detection',
      'Bilingual agent - English + Spanish',
      'Appointment Links',
      'Call Transfers'
    ],
    popular: true
  },
  growth: {
    name: 'Growth',
    description: 'The ultimate plan with all features for industry leaders',
    monthlyPrice: '199',
    yearlyPrice: '1990',
    features: [
      'Up to 1000 minutes',
      'Then $0.25 per minute',
      'Message taking with custom questions',
      'Smart spam detection',
      'Bilingual agent - English + Spanish',
      'Appointment Links',
      'Call Transfers',
      'Live Transfers (Coming Soon)',
      'Training Files',
      'Custom Agent Training'
    ]
  }
};
  
// Memoized check icon component
const FeatureCheck = memo(function FeatureCheck() {
  return (
    <Check
      size={16}
      className="flex items-center gap-3 text-xs font-medium size-5 rounded-full bg-green-400 p-1"
    />
  );
});

// Memoized feature list component
const FeatureList = memo(function FeatureList({ features }: { features: string[] }) {
  return (
    <ul className="flex flex-col gap-2 font-normal">
      {features.map((feature) => (
        <li key={feature} className="flex items-center gap-3 text-xs font-medium">
          <FeatureCheck />
          <span className="flex">{feature}</span>
        </li>
      ))}
    </ul>
  );
});

export function Pricing({ currentPlan }: PricingProps) {
  const [isAnnual, setIsAnnual] = useState(false);
  
  // Memoize handlers
  const handlePlanClick = useCallback((planName: string) => {
    if (currentPlan?.toLowerCase() === planName.toLowerCase()) return;
    window.location.href = "/sign-up";
  }, [currentPlan]);

  const getButtonText = useCallback((planName: string) => {
    if (currentPlan?.toLowerCase() === planName.toLowerCase()) return "Manage Plan";
    return planName.toLowerCase() === "growth" ? "Subscribe" : "Subscribe";
  }, [currentPlan]);

  return (
    <section className="mx-auto flex max-w-screen-xl flex-col gap-8 px-4 py-14 md:px-8">
      <div className="mx-auto max-w-screen-xl px-4 md:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <h4 className="text-xl font-bold tracking-tight">Pricing</h4>
          {/* <h2 className="text-5xl font-bold tracking-tight sm:text-6xl font-heading">
            Bring Extreme Efficiency To Your Business.
          </h2> */}
          <p className="mt-6 text-xl leading-8">
            Packed with the best features for engaging your
            audience, creating customer loyalty, and automating workflows.
          </p>
        </div>
        <div className="flex w-full items-center justify-center space-x-2 mx-2 my-6">
          <Switch 
            id="interval" 
            checked={isAnnual}
            onCheckedChange={(checked) => setIsAnnual(checked)}
          />
          <span>Annual</span>
          <span className="inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase leading-5 tracking-wide bg-foreground text-background">
            Get 2 months free ✨
          </span>
        </div>
        <div className="mx-auto grid w-full justify-center sm:grid-cols-2 lg:grid-cols-3 flex-col gap-4 place-items-center">
          <Card className="relative max-w-[300px] overflow-hidden rounded-2xl shadow-lg border">
            <CardContent className="flex flex-col gap-8 p-4">
              <div className="flex flex-col pl-4">
                <h2 className="text-base font-semibold leading-7">Professional</h2>
                <p className="h-12 text-sm leading-5 flex justify-center justify-items-center place-content-center origin-center bg-center place-self-center">
                  Perfect for small businesses starting with automation
                </p>
              </div>
              <motion.div
                animate="animate"
                initial="initial"
                variants={{ animate: { y: 0, opacity: 1 }, initial: { y: 12, opacity: 0 } }}
                transition={{ ease: [0.21, 0.47, 0.32, 0.98], delay: 0.1, duration: 0.4 }}
                className="flex flex-row gap-1 justify-start items-end"
              >
                <span className="text-4xl font-bold leading-7">${isAnnual ? PRICING_CONFIG.professional.yearlyPrice : PRICING_CONFIG.professional.monthlyPrice}</span>
                <span className="text-xs mb-1">/{isAnnual ? 'year' : 'month'}</span>
              </motion.div>
              <Button 
                className="group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-2"
                onClick={() => handlePlanClick("professional")}
              >
                <span>{getButtonText("professional")}</span>
                <span className="absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12 transform-gpu opacity-10 transition-all duration-1000 ease-out group-hover:-translate-x-96 bg-black">
                  Subscribe
                </span>
              </Button>
              <Separator className="m-0 h-px w-full border-none bg-gradient-to-r from-neutral-200/0 via-neutral-500/30 to-neutral-200/0" />
              <FeatureList features={PRICING_CONFIG.professional.features} />
            </CardContent>
          </Card>
          <Card className="relative max-w-[300px] overflow-hidden rounded-2xl shadow-lg border bg-primary/5 border-primary">
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
              Most Popular
            </div>
            <CardContent className="flex flex-col gap-8 p-4 pt-12">
              <div className="flex flex-col pl-4">
                <h2 className="text-base font-semibold leading-7">Scale</h2>
                <p className="h-12 text-sm leading-5 flex justify-center justify-items-center place-content-center origin-center bg-center place-self-center">
                  For growing businesses with moderate call volume
                </p>
              </div>
              <motion.div
                animate="animate"
                initial="initial"
                variants={{ animate: { y: 0, opacity: 1 }, initial: { y: 12, opacity: 0 } }}
                transition={{ ease: [0.21, 0.47, 0.32, 0.98], delay: 0.1, duration: 0.4 }}
                className="flex flex-row gap-1 justify-start items-end"
              >
                <span className="text-4xl font-bold leading-7">${isAnnual ? PRICING_CONFIG.scale.yearlyPrice : PRICING_CONFIG.scale.monthlyPrice}</span>
                <span className="text-xs mb-1">/{isAnnual ? 'year' : 'month'}</span>
              </motion.div>
              <Button 
                className="group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-2"
                onClick={() => handlePlanClick("scale")}
              >
                <span>{getButtonText("scale")}</span>
                <span className="absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12 transform-gpu opacity-10 transition-all duration-1000 ease-out group-hover:-translate-x-96 bg-black">
                  Subscribe
                </span>
              </Button>
              <Separator className="m-0 h-px w-full border-none bg-gradient-to-r from-neutral-200/0 via-neutral-500/30 to-neutral-200/0" />
              <FeatureList features={PRICING_CONFIG.scale.features} />
            </CardContent>
          </Card>
          <Card className="relative max-w-[300px] overflow-hidden rounded-2xl shadow-lg border">
            <CardContent className="flex flex-col gap-8 p-4">
              <div className="flex flex-col pl-4">
                <h2 className="text-base font-semibold leading-7">Growth</h2>
                <p className="h-12 text-sm leading-5 flex justify-center justify-items-center place-content-center origin-center bg-center place-self-center">
                  The ultimate plan with all features for industry leaders
                </p>
              </div>
              <motion.div
                animate="animate"
                initial="initial"
                variants={{ animate: { y: 0, opacity: 1 }, initial: { y: 12, opacity: 0 } }}
                transition={{ ease: [0.21, 0.47, 0.32, 0.98], delay: 0.25, duration: 0.4 }}
                className="flex flex-row gap-1 justify-start items-end"
              >
                <span className="text-4xl font-bold leading-7">${isAnnual ? PRICING_CONFIG.growth.yearlyPrice : PRICING_CONFIG.growth.monthlyPrice}</span>
                <span className="text-xs mb-1">/{isAnnual ? 'year' : 'month'}</span>
              </motion.div>
              <Button 
                className="group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-2"
                onClick={() => handlePlanClick("growth")}
              >
                <span>{getButtonText("growth")}</span>
                <span className="absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12 transform-gpu opacity-10 transition-all duration-1000 ease-out group-hover:-translate-x-96 bg-black">
                  Subscribe
                </span>
              </Button>
              <Separator className="m-0 h-px w-full border-none bg-gradient-to-r from-neutral-200/0 via-neutral-500/30 to-neutral-200/0" />
              <FeatureList features={PRICING_CONFIG.growth.features} />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
