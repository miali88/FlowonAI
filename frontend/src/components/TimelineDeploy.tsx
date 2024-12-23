import Image from "next/image";
import React from "react";
import { Timeline } from "@/components/ui/timeline";
import { QandA } from "@/components/QandA";
import { Clock, Brain, Zap, Bot, Shield, Database } from 'lucide-react';
import { LeadsMarquee } from "@/components/LeadsMarquee";
import { DeploySection } from "@/components/deploy";
import OrbitingCirclesDemo from "@/components/StayInSync";
import ComparisonSection from "@/components/Compare";

const BenefitItem = ({ icon: Icon, text }) => (
  <div className="flex gap-3 items-center text-neutral-700 dark:text-neutral-300 text-sm md:text-base py-2">
    <div className="text-emerald-600 dark:text-emerald-400">
      <Icon size={20} />
    </div>
    <span>{text}</span>
  </div>
);

export function TimelineDeploy() {
  const data = [
    {
      title: "Import Data",
      content: (
        <div>
          <OrbitingCirclesDemo />
        </div>
      ),
    },
    {
      title: "Suggest Agent Behaviour",
      content: (
        <div>
        <ComparisonSection />
        </div>
      ),
    },
    {
      title: "Deploy Your New Agent",
      content: (
        <div>
          <DeploySection />

        </div>
      ),
    },
    {
      title: "Enjoy The Results",
      content: (
        <div>
          <h3 className="text-neutral-800 dark:text-neutral-200 text-base md:text-lg font-medium mb-4">
            Experience these key benefits with your new AI agent
          </h3>
          <div className="mb-8">
            <BenefitItem
              icon={Clock}
              text="Save hours by eliminating app-switching and manual data lookup"
            />
            <BenefitItem
              icon={Brain}
              text="Reduce cognitive load by automating repetitive tasks and information gathering"
            />
            <BenefitItem
              icon={Zap}
              text="Instant data access and actions across all your connected applications"
            />
            <BenefitItem
              icon={Bot}
              text="Automate workflows like email sending, appointment booking, and meeting transcription"
            />
            <BenefitItem
              icon={Shield}
              text="Secure and controlled access to your business apps and data"
            />
            <BenefitItem
              icon={Database}
              text="Unified interface to query and act on data from multiple sources"
            />
          </div>
          <div className="w-full">
            <LeadsMarquee />
          </div>
          <QandA />
        </div>
      ),
    },
  ];
  return (
    <div className="w-full">
      <Timeline data={data} />
    </div>
  );
}
