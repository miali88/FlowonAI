"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function Pricing() {
  return (
    <section className="mx-auto flex max-w-screen-xl flex-col gap-8 px-4 py-14 md:px-8">
      <div className="mx-auto max-w-screen-xl px-4 md:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <h4 className="text-xl font-bold tracking-tight">Pricing</h4>
          <h2 className="text-5xl font-bold tracking-tight sm:text-6xl font-heading">
            Simple pricing for everyone.
          </h2>
          <p className="mt-6 text-xl leading-8">
            Choose an affordable plan that&apos;s packed with the best features for engaging your
            audience, creating customer loyalty, and driving sales.
          </p>
        </div>
        <div className="flex w-full items-center justify-center space-x-2 mx-2 my-6">
          <Switch id="interval" />
          <span>Annual</span>
          <span className="inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase leading-5 tracking-wide bg-foreground text-background">
            2 MONTHS FREE ✨
          </span>
        </div>
        <div className="mx-auto grid w-full justify-center sm:grid-cols-2 lg:grid-cols-4 flex-col gap-4">
          <Card className="relative max-w-[300px] overflow-hidden rounded-2xl shadow-lg border">
            <CardContent className="flex flex-col gap-8 p-4">
              <div className="flex flex-col pl-4">
                <h2 className="text-base font-semibold leading-7">Basic</h2>
                <p className="h-12 text-sm leading-5">
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
                <span className="text-4xl font-bold leading-7">$10</span>
                <span className="text-xs mb-1">/month</span>
              </motion.div>
              <Button className="group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-2">
                <span>Subscribe</span>
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
                  <span className="flex">5 projects limit</span>
                </li>
                <li className="flex items-center gap-3 text-xs font-medium">
                  <Check
                    size={16}
                    className="flex items-center gap-3 text-xs font-medium size-5 rounded-full bg-green-400 p-1"
                  />
                  <span className="flex">Access to basic AI tools</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card className="relative max-w-[300px] overflow-hidden rounded-2xl shadow-lg border-2 border-accent">
            <CardContent className="flex flex-col gap-8 p-4">
              <div className="flex flex-col pl-4">
                <h2 className="text-base font-semibold leading-7">Premium</h2>
                <p className="h-12 text-sm leading-5">A premium plan for growing businesses</p>
              </div>
              <motion.div
                animate="animate"
                initial="initial"
                variants={{ animate: { y: 0, opacity: 1 }, initial: { y: 12, opacity: 0 } }}
                transition={{
                  ease: [0.21, 0.47, 0.32, 0.98],
                  delay: 0.15000000000000002,
                  duration: 0.4,
                }}
                className="flex flex-row gap-1 justify-start items-end"
              >
                <span className="text-4xl font-bold leading-7">$20</span>
                <span className="text-xs mb-1">/month</span>
              </motion.div>
              <Button className="group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-2">
                <span>Subscribe</span>
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
                  <span className="flex">Advanced AI insights</span>
                </li>
                <li className="flex items-center gap-3 text-xs font-medium">
                  <Check
                    size={16}
                    className="flex items-center gap-3 text-xs font-medium size-5 rounded-full bg-green-400 p-1"
                  />
                  <span className="flex">Priority support</span>
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
                  <span className="flex">Access to all AI tools</span>
                </li>
                <li className="flex items-center gap-3 text-xs font-medium">
                  <Check
                    size={16}
                    className="flex items-center gap-3 text-xs font-medium size-5 rounded-full bg-green-400 p-1"
                  />
                  <span className="flex">Custom integrations</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card className="relative max-w-[300px] overflow-hidden rounded-2xl shadow-lg border">
            <CardContent className="flex flex-col gap-8 p-4">
              <div className="flex flex-col pl-4">
                <h2 className="text-base font-semibold leading-7">Enterprise</h2>
                <p className="h-12 text-sm leading-5">
                  An enterprise plan with advanced features for large organizations
                </p>
              </div>
              <motion.div
                animate="animate"
                initial="initial"
                variants={{ animate: { y: 0, opacity: 1 }, initial: { y: 12, opacity: 0 } }}
                transition={{ ease: [0.21, 0.47, 0.32, 0.98], delay: 0.2, duration: 0.4 }}
                className="flex flex-row gap-1 justify-start items-end"
              >
                <span className="text-4xl font-bold leading-7">$50</span>
                <span className="text-xs mb-1">/month</span>
              </motion.div>
              <Button className="group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-2">
                <span>Subscribe</span>
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
                  <span className="flex">Custom AI solutions</span>
                </li>
                <li className="flex items-center gap-3 text-xs font-medium">
                  <Check
                    size={16}
                    className="flex items-center gap-3 text-xs font-medium size-5 rounded-full bg-green-400 p-1"
                  />
                  <span className="flex">24/7 dedicated support</span>
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
                  <span className="flex">Access to all AI tools</span>
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
                  <span className="flex">Data security and compliance</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card className="relative max-w-[300px] overflow-hidden rounded-2xl shadow-lg border">
            <CardContent className="flex flex-col gap-8 p-4">
              <div className="flex flex-col pl-4">
                <h2 className="text-base font-semibold leading-7">Ultimate</h2>
                <p className="h-12 text-sm leading-5">
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
                <span className="text-4xl font-bold leading-7">$80</span>
                <span className="text-xs mb-1">/month</span>
              </motion.div>
              <Button className="group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-2">
                <span>Subscribe</span>
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
                  <span className="flex">Bespoke AI development</span>
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
