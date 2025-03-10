'use client';

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  PhoneOff, 
  DollarSign, 
  Clock,
} from "lucide-react";
import { SparklesCore } from "@/components/ui/sparkles";
import { useTranslations } from 'next-intl';

interface PainPointCardProps {
  icon: React.ReactNode;
  title: string;
  problem: string;
  solution: string;
}

const PainPointCard = ({ icon, title, problem, solution }: PainPointCardProps) => (
  <Card className="relative overflow-hidden bg-black/10 backdrop-blur-sm border border-white/10 h-full">
    <CardContent className="p-6 flex flex-col h-full space-y-4">
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      
      <div className="space-y-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <h4 className="text-sm font-medium text-red-400 mb-2">Problem:</h4>
          <p className="text-sm text-muted-foreground">{problem}</p>
        </div>
        
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-400 mb-2">Solution:</h4>
          <p className="text-sm text-muted-foreground">{solution}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export function PainPointsSolutions() {
  const t = useTranslations('painPoints');
  
  const painPoints = [
    {
      icon: <PhoneOff className="h-5 w-5 text-primary" />,
      title: t('missedOpportunities.title'),
      problem: t('missedOpportunities.problem'),
      solution: t('missedOpportunities.solution')
    },
    {
      icon: <DollarSign className="h-5 w-5 text-primary" />,
      title: t('expensiveServices.title'),
      problem: t('expensiveServices.problem'),
      solution: t('expensiveServices.solution')
    },
    {
      icon: <Clock className="h-5 w-5 text-primary" />,
      title: t('noVoicemail.title'),
      problem: t('noVoicemail.problem'),
      solution: t('noVoicemail.solution')
    }
  ];
  
  return (
    <section className="w-full py-12 md:py-24 bg-gradient-to-b from-background/90 to-background relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <SparklesCore
          id="bg-sparkles"
          className="absolute inset-0 h-full w-full opacity-20"
          background="transparent"
          minSize={0.6}
          maxSize={1.2}
          particleDensity={20}
          speed={0.01}
          particleColor="#FFFFFF"
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
            {t('sectionTitle')}
          </h2>
          <p className="max-w-[85%] md:max-w-[65%] text-muted-foreground text-lg md:text-xl">
            {t('sectionSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {painPoints.map((point, index) => (
            <PainPointCard 
              key={index}
              icon={point.icon}
              title={point.title}
              problem={point.problem}
              solution={point.solution}
            />
          ))}
        </div>
      </div>
    </section>
  );
} 