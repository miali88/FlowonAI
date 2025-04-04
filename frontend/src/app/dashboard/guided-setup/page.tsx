"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SetupStep } from "./types";
import QuickSetup from "./components/QuickSetup";
import TalkToFlowon from "./components/TalkToFlowon";
import Launch from "./components/Launch";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const steps: { id: SetupStep; label: string }[] = [
  { id: "quick-setup", label: "Quick Set-up" },
  { id: "talk-to-rosie", label: "Talk to Flowon" },
  { id: "launch", label: "Launch" },
];

export default function GuidedSetupPage() {
  const [currentStep, setCurrentStep] = useState<SetupStep>("quick-setup");
  const { userId, getToken } = useAuth();
  const [initialSetupChecked, setInitialSetupChecked] = useState(false);

  useEffect(() => {
    async function checkSetupStatus() {
      try {
        // Get the authentication token from Clerk
        const token = await getToken();
        if (!token) {
          console.error("No authentication token available");
          return;
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
          console.error("Failed to fetch setup status");
          return;
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
        setInitialSetupChecked(true);
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

  if (!initialSetupChecked) {
    return null; // Return nothing while checking initial setup status
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
      <div className="space-y-6">
        {currentStep === "quick-setup" && (
          <QuickSetup onNext={handleNext} key="quick-setup" />
        )}
        {currentStep === "talk-to-rosie" && (
          <Card className="p-6">
            <TalkToFlowon onNext={handleNext} key="talk-to-rosie" />
          </Card>
        )}
        {currentStep === "launch" && (
          <Card className="p-6">
            <Launch onNext={handleNext} key="launch" />
          </Card>
        )}
      </div>
    </div>
  );
}
