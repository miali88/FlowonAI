'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useState } from 'react';

export const SetupSection = () => {
  const steps = [
    {
      number: "1",
      title: "Import your data",
      description: "Our platform provides many ways to connect your data.",
    },
    {
      number: "2",
      title: "Specify how the agent should behave",
      description: "Help the agent learn how it should interact with visitors",
    },
    {
      number: "3",
      title: "Deploy your AI Agent",
      description: "Choose how to best serve your AI assistant for maximum impact.",
    },
  ];

  const [openItem, setOpenItem] = useState<string | undefined>(undefined);

  return (
    <section className="py-24 w-full">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="text-4xl font-bold mb-12 text-white text-center">How it works</h2>
        <div className="mx-auto max-w-3xl">
          <Accordion type="single" value={openItem}>
            {steps.map((step) => (
              <AccordionItem 
                key={step.number} 
                value={step.number}
                onMouseEnter={() => setOpenItem(step.number)}
                onMouseLeave={() => setOpenItem(undefined)}
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex gap-6 items-center">
                    <span className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full 
                      bg-[#000000b3] border border-[rgba(255,255,255,0.18)]
                      backdrop-blur-[5px] text-white font-medium">
                      {step.number}
                    </span>
                    <span className="text-2xl font-semibold text-white hover:underline">{step.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-lg text-white/70 ml-16">{step.description}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};