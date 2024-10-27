"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import React from "react";

export function Pricing() {
  // Add state for annual toggle
  const [isAnnual, setIsAnnual] = React.useState(false);

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
            audience, creating customer loyalty, and driving sales.
          </p>
        </div>
        <div className="flex w-full items-center justify-center space-x-2 mx-2 my-6">
          <Switch id="interval" onCheckedChange={(checked) => setIsAnnual(checked)} />
          <span>Annual</span>
          <span className="inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase leading-5 tracking-wide bg-foreground text-background">
            Get 7 months free ✨
          </span>
        </div>
        <div className="mx-auto grid w-full justify-center sm:grid-cols-2 lg:grid-cols-4 flex-col gap-4">
          <Card className="relative max-w-[300px] overflow-hidden rounded-2xl shadow-lg border">
            <CardContent className="flex flex-col gap-8 p-4">
              <div className="flex flex-col pl-4">
                <h2 className="text-base font-semibold leading-7">Taster</h2>
                <p className="h-12 text-sm leading-5 flex justify-center justify-items-center place-content-center origin-center bg-center place-self-center">
                  A basic plan for startups and individual users
                </p>
              </div>
              <motion.div
                animate="animate"
                initial="initial"
                variants={{ animate: { y: 0, opacity: 1 }, initial: { y: 12, opacity: 0 } }}
                transition={{ ease: [0.21, 0.47, 0.32, 0.98], delay: 0.1, duration: 0.4 }}
                className="flex flex-row gap-1 justify-start items-end"
              >
                <span className="text-4xl font-bold leading-7">£0</span>
                <span className="text-xs mb-1">/month</span>
              </motion.div>
              <Button className="group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-2">
                <span>Ready</span>
                <span className="absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12 transform-gpu opacity-10 transition-all duration-1000 ease-out group-hover:-translate-x-96 bg-black">
                  Subscribe
                </span>
              </Button>
              <Separator className="m-0 h-px w-full border-none bg-gradient-to-r from-neutral-200/0 via-neutral-500/30 to-neutral-200/0" />
              <ul className="flex flex-col gap-2 font-normal">
                <li className="flex items-center gap-3 text-xs font-medium">
                  <Check
                    size={16}
                    className="flex items-center gap-3 text-xs font-medium size-5 rounded-full bg-green-400 p-1"
                  />
                  <span className="flex">AI-powered analytics</span>
                </li>
                <li className="flex items-center gap-3 text-xs font-medium">
                  <Check
                    size={16}
                    className="flex items-center gap-3 text-xs font-medium size-5 rounded-full bg-green-400 p-1"
                  />
                  <span className="flex">Basic support</span>
                </li>
                <li className="flex items-center gap-3 text-xs font-medium">
                  <Check
                    size={16}
                    className="flex items-center gap-3 text-xs font-medium size-5 rounded-full bg-green-400 p-1"
                  />
                  <span className="flex">1 hour of conversation</span>
                </li>
                <li className="flex items-center gap-3 text-xs font-medium">
                  <Check
                    size={16}
                    className="flex items-center gap-3 text-xs font-medium size-5 rounded-full bg-green-400 p-1"
                  />
                  <span className="flex">All agent features</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card className="relative max-w-[300px] overflow-hidden rounded-2xl shadow-lg border">
            <CardContent className="flex flex-col gap-8 p-4">
              <div className="flex flex-col pl-4">
                <h2 className="text-base font-semibold leading-7">Startup</h2>
                <p className="h-12 text-sm leading-5 flex justify-center justify-items-center place-content-center origin-center bg-center place-self-center">
                  A basic plan for startups and indsividual users
                </p>
              </div>
              <motion.div
                animate="animate"
                initial="initial"
                variants={{ animate: { y: 0, opacity: 1 }, initial: { y: 12, opacity: 0 } }}
                transition={{ ease: [0.21, 0.47, 0.32, 0.98], delay: 0.1, duration: 0.4 }}
                className="flex flex-row gap-1 justify-start items-end"
              >
                <span className="text-4xl font-bold leading-7">£{isAnnual ? '465.60' : '97'}</span>
                <span className="text-xs mb-1">/{isAnnual ? 'year' : 'month'}</span>
              </motion.div>
              <Button className="group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-2">
                <span>Ready</span>
                <span className="absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12 transform-gpu opacity-10 transition-all duration-1000 ease-out group-hover:-translate-x-96 bg-black">
                  Subscribe
                </span>
              </Button>
              <Separator className="m-0 h-px w-full border-none bg-gradient-to-r from-neutral-200/0 via-neutral-500/30 to-neutral-200/0" />
              <ul className="flex flex-col gap-2 font-normal">
                <li className="flex items-center gap-3 text-xs font-medium">
                  <Check
                    size={16}
                    className="flex items-center gap-3 text-xs font-medium size-5 rounded-full bg-green-400 p-1"
                  />
                  <span className="flex">10 hours of conversation</span>
                </li>
                <li className="flex items-center gap-3 text-xs font-medium">
                  <Check
                    size={16}
                    className="flex items-center gap-3 text-xs font-medium size-5 rounded-full bg-green-400 p-1"
                  />
                  <span className="flex">All integrations</span>
                </li>
                <li className="flex items-center gap-3 text-xs font-medium">
                  <Check
                    size={16}
                    className="flex items-center gap-3 text-xs font-medium size-5 rounded-full bg-green-400 p-1"
                  />
                  <span className="flex">Consultation to tune AI</span>
                </li>
                <li className="flex items-center gap-3 text-xs font-medium">
                  <Check
                    size={16}
                    className="flex items-center gap-3 text-xs font-medium size-5 rounded-full bg-green-400 p-1"
                  />
                  <span className="flex">Unlimited knowledge base size</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card className="relative max-w-[300px] overflow-hidden rounded-2xl shadow-lg border">
            <CardContent className="flex flex-col gap-8 p-4">
              <div className="flex flex-col pl-4">
                <h2 className="text-base font-semibold leading-7">Enterprise</h2>
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
                <span className="text-4xl font-bold leading-7" />
                <span className="text-xs mb-1" />
              </motion.div>
              <Button className="group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-2">
                <span>Start Partnership</span>
                <span className="absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12 transform-gpu opacity-10 transition-all duration-1000 ease-out group-hover:-translate-x-96 bg-black">
                  Subscribe
                </span>
              </Button>
              <Separator className="m-0 h-px w-full border-none bg-gradient-to-r from-neutral-200/0 via-neutral-500/30 to-neutral-200/0" />
              <ul className="flex flex-col gap-2 font-normal">
                <li className="flex items-center gap-3 text-xs font-medium">
                  <Check
                    size={16}
                    className="flex items-center gap-3 text-xs font-medium size-5 rounded-full bg-green-400 p-1"
                  />
                  <span className="flex">Unlimited minutes</span>
                </li>
                <li className="flex items-center gap-3 text-xs font-medium">
                  <Check
                    size={16}
                    className="flex items-center gap-3 text-xs font-medium size-5 rounded-full bg-green-400 p-1"
                  />
                  <span className="flex">White-glove support</span>
                </li>
                <li className="flex items-center gap-3 text-xs font-medium">
                  <Check
                    size={16}
                    className="flex items-center gap-3 text-xs font-medium size-5 rounded-full bg-green-400 p-1"
                  />
                  <span className="flex">Unlimited projects</span>
                </li>
                <li className="flex items-center gap-3 text-xs font-medium">
                  <Check
                    size={16}
                    className="flex items-center gap-3 text-xs font-medium size-5 rounded-full bg-green-400 p-1"
                  />
                  <span className="flex">Priority access to new AI tools</span>
                </li>
                <li className="flex items-center gap-3 text-xs font-medium">
                  <Check
                    size={16}
                    className="flex items-center gap-3 text-xs font-medium size-5 rounded-full bg-green-400 p-1"
                  />
                  <span className="flex">Custom integrations</span>
                </li>
                <li className="flex items-center gap-3 text-xs font-medium">
                  <Check
                    size={16}
                    className="flex items-center gap-3 text-xs font-medium size-5 rounded-full bg-green-400 p-1"
                  />
                  <span className="flex">Highest data security and compliance</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
