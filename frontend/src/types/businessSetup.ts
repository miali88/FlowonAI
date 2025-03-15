/**
 * Shared interfaces for business setup data structures
 * Used across onboarding and guided setup to ensure consistency
 * 
 * DEVELOPER NOTES:
 * ----------------
 * 1. These interfaces serve as a single source of truth for data structures across the app
 * 2. When adding new fields to the setup data, update them here first, then in:
 *    - QuickSetup's schema.ts (add corresponding Zod validation)
 *    - The backend API's data models
 *    - Conversion functions (convertOnboardingToSetupData)
 *    - Component mappers in placeDataUtils.ts
 * 
 * 3. This shared structure ensures consistent data between:
 *    - Initial onboarding (business-info/page.tsx)
 *    - Guided setup in dashboard (QuickSetup.tsx)
 *    - Google Places data extraction
 *    - API calls
 *    - localStorage caching
 */

// Basic business hours structure
export interface BusinessHours {
  [day: string]: { open: string; close: string };
}

// Call notification settings
export interface CallNotifications {
  emailNotifications: {
    enabled: boolean;
    email: string;
  };
  smsNotifications: {
    enabled: boolean;
    phoneNumber: string;
  };
}

// Message taking preferences
export interface MessageTaking {
  callerName: {
    required: boolean;
    alwaysRequested: boolean;
  };
  callerPhoneNumber: {
    required: boolean;
    automaticallyCaptured: boolean;
  };
  specificQuestions: Array<{
    question: string;
    required: boolean;
  }>;
}

// Training sources for AI
export interface TrainingSources {
  googleBusinessProfile: string;
  businessWebsite: string;
}

// Core business information
export interface BusinessInformation {
  businessName: string;
  businessOverview: string;
  primaryBusinessAddress: string;
  primaryBusinessPhone: string;
  coreServices: string[];
  businessHours: BusinessHours;
}

// Complete setup data structure used in QuickSetup
export interface SetupData {
  trainingSources: TrainingSources;
  businessInformation: BusinessInformation;
  messageTaking: MessageTaking;
  callNotifications: CallNotifications;
}

// Onboarding data - mapped version of the legacy flat structure
export interface OnboardingData {
  businessName: string;
  businessDescription: string;
  businessWebsite: string;
  businessAddress: string;
  businessPhone: string;
  agentLanguage: string;
  countryCode?: string;
  businessHours?: BusinessHours;
}

/**
 * Convert flat onboarding data to the nested setup data structure
 * @param data Flat onboarding data
 * @returns Structured setup data
 */
export function convertOnboardingToSetupData(data: OnboardingData): SetupData {
  // Log data received for conversion
  console.log("[convertOnboardingToSetupData] Received data:", {
    businessName: data.businessName,
    hasBusinessHours: !!data.businessHours,
    businessHoursFormat: data.businessHours ? JSON.stringify(data.businessHours).substring(0, 100) + "..." : "N/A"
  });

  // Create default business hours only if not provided in onboarding data
  const businessHours = data.businessHours || {
    Monday: { open: "09:00", close: "17:00" },
    Tuesday: { open: "09:00", close: "17:00" },
    Wednesday: { open: "09:00", close: "17:00" },
    Thursday: { open: "09:00", close: "17:00" },
    Friday: { open: "09:00", close: "17:00" },
    Saturday: { open: "", close: "" },
    Sunday: { open: "", close: "" },
  };
  
  // Log selected business hours for verification
  console.log("[convertOnboardingToSetupData] Using businessHours:", 
    data.businessHours ? "FROM DATA" : "DEFAULT HOURS");

  return {
    trainingSources: {
      googleBusinessProfile: data.businessName,
      businessWebsite: data.businessWebsite,
    },
    businessInformation: {
      businessName: data.businessName,
      businessOverview: data.businessDescription,
      primaryBusinessAddress: data.businessAddress,
      primaryBusinessPhone: data.businessPhone,
      coreServices: [],
      businessHours: businessHours, // Use extracted hours or default
    },
    messageTaking: {
      callerName: {
        required: true,
        alwaysRequested: true,
      },
      callerPhoneNumber: {
        required: true,
        automaticallyCaptured: true,
      },
      specificQuestions: [],
    },
    callNotifications: {
      emailNotifications: {
        enabled: false,
        email: "",
      },
      smsNotifications: {
        enabled: false,
        phoneNumber: "",
      },
    },
  };
} 