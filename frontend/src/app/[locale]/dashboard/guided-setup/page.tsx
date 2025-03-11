"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SetupStep } from "../../../../app/dashboard/guided-setup/types";
import QuickSetup from "../../../../app/dashboard/guided-setup/components/QuickSetup";
import TalkToFlowon from "../../../../app/dashboard/guided-setup/components/TalkToFlowon";
import Launch from "../../../../app/dashboard/guided-setup/components/Launch";
import { Loader2 } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const steps: { id: SetupStep; label: string }[] = [
  { id: "quick-setup", label: "Quick Set-up" },
  { id: "talk-to-rosie", label: "Talk to Flowon" },
  { id: "launch", label: "Launch" },
];

export default function GuidedSetupPage() {
  const [currentStep, setCurrentStep] = useState<SetupStep>("quick-setup");
  const [isLoading, setIsLoading] = useState(true);
  const { userId, getToken } = useAuth();

  useEffect(() => {
    async function checkSetupStatus() {
      try {
        setIsLoading(true);

        // Get the authentication token from Clerk
        const token = await getToken();
        if (!token) {
          console.error("No authentication token available");
          throw new Error("Authentication required");
        }

        const response = await fetch(
          `${API_BASE_URL}/guided_setup/setup_status`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch setup status");
        }

        const data = await response.json();

        if (data.success) {
          console.log(
            "Setup status:",
            data.isComplete ? "completed" : "not completed"
          );

          // If setup is already completed, skip to last step
          if (data.isComplete) {
            setCurrentStep("launch");
          }
        }
      } catch (error) {
        console.error("Error checking setup status:", error);
      } finally {
        setIsLoading(false);
      }
    }

    checkSetupStatus();
  }, [userId, getToken]);

  const handleNext = () => {
    const currentIndex = steps.findIndex((step) => step.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <p className="text-gray-500">Loading setup status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[900px] mx-auto">
      {/* Step Tabs */}
      <div className="flex justify-center items-center gap-2 mb-8">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isPast = steps.findIndex((s) => s.id === currentStep) > index;

          return (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => setCurrentStep(step.id)}
                className={cn(
                  "flex items-center px-6 py-3 rounded-lg transition-all relative",
                  isActive
                    ? "bg-blue-500 text-white shadow-lg scale-105"
                    : isPast
                    ? "bg-gray-200 text-gray-700"
                    : "bg-gray-100 text-gray-500",
                  "hover:bg-opacity-90"
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-full mr-2",
                    isActive
                      ? "bg-white text-black"
                      : isPast
                      ? "bg-gray-700 text-white"
                      : "bg-gray-300 text-gray-600"
                  )}
                >
                  {index + 1}
                </span>
                {step.label}
                {isActive && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 rounded-full" />
                )}
              </button>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-[2px] w-8 mx-2",
                    isPast ? "bg-gray-700" : "bg-gray-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <Card className="p-6">
        {currentStep === "quick-setup" && <QuickSetup onNext={handleNext} />}
        {currentStep === "talk-to-rosie" && (
          <TalkToFlowon onNext={handleNext} />
        )}
        {currentStep === "launch" && <Launch onNext={handleNext} />}
      </Card>
    </div>
  );
} 