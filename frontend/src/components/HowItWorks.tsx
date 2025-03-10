'use client';

import React from "react";
import { Timeline } from "@/components/ui/timeline";
import { Settings, PhoneCall, CheckSquare, MessageSquare } from "lucide-react";
import Image from 'next/image';
import { useTranslations } from 'next-intl';

// Define the timeline data structure
interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export function HowItWorks() {
  const t = useTranslations('howItWorks');
  
  // Create timeline data
  const timelineData: TimelineEntry[] = [
    {
      title: t('step1.title'),
      content: (
        <div className="bg-black/10 backdrop-filter backdrop-blur-sm border border-white/10 rounded-xl p-4 mb-10">
          <div className="flex items-center mb-2">
            <Settings className="h-6 w-6 mr-2 text-blue-500" />
            <h3 className="text-lg font-semibold">Step 1: {t('step1.title')}</h3>
          </div>
          <p className="text-muted-foreground">
            {t('step1.description')}
          </p>
        </div>
      ),
    },
    {
      title: t('step2.title'),
      content: (
        <div className="bg-black/10 backdrop-filter backdrop-blur-sm border border-white/10 rounded-xl p-4 mb-10">
          <div className="flex items-center mb-2">
            <PhoneCall className="h-6 w-6 mr-2 text-blue-500" />
            <h3 className="text-lg font-semibold">Step 2: {t('step2.title')}</h3>
          </div>
          <p className="text-muted-foreground">
            {t('step2.description')}
          </p>
        </div>
      ),
    },
    {
      title: t('step3.title'),
      content: (
        <div className="bg-black/10 backdrop-filter backdrop-blur-sm border border-white/10 rounded-xl p-4 mb-10">
          <div className="flex items-center mb-2">
            <CheckSquare className="h-6 w-6 mr-2 text-blue-500" />
            <h3 className="text-lg font-semibold">Step 3: {t('step3.title')}</h3>
          </div>
          <p className="text-muted-foreground">
            {t('step3.description')}
          </p>
        </div>
      ),
    },
    {
      title: t('step4.title'),
      content: (
        <div className="bg-black/10 backdrop-filter backdrop-blur-sm border border-white/10 rounded-xl p-4 mb-10">
          <div className="flex items-center mb-2">
            <MessageSquare className="h-6 w-6 mr-2 text-blue-500" />
            <h3 className="text-lg font-semibold">Step 4: {t('step4.title')}</h3>
          </div>
          <p className="text-muted-foreground">
            {t('step4.description')}
          </p>
        </div>
      ),
    },
  ];

  return (
    <section className="w-full py-12 md:py-24 bg-gradient-to-b from-background/50 to-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
            {t('sectionTitle')}
          </h2>
          <p className="max-w-[85%] md:max-w-[65%] text-muted-foreground text-lg md:text-xl">
            Powerful, yet super easy to set up and get started in minutes.
          </p>
        </div>

        {/* Display the preview on small screens only */}
        <div className="lg:hidden mb-10">
          <div className="bg-black/10 backdrop-filter backdrop-blur-sm border border-white/10 rounded-xl p-4 mx-auto max-w-md shadow-lg">
            <div className="aspect-video relative overflow-hidden rounded-lg">
              <div className="absolute inset-0 flex flex-col bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-lg">
                <div className="flex items-center justify-between p-2 bg-black/40">
                  <div className="flex space-x-1.5">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-xs text-white/70">Flowon Setup Wizard</div>
                  <div></div>
                </div>
                <div className="flex flex-1 p-4">
                  <div className="bg-white/10 rounded-lg p-4 w-full flex flex-col">
                    <div className="flex mb-4">
                      <div className="w-1/4 pr-4 border-r border-white/10">
                        <div className="text-xs text-white/70 mb-2">Step 1</div>
                        <div className="h-10 bg-green-500/20 rounded mb-2 flex items-center justify-center text-xs text-green-300">Business Info</div>
                        <div className="h-4 bg-white/20 rounded w-3/4"></div>
                      </div>
                      <div className="w-1/4 px-4 border-r border-white/10">
                        <div className="text-xs text-white/70 mb-2">Step 2</div>
                        <div className="h-10 bg-blue-500/30 rounded border border-blue-500/50 flex items-center justify-center text-xs">Customize</div>
                        <div className="h-4 bg-white/20 rounded w-2/3"></div>
                      </div>
                      <div className="w-1/4 px-4 border-r border-white/10">
                        <div className="text-xs text-white/70 mb-2">Step 3</div>
                        <div className="h-10 bg-white/20 rounded mb-2"></div>
                        <div className="h-4 bg-white/20 rounded w-1/2"></div>
                      </div>
                      <div className="w-1/4 pl-4">
                        <div className="text-xs text-white/70 mb-2">Step 4</div>
                        <div className="h-10 bg-white/20 rounded mb-2"></div>
                        <div className="h-4 bg-white/20 rounded w-1/2"></div>
                      </div>
                    </div>

                    <div className="border border-white/10 rounded-lg bg-white/5 p-4 mt-auto">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium">Business Questions</div>
                        <div className="text-xs text-blue-400">Customizing...</div>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="h-8 rounded bg-white/10 flex items-center px-3 text-xs">What information do you need from callers?</div>
                        <div className="h-8 rounded bg-white/10 flex items-center px-3 text-xs">
                          <span className="mr-2">☑️</span> Customer Name
                        </div>
                        <div className="h-8 rounded bg-white/10 flex items-center px-3 text-xs">
                          <span className="mr-2">☑️</span> Phone Number
                        </div>
                        <div className="h-8 rounded bg-white/10 flex items-center px-3 text-xs">
                          <span className="mr-2">☑️</span> Reason for calling
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline section - now full-width and centered */}
        <div className="w-full max-w-5xl mx-auto">
          <Timeline data={timelineData} />
        </div>

      </div>
    </section>
  );
} 