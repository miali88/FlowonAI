"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import BlobAnimation from "@/app/onboarding/components/BlobAnimation";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { memo } from "react";

// Import pricing config from the existing pricing component
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
      'Multilingual agent'
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
      'Multilingual agent',
      'Custom workflows',
      'Custom integrations'
    ],
    popular: true
  },
  growth: {
    name: 'Growth',
    description: 'The ultimate plan with all features for industry leaders',
    monthlyPrice: 'Contact Us',
    yearlyPrice: 'Contact Us',
    features: [
      'Unlimited minutes',
      'Message taking with custom questions',
      'Smart spam detection',
      'Multilingual agent',
      'Appointment Links',
      'Call Transfers',
      'Live Transfers',
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

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>("professional");
  const [isAnnual, setIsAnnual] = useState(false);
  const router = useRouter();
  
  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };
  
  const handleContinueToSetup = () => {
    // Store selected plan in localStorage
    localStorage.setItem('flowonAI_selectedPlan', selectedPlan);
    
    // Navigate to the final setup
    router.push("/dashboard/guided-setup");
  };
  
  return (
    <div className="flex min-h-screen">
      {/* Main Content */}
      <div className="w-full p-10 flex flex-col justify-center">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold tracking-tight mb-3">Choose Your Plan</h1>
            <div className="mt-8 text-center text-sm text-gray-500">
              <p>All plans come with a 14-day free trial, with 20 minutes free. No credit card required.</p>
              <p className="mt-2">Need help choosing? Contact our sales team at support@flowon.ai</p>
            </div>
          </div>
          
          {/* Billing toggle */}
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
          
          {/* Pricing cards */}
          <div className="mx-auto grid w-full justify-center sm:grid-cols-2 lg:grid-cols-3 flex-col gap-4 place-items-center">
            {/* Professional Plan */}
            <Card className={`relative max-w-[300px] overflow-hidden rounded-2xl shadow-lg border ${
              selectedPlan === 'professional' ? 'ring-2 ring-primary' : ''
            }`}>
              <CardContent className="flex flex-col gap-8 p-4">
                <div className="flex flex-col pl-4">
                  <h2 className="text-base font-semibold leading-7">{PRICING_CONFIG.professional.name}</h2>
                  <p className="h-12 text-sm leading-5 flex justify-center justify-items-center place-content-center origin-center bg-center place-self-center">
                    {PRICING_CONFIG.professional.description}
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
                  onClick={() => handleSelectPlan("professional")}
                >
                  <span>{selectedPlan === "professional" ? "Start 14 day free trial" : "Select Plan"}</span>
                  <span className="absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12 transform-gpu opacity-10 transition-all duration-1000 ease-out group-hover:-translate-x-96 bg-black">
                    Select
                  </span>
                </Button>
                <Separator className="m-0 h-px w-full border-none bg-gradient-to-r from-neutral-200/0 via-neutral-500/30 to-neutral-200/0" />
                <FeatureList features={PRICING_CONFIG.professional.features} />
              </CardContent>
            </Card>

            {/* Scale Plan */}
            <Card className={`relative max-w-[300px] overflow-hidden rounded-2xl shadow-lg border ${
              selectedPlan === 'scale' ? 'ring-2 ring-primary' : ''
            } ${PRICING_CONFIG.scale.popular ? 'bg-primary/5 border-primary' : ''}`}>
              {PRICING_CONFIG.scale.popular && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              <CardContent className="flex flex-col gap-8 p-4 pt-12">
                <div className="flex flex-col pl-4">
                  <h2 className="text-base font-semibold leading-7">{PRICING_CONFIG.scale.name}</h2>
                  <p className="h-12 text-sm leading-5 flex justify-center justify-items-center place-content-center origin-center bg-center place-self-center">
                    {PRICING_CONFIG.scale.description}
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
                  onClick={() => handleSelectPlan("scale")}
                >
                  <span>{selectedPlan === "scale" ? "Start 14 day free trial" : "Select Plan"}</span>
                  <span className="absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12 transform-gpu opacity-10 transition-all duration-1000 ease-out group-hover:-translate-x-96 bg-black">
                    Select
                  </span>
                </Button>
                <Separator className="m-0 h-px w-full border-none bg-gradient-to-r from-neutral-200/0 via-neutral-500/30 to-neutral-200/0" />
                <FeatureList features={PRICING_CONFIG.scale.features} />
              </CardContent>
            </Card>

            {/* Growth Plan */}
            <Card className={`relative max-w-[300px] overflow-hidden rounded-2xl shadow-lg border ${
              selectedPlan === 'growth' ? 'ring-2 ring-primary' : ''
            }`}>
              <CardContent className="flex flex-col gap-8 p-4">
                <div className="flex flex-col pl-4">
                  <h2 className="text-base font-semibold leading-7">{PRICING_CONFIG.growth.name}</h2>
                  <p className="h-12 text-sm leading-5 flex justify-center justify-items-center place-content-center origin-center bg-center place-self-center">
                    {PRICING_CONFIG.growth.description}
                  </p>
                </div>
                <motion.div
                  animate="animate"
                  initial="initial"
                  variants={{ animate: { y: 0, opacity: 1 }, initial: { y: 12, opacity: 0 } }}
                  transition={{ ease: [0.21, 0.47, 0.32, 0.98], delay: 0.25, duration: 0.4 }}
                  className="flex flex-row gap-1 justify-start items-end"
                >
                  {((isAnnual ? PRICING_CONFIG.growth.yearlyPrice : PRICING_CONFIG.growth.monthlyPrice) === 'Contact Us') ? (
                    <span className="text-4xl font-bold leading-7">Contact Us</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold leading-7">${isAnnual ? PRICING_CONFIG.growth.yearlyPrice : PRICING_CONFIG.growth.monthlyPrice}</span>
                      <span className="text-xs mb-1">/{isAnnual ? 'year' : 'month'}</span>
                    </>
                  )}
                </motion.div>
                <Button 
                  className="group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-2"
                  onClick={() => handleSelectPlan("growth")}
                >
                  <span>{selectedPlan === "growth" ? "Start 14 day free trial" : "Select Plan"}</span>
                  <span className="absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12 transform-gpu opacity-10 transition-all duration-1000 ease-out group-hover:-translate-x-96 bg-black">
                    Select
                  </span>
                </Button>
                <Separator className="m-0 h-px w-full border-none bg-gradient-to-r from-neutral-200/0 via-neutral-500/30 to-neutral-200/0" />
                <FeatureList features={PRICING_CONFIG.growth.features} />
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-center mt-12">
            <Button 
              onClick={handleContinueToSetup} 
              className="px-8 py-6 bg-primary hover:bg-primary/90 text-lg"
              disabled={!selectedPlan}
            >
              Continue with {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Background animation */}
      <div className="fixed inset-0 -z-10 opacity-5">
        <BlobAnimation />
      </div>
    </div>
  );
} 