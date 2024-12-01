'use client';

import Image from "next/image";
import { MagicCard } from "@/components/ui/magic-card";

const featureDetails = {
  "Seamless Data Access": "Unified API interface for effortless data source integration and management.",
  "Bespoke Tool Use": "Customize your agents to execute workflow tasks, unlocking limitless automation possibilities",
  "Smart Analytics": "Advanced AI algorithms delivering powerful data insights and analysis.",
  "Custom Integrations": "Tailored integration solutions designed for your specific business needs.",
  "Real-time Insights": "Instant data monitoring and analysis for timely decision making.",
  "Information Retrieval": "Real-time Retrieval-Augmented Generation (RAG) for enhanced conversational AI and dynamic context-aware responses.",
};

export function FeaturesSection() {
  const FeatureCard = ({ title, description }: { title: string, description: string }) => (
    <MagicCard className="h-[220px] w-full">
      <div className="flex flex-col items-center justify-center h-full p-8">
        <h3 className="text-2xl font-bold text-center mb-4">
          {title}
        </h3>
        <p className="text-base text-muted-foreground text-center leading-relaxed max-w-[85%]">
          {description}
        </p>
      </div>
    </MagicCard>
  );

  return (
    <section className="container px-4 sm:px-6 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto w-[90%] sm:w-full">
        {Object.entries(featureDetails).map(([title, description]) => (
          <FeatureCard key={title} title={title} description={description} />
        ))}
      </div>
      <div className="flex justify-center mt-16">
        <Image
          alt="Integrations visualization"
          src="/images/integrations.png"
          width={1000}
          height={400}
          className="max-w-full h-auto"
          priority
        />
      </div>
    </section>
  );
}
