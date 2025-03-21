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
      question: "What types of conversations can Flowon AI handle?",
      answer: "Flowon AI can handle a wide range of interactions including customer inquiries, appointment scheduling, lead qualification, support requests, and general information sharing. The AI adapts to your specific business needs and can be trained on your unique use cases."
    },
    {
      question: "How does Flowon AI maintain conversation quality?",
      answer: "Flowon AI uses advanced natural language processing to understand context, maintain conversation flow, and provide relevant responses. The system continuously learns from interactions to improve accuracy and effectiveness."
    },
    {
      question: "What happens if Flowon AI can't handle a specific request?",
      answer: "The agent will gracefully handle edge cases by collecting relevant information to ensure proper follow-up. This ensures no customer inquiry goes unaddressed."
    },
    {
      question: "Can Flowon AI handle multiple concurrent calls?",
      answer: "Flowon can handle unlimited concurrent conversations without any degradation in performance or response time, ensuring consistent service quality regardless of call volume."
    },
    {
      question: "How do I receive customer information?",
      answer: "All call summaries will be available in the dashboard, and an email is sent after every call keeping you updated with the interaction details."
    },
    {
      question: "Can I customize what information is collected?",
      answer: "Yes! The message taking in the guided setup lets you easily list the kinds of information Flowon will ask during conversations."
    },
    {
      question: "Can you help us get set up?",
      answer: "We offer free consultation with every account sign up, helping you get the most out of Flowon and ensure a smooth onboarding process."
    }
  ];

  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-black mb-4">
            Frequently Asked Questions
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-gray-200 rounded-xl overflow-hidden px-6"
            >
              <AccordionTrigger className="text-lg font-medium text-black hover:text-black hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Still have questions?
          </p>
          <a
            href="https://cal.com/michael-ali-5fcg8p/30min"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Get in touch
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQSection; 