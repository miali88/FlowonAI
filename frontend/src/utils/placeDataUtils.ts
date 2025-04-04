/**
 * Utility functions for extracting and formatting data from Google Places API results
 */

import { 
  BusinessHours, 
  BusinessInformation, 
  SetupData,
  OnboardingData
} from "@/types/businessSetup";

export interface PlaceDataExtracted {
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessWebsite: string;
  businessOverview: string;
  countryCode: string;
  businessHours: BusinessHours;
  coreServices: string[];
  placeId?: string;
  photoReference?: string;
}

/**
 * Cleans a URL by removing UTM parameters and standardizing the format
 * @param url The URL to clean
 * @returns Cleaned URL with only the root domain
 */
function cleanBusinessUrl(url: string): string {
  if (!url) return "";
  
  try {
    // Create URL object to parse the URL
    const urlObj = new URL(url);
    
    // Remove 'www.' if present
    let hostname = urlObj.hostname.replace(/^www\./, '');
    
    // Get protocol (default to https if not specified)
    const protocol = urlObj.protocol || 'https:';
    
    // Combine protocol and hostname for clean URL
    return `${protocol}//${hostname}`;
  } catch (error) {
    // If URL parsing fails, try basic string cleanup
    console.warn("URL parsing failed, attempting basic cleanup:", error);
    return url
      .replace(/^(https?:\/\/)?(www\.)?/, 'https://') // Standardize protocol and www
      .split('?')[0] // Remove query parameters
      .split('#')[0] // Remove hash
      .replace(/\/+$/, ''); // Remove trailing slashes
  }
}

/**
 * Extracts and formats business data from Google Places API result
 * @param placeData Raw place data from Google Places API
 * @returns Structured business data
 */
export function extractPlaceData(placeData: any): PlaceDataExtracted {
  if (!placeData) {
    throw new Error("No place data provided");
  }

  // Initialize return object with default empty values
  const extractedData: PlaceDataExtracted = {
    businessName: "",
    businessAddress: "",
    businessPhone: "",
    businessWebsite: "",
    businessOverview: "",
    countryCode: "US", // Default country code
    businessHours: {
      Monday: { open: "", close: "" },
      Tuesday: { open: "", close: "" },
      Wednesday: { open: "", close: "" },
      Thursday: { open: "", close: "" },
      Friday: { open: "", close: "" },
      Saturday: { open: "", close: "" },
      Sunday: { open: "", close: "" },
    },
    coreServices: [],
    placeId: placeData.place_id || "",
  };

  // Extract photo reference if available
  if (placeData.photos && placeData.photos.length > 0) {
    extractedData.photoReference = placeData.photos[0].photo_reference;
    console.log("Extracted photo reference:", extractedData.photoReference);
  }

  // Extract basic information
  if (placeData.name) {
    extractedData.businessName = placeData.name;
  }

  if (placeData.formatted_address) {
    extractedData.businessAddress = placeData.formatted_address;
  }

  if (placeData.formatted_phone_number) {
    extractedData.businessPhone = placeData.formatted_phone_number;
  }

  if (placeData.website) {
    // Clean the website URL before storing
    extractedData.businessWebsite = cleanBusinessUrl(placeData.website);
    console.log("Cleaned business website URL:", extractedData.businessWebsite);
  }

  if (placeData.editorial_summary?.overview) {
    extractedData.businessOverview = placeData.editorial_summary.overview;
  }

  // Extract country code
  if (placeData.address_components) {
    const countryComponent = placeData.address_components.find(
      (component: any) => component.types.includes('country')
    );
    
    if (countryComponent) {
      const detectedCountryCode = countryComponent.short_name;
      
      // Validate country code format (should be 2 letters)
      if (detectedCountryCode && /^[A-Z]{2}$/.test(detectedCountryCode)) {
        extractedData.countryCode = detectedCountryCode;
        console.log(`Detected valid country code: ${detectedCountryCode}`);
      }
    }
  }

  // Extract business hours if available
  if (placeData.opening_hours?.periods) {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    placeData.opening_hours.periods.forEach((period: any) => {
      if (period.open && period.close) {
        const dayName = daysOfWeek[period.open.day];

        // Format time from 0000 to HH:MM format
        const formatTime = (time: string) => {
          if (!time) return "";
          const hours = time.substring(0, 2);
          const minutes = time.substring(2);
          return `${hours}:${minutes}`;
        };

        const openTime = formatTime(period.open.time);
        const closeTime = formatTime(period.close.time);

        if (dayName && openTime && closeTime) {
          extractedData.businessHours[dayName] = {
            open: openTime,
            close: closeTime,
          };
        }
      }
    });
  }

  // Extract and add core services/types if available
  if (placeData.types && placeData.types.length > 0) {
    // Filter out generic types and format them to be more readable
    const relevantTypes = placeData.types
      .filter(
        (type: string) =>
          ![
            "point_of_interest",
            "establishment",
            "place",
            "business",
          ].includes(type)
      )
      .map((type: string) =>
        type
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      );

    if (relevantTypes.length > 0) {
      extractedData.coreServices = relevantTypes;
    }
  }

  return extractedData;
}

/**
 * Maps the extracted place data to a component-specific format using a mapping function
 * @param placeData Raw place data from Google Places API
 * @param mapFn Mapping function that transforms extracted data to component-specific format
 * @returns Component-specific formatted data
 */
export function mapPlaceDataToComponent<T>(
  placeData: any,
  mapFn: (extractedData: PlaceDataExtracted) => T
): T {
  const extractedData = extractPlaceData(placeData);
  return mapFn(extractedData);
}

/**
 * Maps for specific components to use with mapPlaceDataToComponent
 */
export const componentMappings = {
  /**
   * Maps extracted place data to QuickSetup form format (SetupData partial)
   */
  quickSetupMapping: (data: PlaceDataExtracted) => ({
    businessInformation: {
      businessName: data.businessName,
      businessOverview: data.businessOverview,
      primaryBusinessAddress: data.businessAddress,
      primaryBusinessPhone: data.businessPhone,
      coreServices: data.coreServices,
      businessHours: data.businessHours,
    } as BusinessInformation,
    trainingSources: {
      businessWebsite: data.businessWebsite,
      googleBusinessProfile: data.businessName,
    },
  }),
  
  /**
   * Maps extracted place data to BusinessInfo/onboarding page format
   */
  businessInfoMapping: (data: PlaceDataExtracted): OnboardingData => ({
    businessName: data.businessName,
    businessWebsite: data.businessWebsite,
    businessAddress: data.businessAddress,
    businessPhone: data.businessPhone,
    businessDescription: data.businessOverview,
    agentLanguage: "en-US", // Default
    countryCode: data.countryCode,
    businessHours: data.businessHours,
  }),

  /**
   * Maps extracted place data directly to complete SetupData structure
   * with reasonable defaults for required fields
   */
  completeSetupDataMapping: (data: PlaceDataExtracted): SetupData => ({
    trainingSources: {
      googleBusinessProfile: data.businessName,
      businessWebsite: data.businessWebsite,
    },
    businessInformation: {
      businessName: data.businessName,
      businessOverview: data.businessOverview,
      primaryBusinessAddress: data.businessAddress,
      primaryBusinessPhone: data.businessPhone,
      coreServices: data.coreServices,
      businessHours: data.businessHours,
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
  }),
}; 