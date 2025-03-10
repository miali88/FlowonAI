'use client';

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MessageSquareText, 
  Bell, 
  Building2 
} from "lucide-react";
import { useTranslations } from 'next-intl';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  itemOne: string;
  itemTwo: string;
  itemThree: string;
}

const FeatureCard = ({ icon, title, itemOne, itemTwo, itemThree }: FeatureCardProps) => (
  <Card className="relative overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 group hover:border-primary/50 transition-all duration-300">
    <div className="absolute -inset-px bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500">
    </div>
    <div className="absolute top-0 left-0 right-0 h-[7rem] bg-gradient-to-br from-primary/30 via-primary/10 to-transparent opacity-30 group-hover:opacity-50 transition-all duration-300">
      <div 
        className="absolute inset-0 bg-grid-white/5 opacity-30"
        style={{ maskImage: 'linear-gradient(to bottom, white, transparent)' }}
      />
    </div>
    <CardContent className="p-6 flex flex-col h-full">
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <ul className="space-y-2 mt-auto">
        <li className="flex items-start">
          <span className="text-primary mr-2 text-lg">•</span>
          <span className="text-muted-foreground text-sm">{itemOne}</span>
        </li>
        <li className="flex items-start">
          <span className="text-primary mr-2 text-lg">•</span>
          <span className="text-muted-foreground text-sm">{itemTwo}</span>
        </li>
        <li className="flex items-start">
          <span className="text-primary mr-2 text-lg">•</span>
          <span className="text-muted-foreground text-sm">{itemThree}</span>
        </li>
      </ul>
    </CardContent>
  </Card>
);

export function FeaturesAndBenefits() {
  const t = useTranslations('featuresAndBenefits');
  
  return (
    <section className="w-full py-12 md:py-24 bg-gradient-to-b from-background/50 to-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
            {t('sectionTitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <FeatureCard 
            icon={<MessageSquareText className="h-6 w-6 text-primary" />}
            title={t('feature1.title')}
            itemOne={t('feature1.item1')}
            itemTwo={t('feature1.item2')}
            itemThree={t('feature1.item3')}
          />
          <FeatureCard 
            icon={<Bell className="h-6 w-6 text-primary" />}
            title={t('feature2.title')}
            itemOne={t('feature2.item1')}
            itemTwo={t('feature2.item2')}
            itemThree={t('feature2.item3')}
          />
          <FeatureCard 
            icon={<Building2 className="h-6 w-6 text-primary" />}
            title={t('feature3.title')}
            itemOne={t('feature3.item1')}
            itemTwo={t('feature3.item2')}
            itemThree={t('feature3.item3')}
          />
        </div>
      </div>
    </section>
  );
} 