"use client";

import { ReactNode, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";

// Define the onboarding steps and their paths
export const onboardingSteps = [
  { name: "Business Info", path: "/onboarding/business-info" },
  { name: "Audio Test", path: "/onboarding/audio-test" },
  { name: "Pricing", path: "/onboarding/pricing" }
];

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Determine the current step based on the pathname
    const stepIndex = onboardingSteps.findIndex(step => 
      pathname === step.path || pathname === step.path + "/"
    );
    
    if (stepIndex !== -1) {
      setCurrentStep(stepIndex);
    } else if (pathname === "/onboarding") {
      // Redirect from the base onboarding path to the first step
      router.push(onboardingSteps[0].path);
    }
  }, [pathname, router]);

  // Calculate progress percentage
  const progressPercentage = ((currentStep + 1) / onboardingSteps.length) * 100;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Simple footer */}
      <footer className="border-t border-gray-200 p-4 text-center text-sm text-gray-500">
        <div className="max-w-7xl mx-auto">
          © {new Date().getFullYear()} Flowon AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
} 