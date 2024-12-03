'use client'

import React, { useState } from 'react';
import { 
  Stethoscope, 
  Scale, 
  Home, 
  Briefcase,
  MessageSquare,
  Globe
} from 'lucide-react';

const industries = {
  dental: {
    icon: <Stethoscope className="w-6 h-6 text-blue-400" />,
    title: "Dental Practice",
    jargon: ["Periodontal Treatment", "Dental Prophylaxis", "Endodontic Therapy"],
    example: "I understand you're experiencing tooth sensitivity. I can help schedule a comprehensive examination, and I'll note your concerns about previous root canal treatment. Would you prefer a morning or afternoon appointment?",
    benefits: ["Patient symptom screening", "Insurance verification", "Treatment plan coordination"]
  },
  accountancy: {
    icon: <Scale className="w-6 h-6 text-purple-400" />,
    title: "Accountancy Firms",
    jargon: ["R&D Tax Credits", "Capital Allowances", "Corporation Tax Returns"],
    example: "Based on your company structure and R&D activities, you might be eligible for tax relief. Let me arrange a consultation to discuss your innovation projects and potential claims.",
    benefits: ["Tax deadline management", "Document collection", "Compliance checks"]
  },
  mortgage: {
    icon: <Home className="w-6 h-6 text-green-400" />,
    title: "Mortgage Brokers",
    jargon: ["Fixed-Rate Terms", "LTV Ratios", "Agreement in Principle"],
    example: "With your income details and deposit amount, I can help identify suitable mortgage products. Would you like me to explain the differences between fixed and tracker rates for first-time buyers?",
    benefits: ["Initial eligibility checks", "Document checklists", "Rate comparisons"]
  },
  recruitment: {
    icon: <Briefcase className="w-6 h-6 text-yellow-400" />,
    title: "Tech Recruitment",
    jargon: ["Full-Stack Development", "Agile Methodology", "DevOps Practices"],
    example: "I see you're looking for senior React developers. I can help schedule candidate screenings and collect their portfolio links. What specific cloud experience are you requiring?",
    benefits: ["Candidate screening", "Interview scheduling", "Skill matching"]
  }
};

export const IndustrySection = () => {
  const [selectedIndustry, setSelectedIndustry] = useState('dental');

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Industry-Specific Communication
          </h2>
          <p className="text-gray-300 text-xl max-w-3xl mx-auto">
            Experience an AI that speaks your industry's language fluently
          </p>
        </div>

        {/* Industry Selector */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {Object.entries(industries).map(([key, industry]) => (
            <button
              key={key}
              onClick={() => setSelectedIndustry(key)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all
                ${selectedIndustry === key 
                  ? 'bg-white text-black' 
                  : 'bg-zinc-900/50 text-white hover:bg-zinc-800/50'}`}
            >
              {industry.icon}
              <span className="font-medium">{industry.title}</span>
            </button>
          ))}
        </div>

        {/* Selected Industry Display */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Conversation Example */}
          <div className="bg-zinc-900/50 backdrop-blur-xl rounded-xl p-8 border border-zinc-800">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-6 h-6 text-blue-400" />
              <h3 className="text-xl font-semibold text-white">
                Conversation Example
              </h3>
            </div>
            <div className="space-y-4">
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <p className="text-gray-300 italic">
                  {industries[selectedIndustry as keyof typeof industries].example}
                </p>
              </div>
              <div className="pt-4">
                <h4 className="text-white font-medium mb-2">Common Industry Terms:</h4>
                <div className="flex flex-wrap gap-2">
                  {industries[selectedIndustry as keyof typeof industries].jargon.map((term, index) => (
                    <span
                      key={index}
                      className="bg-zinc-800 text-gray-300 px-3 py-1 rounded-full text-sm"
                    >
                      {term}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Benefits */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-6 h-6 text-green-400" />
              <h3 className="text-xl font-semibold text-white">
                Industry-Specific Benefits
              </h3>
            </div>
            <ul className="space-y-4">
              {industries[selectedIndustry as keyof typeof industries].benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">{index + 1}</span>
                  </div>
                  <span className="text-gray-300">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Additional Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
            <h4 className="text-lg font-semibold text-white mb-3">
              Multilingual Support
            </h4>
            <p className="text-gray-400">
              Communicate in multiple languages while maintaining industry expertise
            </p>
          </div>
          <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
            <h4 className="text-lg font-semibold text-white mb-3">
              Customizable Responses
            </h4>
            <p className="text-gray-400">
              Tailor communication style to match your brand voice and terminology
            </p>
          </div>
          <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
            <h4 className="text-lg font-semibold text-white mb-3">
              Continuous Learning
            </h4>
            <p className="text-gray-400">
              Stays updated with industry trends and terminology
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IndustrySection; 