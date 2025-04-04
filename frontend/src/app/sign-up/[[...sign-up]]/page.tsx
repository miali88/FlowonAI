"use client";

import { SignUp } from "@clerk/nextjs";
import { useEffect } from "react";

export default function Page() {
  // This effect runs when the component mounts to check if we have onboarding data
  useEffect(() => {
    const handleOnboardingData = async () => {
      try {
        // Get stored plan data
        const selectedPlan = localStorage.getItem('flowonAI_selectedPlan');
        const billingInterval = localStorage.getItem('flowonAI_billingInterval');
        
        if (selectedPlan) {
          // Send to backend
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/guided_setup/quick_setup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              plan_type: selectedPlan,
              billing_interval: billingInterval || 'monthly'
            })
          });

          if (!response.ok) {
            console.error('Failed to store initial plan data');
          }

          // Clear the localStorage after sending to backend
          localStorage.removeItem('flowonAI_selectedPlan');
          localStorage.removeItem('flowonAI_billingInterval');
        }
      } catch (error) {
        console.error('Error handling onboarding data:', error);
      }
    };

    handleOnboardingData();
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