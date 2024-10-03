import React from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import ShineBorder from "@/components/ui/shine-border";
import { AnimatedBeamMultipleOutputDemo } from "./animated-beam-multiple-inputs";
import Meteors from "@/components/ui/meteors";
import { BoxRevealDemo } from "./BoxReveal";
// Add this import
import GradualSpacing from "@/components/ui/gradual-spacing";
import BlurIn from "@/components/ui/blur-in";

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
        <div className="relative">
          <div className="absolute top-12 left-0 right-0 z-10">
            <BlurIn
              word={
                <>
                  Act with data, have more meaningful conversations.
                  <br />
                  Your specialised agent will always be in sync with business expectation
                </>
              }
              className="text-lg sm:text-xl md:text-2xl font-semibold text-white text-center mb-32" // Added mb-32 here
            />
          </div>
          <AnimatedBeamMultipleOutputDemo />
        </div>
      </CardContent>
    </Card>
  );
};

export default Welcome;
