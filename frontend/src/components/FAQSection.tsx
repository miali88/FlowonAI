'use client'

import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const FAQSection = () => {
  const faqs = [
    {
      question: "How quickly can Flowon AI be integrated with our phone system?",
      answer: "Integration with Twilio can be completed within minutes. Our streamlined setup process ensures you can start handling calls automatically with minimal technical overhead."
    },
    {
      question: "What types of conversations can Flowon AI handle?",
      answer: "Flowon AI can handle a wide range of interactions including customer inquiries, appointment scheduling, lead qualification, support requests, and general information sharing. The AI adapts to your specific business needs and can be trained on your unique use cases."
    },
    {
      question: "How does Flowon AI maintain conversation quality?",
      answer: "Flowon AI uses advanced natural language processing to understand context, maintain conversation flow, and provide relevant responses. The system continuously learns from interactions to improve accuracy and effectiveness."
    },
    {
      question: "Can Flowon AI integrate with our existing business tools?",
      answer: "Yes, Flowon AI can integrate with your CRM, scheduling systems, and other business tools to ensure seamless data flow and process automation across your organization."
    },
    {
      question: "What happens if Flowon AI can't handle a specific request?",
      answer: "Flowon AI is designed to gracefully handle edge cases by either escalating to human agents when needed or collecting relevant information to ensure proper follow-up. This ensures no customer inquiry goes unaddressed."
    },
    {
      question: "How does Flowon AI handle multiple concurrent calls?",
      answer: "Flowon AI can handle unlimited concurrent conversations without any degradation in performance or response time, ensuring consistent service quality regardless of call volume."
    }
  ];

  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-300 text-xl">
            Everything you need to know about Flowon AI
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/50 backdrop-blur-sm px-6"
            >
              <AccordionTrigger className="text-lg font-medium text-white hover:text-white hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-300">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-300 mb-4">
            Still have questions?
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Contact our team
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQSection; 