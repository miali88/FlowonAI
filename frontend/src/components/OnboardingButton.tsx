'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function OnboardingButton() {
  return (
    <div className="flex items-center justify-center relative z-10">
      <Link 
        href="/onboarding" 
        className="inline-block relative z-20"
      >
        <Button 
          className="translate-y-[-1rem] animate-fade-in gap-1 rounded-lg opacity-0 ease-in-out [--animation-delay:600ms] text-lg px-6 py-6 hover:bg-primary/90 cursor-pointer"
          type="button"
        >
          <span>Build Your AI Agent</span>
          <ArrowRight
            size={20}
            className="ml-1 size-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1"
          />
        </Button>
      </Link>
    </div>
  );
}