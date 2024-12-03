'use client'

import React from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'

const FAQ: React.FC = () => {
  return (
    <section className="py-20">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-white mb-12">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="item-1" className="border-zinc-800">
            <AccordionTrigger className="text-white">How long does implementation take?</AccordionTrigger>
            <AccordionContent className="text-gray-300">
              Our platform can be integrated within hours, with most customers going live within a day.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="border-zinc-800">
            <AccordionTrigger className="text-white">Can I customize the conversation flow?</AccordionTrigger>
            <AccordionContent className="text-gray-300">
              Absolutely! Our platform is fully customizable to match your brand and requirements.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="border-zinc-800">
            <AccordionTrigger className="text-white">What kind of support do you offer?</AccordionTrigger>
            <AccordionContent className="text-gray-300">
              We provide 24/7 technical support and dedicated customer success managers for enterprise plans.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
