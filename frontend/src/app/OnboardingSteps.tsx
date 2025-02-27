"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Bell } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";

interface OnboardingStep {
  step: string;
  isCompleted: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function OnboardingSteps() {
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const { theme } = useTheme();
  const { userId, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    const fetchOnboardingStatus = async () => {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (userId) {
          headers["x-user-id"] = userId;
        }
        if (userId) {
          const response = await fetch(`${API_BASE_URL}/onboarding/`, {
            headers,
          });
          const data = await response.json();
          setSteps(data);
        }
      } catch (error) {
        console.error("Failed to fetch onboarding status:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchOnboardingStatus();
    }
  }, [isLoaded, userId]);

  if (loading) return null;

  // If all steps are completed, don't render anything
  if (steps.every((step) => step.isCompleted)) return null;

  // Calculate completion percentage
  const completedSteps = steps.filter((step) => step.isCompleted).length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  const stepTitles: { [key: string]: string } = {
    CREATE_AGENT: "Talk to the Agent Wizard",
    KNOWLEDGE_BASE_ADD: "Add data to the knowledge base",
    FIRST_AGENT_INTERACTION: "Make your first test call",
    INTEGRATE_FIRST_APP: "Set up integrations",
  };

  const stepDescriptions: { [key: string]: string } = {
    CREATE_AGENT: "Set up your first AI agent with our guided wizard",
    KNOWLEDGE_BASE_ADD:
      "Upload documents and train your agent with custom knowledge",
    FIRST_AGENT_INTERACTION: "Try out your agent with a sample conversation",
    INTEGRATE_FIRST_APP:
      "Connect your agent with your existing tools and platforms",
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 border-blue-600 right-10 z-50 rounded-full h-12 w-12 p-0 animate-in fade-in slide-in-from-right-10 duration-300"
        variant="outline"
      >
        <Bell className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-10 w-96 z-50 border shadow-lg dark:bg-white dark:text-black bg-zinc-950 text-white overflow-hidden animate-in fade-in slide-in-from-right-10 duration-300">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-200">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <CardHeader className="p-4">
        <CardTitle className="text-lg font-semibold flex justify-between items-center">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2">
              Getting Started
              <span className="text-sm font-normal">
                {completedSteps}/{totalSteps} completed
              </span>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              className="h-8 w-8 p-0"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="relative">
          {steps.map((step, index) => (
            <div key={step.step} className="flex items-start mb-4 relative">
              {/* Progress line */}
              {index < steps.length - 1 && (
                <div className="absolute left-[11px] top-[22px] w-[2px] h-[calc(100%-12px)] bg-gray-200">
                  <div
                    className="w-full bg-blue-500 transition-all duration-300"
                    style={{
                      height: `${step.isCompleted ? "100%" : "0%"}`,
                    }}
                  />
                </div>
              )}

              {/* Step circle */}
              <div
                className={`relative z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                  step.isCompleted
                    ? "bg-blue-500 border-blue-500 text-white"
                    : "border-gray-300 bg-white"
                }`}
              >
                {step.isCompleted && (
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>

              {/* Step content */}
              <div className="flex-1">
                <h3
                  className={`text-sm font-medium ${
                    step.isCompleted
                      ? "line-through text-gray-400"
                      : "text-inherit"
                  }`}
                >
                  {stepTitles[step.step]}
                </h3>
                <p
                  className={`text-xs ${
                    theme === "dark" ? "text-zinc-800" : "text-gray-500"
                  } mt-0.5`}
                >
                  {stepDescriptions[step.step]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
