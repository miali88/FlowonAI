'use client';

import { FC, useState } from 'react';

interface StepProps {
  number: string;
  title: string;
  description: string;
  isOpen: boolean;
  onToggle: () => void;
}

const Step: FC<StepProps> = ({ number, title, description, isOpen, onToggle }) => {
  return (
    <div className="border-b border-gray-200/10 py-6">
      <button 
        onClick={onToggle}
        className="w-full flex items-start gap-6 text-left"
      >
        <span className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full 
          bg-[#000000b3] border border-[rgba(255,255,255,0.18)]
          backdrop-blur-[5px] text-white font-medium">
          {number}
        </span>
        <div className="flex-1">
          <h3 className="text-2xl font-semibold text-white flex items-center gap-2">
            {title}
            <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
              ↓
            </span>
          </h3>
          {isOpen && (
            <p className="mt-2 text-lg text-white/70">{description}</p>
          )}
        </div>
      </button>
    </div>
  );
};

export const SetupSection = () => {
  const [openStep, setOpenStep] = useState(0); // First step open by default

  const steps = [
    {
      number: "1",
      title: "Import your data",
      description: "Our platform provides multi ways to connect your data to the agent. Upload files, or content from the web.",
    },
    {
      number: "2",
      title: "Specify how the agent should behave",
      description: "Help the agent learn how it should interact with visitors. For lead generation, specify the questions to ask and how to qualify.",
    },
    {
      number: "3",
      title: "Embed to your website",
      description: "Simply add a few lines of code to your website to start engaging with visitors through your AI agent.",
    },
  ];

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-12 text-white">How it works</h2>
        <div className="max-w-2xl">
          {steps.map((step, index) => (
            <Step 
              key={step.number} 
              {...step} 
              isOpen={openStep === index}
              onToggle={() => setOpenStep(openStep === index ? -1 : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};