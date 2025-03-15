/**
 * Utilities for handling setup data saving and loading
 */

import { OnboardingData, SetupData } from "@/types/businessSetup";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Save setup data to both the onboarding endpoint and setup_data endpoint
 * Ensures data consistency between the two systems
 * 
 * @param setupData The structured setup data to save
 * @param onboardingData The flat onboarding data (will be derived from setupData if not provided)
 * @param token Authentication token
 * @returns Object with success status and any response data
 */
export async function saveSetupDataToBackend(
  setupData: SetupData,
  token: string,
  onboardingData?: OnboardingData
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    console.log("Saving setup data to backend...");
    
    // If onboardingData is not provided, extract it from setupData
    const flatData: OnboardingData = onboardingData || {
      businessName: setupData.businessInformation.businessName,
      businessDescription: setupData.businessInformation.businessOverview,
      businessWebsite: setupData.trainingSources.businessWebsite,
      businessAddress: setupData.businessInformation.primaryBusinessAddress,
      businessPhone: setupData.businessInformation.primaryBusinessPhone,
      agentLanguage: "en-US", // Default
      countryCode: "US", // Default
      businessHours: setupData.businessInformation.businessHours, // Include business hours
    };
    
    // Log to verify business hours are included
    console.log("Onboarding data with business hours:", 
      flatData.businessHours ? "Yes (hours found)" : "No (missing hours)");
    
    
    // Save to the quick_setup endpoint
    const setupResponse = await fetch(`${API_BASE_URL}/guided_setup/quick_setup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(setupData)
    });
    
    if (!setupResponse.ok) {
      const errorData = await setupResponse.text();
      console.error("Error saving to quick_setup endpoint:", errorData);
      return {
        success: false,
        error: `Failed to save setup data: ${errorData}`
      };
    }
    
    const setupResponseData = await setupResponse.json();
    console.log("Successfully saved to both endpoints");
    
    // Update localStorage
    localStorage.setItem('flowonAI_setupData', JSON.stringify(setupData));
    localStorage.setItem('flowonAI_businessInfo', JSON.stringify(flatData));
    
    return {
      success: true,
      data: setupResponseData
    };
    
  } catch (error) {
    console.error("Error saving setup data:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error saving setup data"
    };
  }
} 