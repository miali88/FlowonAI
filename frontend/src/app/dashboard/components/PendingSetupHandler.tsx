"use client";

import { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

interface SetupDataPayload {
  trainingSources: {
    useWebsite: boolean;
    urls: string[];
    uploadedFiles: any[];
  };
  businessInformation: {
    businessName: string;
    businessDescription: string;
    businessAddress: string;
    businessPhone: string;
    businessWebsite: string;
    businessHours: Record<string, any>;
    hasBusinessHours: boolean;
  };
  messageTaking: {
    enabled: boolean;
    callToAction: string;
  };
  callNotifications: {
    smsNotifications: {
      enabled: boolean;
      phone: string;
    };
    emailNotifications: {
      enabled: boolean;
      email: string;
    };
  };
  agentLanguage: string;
  plan_type?: string;
  billing_interval?: string;
  setup_completed?: boolean;
  setup_step?: string;
}

interface TrialPlanRequest {
  trial_plan_type: string;
}

interface PendingSetupHandlerProps {
  onSetupComplete?: () => void;
}

export default function PendingSetupHandler({ onSetupComplete }: PendingSetupHandlerProps) {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [isProcessingSetup, setIsProcessingSetup] = useState(false);

  // Process any pending setup data from signup
  useEffect(() => {
    const checkAndProcessPendingSetup = async () => {
      // Only proceed if user is loaded and authenticated
      if (!isLoaded || !user) return;

      try {
        // Check if we have pending setup data from signup
        const hasPendingSetup = localStorage.getItem('flowonAI_pendingSetup') === 'true';
        
        if (hasPendingSetup) {
          console.log("[SetupHandler] Found pending setup data to process");
          setIsProcessingSetup(true);
          
          // Get stored plan data
          const selectedPlan = localStorage.getItem('flowonAI_selectedPlan');
          const billingInterval = localStorage.getItem('flowonAI_billingInterval');
          
          // Get any stored onboarding data
          const setupDataString = localStorage.getItem('flowonAI_setupData');
          const businessInfoString = localStorage.getItem('flowonAI_businessInfo');
          
          if (selectedPlan) {
            console.log("[SetupHandler] Processing plan data:", { 
              selectedPlan, 
              billingInterval: billingInterval || 'monthly',
              userId: user.id
            });
            
            // Get the auth token now that we're properly authenticated
            const token = await getToken();
            if (!token) {
              throw new Error("Authentication token not available");
            }
            
            // Create a base setup data object with required fields
            let setupData: SetupDataPayload = {
              trainingSources: {
                useWebsite: true,
                urls: [],
                uploadedFiles: []
              },
              businessInformation: {
                businessName: user.fullName || "My Business",
                businessDescription: "",
                businessAddress: "",
                businessPhone: "",
                businessWebsite: "",
                businessHours: {},
                hasBusinessHours: false
              },
              messageTaking: {
                enabled: true,
                callToAction: "default"
              },
              callNotifications: {
                smsNotifications: {
                  enabled: false,
                  phone: ""
                },
                emailNotifications: {
                  enabled: true,
                  email: user.primaryEmailAddress?.emailAddress || ""
                }
              },
              agentLanguage: "en-US"
            };
            
            // Merge with stored setup data if available
            if (setupDataString) {
              try {
                const parsedSetupData = JSON.parse(setupDataString);
                setupData = { ...setupData, ...parsedSetupData };
              } catch (err) {
                console.error("[SetupHandler] Error parsing stored setup data:", err);
              }
            } else if (businessInfoString) {
              // Try to use the business info if setup data isn't available
              try {
                const businessInfo = JSON.parse(businessInfoString);
                // Map relevant fields
                if (businessInfo.businessName) setupData.businessInformation.businessName = businessInfo.businessName;
                if (businessInfo.businessDescription) setupData.businessInformation.businessDescription = businessInfo.businessDescription;
                if (businessInfo.businessAddress) setupData.businessInformation.businessAddress = businessInfo.businessAddress;
                if (businessInfo.businessPhone) setupData.businessInformation.businessPhone = businessInfo.businessPhone;
                if (businessInfo.businessWebsite) setupData.businessInformation.businessWebsite = businessInfo.businessWebsite;
              } catch (err) {
                console.error("[SetupHandler] Error parsing business info:", err);
              }
            }
            
            // Add plan information to the setup data
            setupData.plan_type = selectedPlan;
            setupData.billing_interval = billingInterval || 'monthly';
            setupData.setup_completed = true;
            setupData.setup_step = "COMPLETED";
            
            // Send basic setup data to backend
            console.log("[SetupHandler] Sending quick setup data to backend...");
            const setupResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/guided_setup/quick_setup`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(setupData)
            });

            if (!setupResponse.ok) {
              const errorData = await setupResponse.json().catch(() => ({}));
              console.error('[SetupHandler] Failed to store setup data:', errorData);
              toast.error('Failed to complete setup. Please try again.');
              setIsProcessingSetup(false);
              return; // Exit early if setup failed
            }
            
            console.log("[SetupHandler] Setup data saved successfully");
            
            // Now, set up the trial plan separately using the correct endpoint
            // This ensures the trial is properly recorded in the database
            console.log(`[SetupHandler] Setting up trial plan for: ${selectedPlan}`);
            
            const trialRequest: TrialPlanRequest = {
              trial_plan_type: selectedPlan
            };
            
            const trialResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/guided_setup/set_trial_plan`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(trialRequest)
            });
            
            if (!trialResponse.ok) {
              const trialError = await trialResponse.json().catch(() => ({}));
              console.error('[SetupHandler] Failed to set trial plan:', trialError);
              toast.error('Failed to set up trial. Please contact support.');
              // We still continue since the basic setup was successful
            } else {
              const trialData = await trialResponse.json();
              console.log("[SetupHandler] Trial plan set successfully:", trialData);
              toast.success('Setup completed successfully with trial!');
            }
            
            // Clear the setup data from localStorage regardless
            localStorage.removeItem('flowonAI_selectedPlan');
            localStorage.removeItem('flowonAI_billingInterval');
            localStorage.removeItem('flowonAI_pendingSetup');
            
            // Small delay to ensure all database operations are complete
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Notify parent component that setup is complete
            if (onSetupComplete) {
              console.log("[SetupHandler] Setup process complete, notifying parent");
              onSetupComplete();
            }
          }
        }
        
        setIsProcessingSetup(false);
      } catch (error) {
        console.error('[SetupHandler] Error processing pending setup:', error);
        setIsProcessingSetup(false);
      }
    };
    
    checkAndProcessPendingSetup();
  }, [isLoaded, user, getToken, onSetupComplete]);

  return (
    <div className={isProcessingSetup ? "block" : "hidden"}>
      {isProcessingSetup && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="rounded-md bg-background p-4 shadow-lg">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              <p className="text-sm text-center">Setting up your account and trial plan...</p>
              <p className="text-xs text-muted-foreground">Please wait, this will take just a moment.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 