'use client';

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MessageSquareText, 
  Bell,
  FileEdit,
  FileText
} from "lucide-react";
import { GridPattern } from "@/components/ui/animated-grid-pattern";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  features: string[];
}

const FeatureCard = ({ icon, title, features }: FeatureCardProps) => (
  <Card className="relative overflow-hidden bg-black/10 backdrop-blur-sm border border-white/10 h-full">
    <div className="absolute inset-0 -z-10">
      <GridPattern 
        duration={25000}
        className="opacity-30"
      />
    </div>
    <CardContent className="p-6 flex flex-col h-full">
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <ul className="space-y-2 mt-auto">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <span className="text-primary mr-2 text-lg">•</span>
            <span className="text-muted-foreground text-sm">{feature}</span>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

export function FeaturesAndBenefits() {
  const features = [
    {
      icon: <MessageSquareText className="h-6 w-6 text-primary" />,
      title: "Amazing human-like AI to answer your phone",
      features: [
        "Natural, human-like conversation",
        "Smart responses to customer inquiries",
        "Professional representation of your business"
      ]
    },
    {
      icon: <Bell className="h-6 w-6 text-primary" />,
      title: "Get notified right away",
      features: [
        "Instant email notifications",
        "SMS text alerts for new calls",
        "Quick decision making for follow-ups"
      ]
    },
    {
      icon: <FileEdit className="h-6 w-6 text-primary" />,
      title: "Custom message taking",
      features: [
        "Collect information specific to your business",
        "Capture essential customer details",
        "Structured message format for easy review"
      ]
    },
    {
      icon: <FileText className="h-6 w-6 text-primary" />,
      title: "Recordings, transcripts, call management",
      features: [
        "Full call recordings saved",
        "Complete conversation transcripts",
        "Organized call management in your inbox"
      ]
    }
  ];
  
  return (
    <section className="w-full py-12 md:py-24 bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
            The power of the latest AI tech, working for you 24/7
          </h2>
          <p className="max-w-[85%] md:max-w-[65%] text-muted-foreground text-lg md:text-xl">
            Powerful features that make Flowon the perfect answering service for your business
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              features={feature.features}
            />
          ))}
        </div>
      </div>
    </section>
  );
} 