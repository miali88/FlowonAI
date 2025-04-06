"use client";

import { SignUp } from "@clerk/nextjs";
import { useEffect } from "react";
import { toast } from "sonner";

export default function Page() {
  // When component mounts, mark that signup is in progress so dashboard can handle setup
  useEffect(() => {
    try {
      // Get stored plan data
      const selectedPlan = localStorage.getItem('flowonAI_selectedPlan');
      const billingInterval = localStorage.getItem('flowonAI_billingInterval');
      
      if (selectedPlan) {
        // Flag that we have pending setup data to process after login
        localStorage.setItem('flowonAI_pendingSetup', 'true');
        console.log("[Setup] Marked pending setup for post-login processing:", { 
          selectedPlan, 
          billingInterval: billingInterval || 'monthly' 
        });
      }
    } catch (error) {
      console.error('[Setup] Error setting up pending flag:', error);
    }
  }, []);

  return (
    <div className="relative min-h-screen">
      <div className="absolute top-4 left-4">
        {/* <Image src="/assets/waves.webp" alt="Logo" width={100} height={100} /> */}
      </div>
      <div className="flex justify-center items-center min-h-screen">
        <SignUp 
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
        />
      </div>
    </div>
  );
}