'use client'

import React from 'react';
import { Button } from '@/components/ui/button';

const CTA: React.FC = () => {
  return (
    <section className="bg-zinc-900/50 backdrop-blur-xl border-y border-zinc-800 py-20">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-white mb-8">
          Ready to Transform Your Onboarding?
        </h2>
        <Button size="lg" className="bg-white hover:bg-gray-200 text-black font-semibold">
          Get Started Now
        </Button>
      </div>
    </section>
  );
};

export default CTA;
