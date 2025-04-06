"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLoading from "./loading";
import PendingSetupHandler from "./components/PendingSetupHandler";

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [redirecting, setRedirecting] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);

  // Handle setup completion
  const handleSetupComplete = () => {
    console.log("[Dashboard] Setup process completed, marking as complete");
    setSetupComplete(true);
  };

  // Handle dashboard redirection only after setup is complete
  useEffect(() => {
    // Check if we're on the main dashboard page and not already redirecting
    const shouldRedirect = pathname === "/dashboard" && !redirecting;
    
    // Check if there's no pending setup or if setup is complete
    const setupFinished = !localStorage.getItem('flowonAI_pendingSetup') || setupComplete;
    
    if (shouldRedirect && setupFinished) {
      console.log("[Dashboard] Setup finished, redirecting to guided-setup");
      setRedirecting(true);
      // Use replace instead of push to avoid adding to history stack
      router.replace("/dashboard/guided-setup");
    }
  }, [pathname, redirecting, router, setupComplete]);

  // Show a loading indicator while redirecting
  if (redirecting) {
    return (
      <>
        <DashboardLoading isLoading={true} />
      </>
    );
  }

  return (
    <>
      <PendingSetupHandler onSetupComplete={handleSetupComplete} />
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to Flowon AI!</h1>
          <p className="text-gray-500 mb-8">Setting up your account...</p>
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    </>
  );
}
