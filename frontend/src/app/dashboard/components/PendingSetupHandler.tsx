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
  const [verificationAttempts, setVerificationAttempts] = useState(0);

  // Function to verify trial setup is complete by fetching trial status
  const verifyTrialSetup = async (token: string, maxRetries = 5, delay = 2000): Promise<boolean> => {
    try {
      console.log("[SetupHandler] Verifying trial setup...");
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        // Get trial status from backend - use the correct user endpoint
        const statusResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/check_trial_status`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          console.log(`[SetupHandler] Trial status check (attempt ${attempt}):`, statusData);
          
          // Check if we have proper trial data (is_trial could be true/false but we need it to be returned)
          if (statusData && 'is_trial' in statusData) {
            console.log("[SetupHandler] Trial status verified successfully!");
            return true;
          }
        }
        
        console.log(`[SetupHandler] Trial not ready yet (attempt ${attempt}/${maxRetries}), waiting ${delay}ms...`);
        // Wait before trying again
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Increase delay for exponential backoff
        delay = Math.min(delay * 1.5, 8000);
      }
      
      console.warn("[SetupHandler] Could not verify trial setup after multiple attempts");
      return false;
    } catch (error) {
      console.error("[SetupHandler] Error verifying trial setup:", error);
      return false;
    }
  };

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
            
            let trialSetupSuccessful = false;
            
            if (!trialResponse.ok) {
              const trialError = await trialResponse.json().catch(() => ({}));
              console.error('[SetupHandler] Failed to set trial plan:', trialError);
              toast.error('Failed to set up trial. Please contact support.');
              // We still continue since the basic setup was successful
            } else {
              const trialData = await trialResponse.json();
              console.log("[SetupHandler] Trial plan set successfully:", trialData);
              trialSetupSuccessful = true;
            }
            
            // Clear the setup data from localStorage
            localStorage.removeItem('flowonAI_selectedPlan');
            localStorage.removeItem('flowonAI_billingInterval');
            localStorage.removeItem('flowonAI_pendingSetup');
            
            // Add a significant delay to ensure database operations complete
            console.log("[SetupHandler] Waiting for backend processing...");
            toast.info('Setting up your trial plan...', { duration: 3000 });
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // If trial setup was successful, verify it's correctly set up
            if (trialSetupSuccessful) {
              console.log("[SetupHandler] Verifying trial data availability...");
              // Verify that trial data is fully available before proceeding
              const isVerified = await verifyTrialSetup(token);
              
              if (isVerified) {
                console.log("[SetupHandler] Trial data verified and ready!");
                toast.success('Setup completed successfully with trial!');
              } else {
                console.warn("[SetupHandler] Trial setup could not be verified");
                toast.info('Account setup complete! Your trial will be activated shortly.', { duration: 5000 });
                
                // Even though verification failed, we'll set a flag in localStorage to try again later
                localStorage.setItem('flowonAI_trialPendingVerification', 'true');
              }
            }
            
            // Notify parent component that setup is complete regardless of verification
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