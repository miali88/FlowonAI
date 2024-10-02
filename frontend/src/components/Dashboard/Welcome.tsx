import React from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import ShineBorder from "@/components/ui/shine-border";
import { AnimatedBeamMultipleOutputDemo } from "./animated-beam-multiple-outputs";
import Meteors from "@/components/ui/meteors";
import { BoxRevealDemo } from "./BoxReveal";
// Add this import
import GradualSpacing from "@/components/ui/gradual-spacing";

const Welcome: React.FC = () => {
  return (
    <Card className="w-full border-0">
      <CardHeader className="p-0">
        <ShineBorder
          className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-background md:shadow-xl"
          color={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
        >
          <Meteors number={30} />
          <GradualSpacing
            className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-6xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10"
            text="Let Customers Speak Life Into Your Business"
          />
        </ShineBorder>
      </CardHeader>

      
      <CardContent>
        {/* Add BoxRevealDemo here */}
        <BoxRevealDemo />
        <AnimatedBeamMultipleOutputDemo />
      </CardContent>
    </Card>
  );
};

export default Welcome;
