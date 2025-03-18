"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Card } from "@/components/ui/card";

// Import our updated utilities
import { 
  extractPlaceData, 
  mapPlaceDataToComponent, 
  componentMappings 
} from "@/utils/placeDataUtils";

// Import shared interfaces
import { SetupData, OnboardingData, convertOnboardingToSetupData } from "@/types/businessSetup";

// Import setup data utilities
import { saveSetupDataToBackend } from "@/utils/setupDataUtils";

// Import schema and modular components
import { quickSetupSchema, FormValues } from "./schema";
import TrainingSources from "./form-sections/TrainingSources";
import BusinessInformation from "./form-sections/BusinessInformation";
import MessageTaking from "./form-sections/MessageTaking";
import CallNotifications from "./form-sections/CallNotifications";
import PlaceChangeDialog from "./form-sections/PlaceChangeDialog";
import BookingLink from "./form-sections/BookingLink";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function QuickSetup({ onNext }: { onNext: () => void }) {
  // State variables
  const [newService, setNewService] = useState("");
  const [placeChangeDialog, setPlaceChangeDialog] = useState(false);
  const [pendingPlaceData, setPendingPlaceData] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingError, setTrainingError] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  
  const { getToken, userId } = useAuth();

  // Initialize form with React Hook Form and Zod resolver
  const form = useForm<FormValues>({
    resolver: zodResolver(quickSetupSchema),
    defaultValues: {
      trainingSources: {
        googleBusinessProfile: "",
        businessWebsite: "",
      },
      businessInformation: {
        businessName: "",
        businessOverview: "",
        primaryBusinessAddress: "",
        primaryBusinessPhone: "",
        coreServices: [],
        businessHours: {
          Monday: { open: "", close: "" },
          Tuesday: { open: "", close: "" },
          Wednesday: { open: "", close: "" },
          Thursday: { open: "", close: "" },
          Friday: { open: "", close: "" },
          Saturday: { open: "", close: "" },
          Sunday: { open: "", close: "" },
        },
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
      bookingLink: {
        url: "",
      },
    },
    mode: "onBlur",
  });

  const {
    control,
    handleSubmit,
    formState,
    setValue,
    getValues,
    reset,
  } = form;
  const { errors, isSubmitting } = formState;

  // Fetch existing setup data when component loads
  useEffect(() => {
    async function fetchExistingSetupData() {
      try {
        setIsLoadingData(true);
        
        // Get the authentication token
        const token = await getToken();
        if (!token) {
          throw new Error("Authentication required");
        }

        // First try loading data from the backend
        let setupDataFound = false;
        try {
          const response = await fetch(
            `${API_BASE_URL}/guided_setup/setup_data`,
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            }
          );

          if (response.ok) {
            const data = await response.json();

            if (data.success && data.setupData) {
              console.log("Loaded existing setup data from API:", data.setupData);
              
              // Use reset to update all form values at once
              reset({
                trainingSources: data.setupData.trainingSources,
                businessInformation: {
                  ...data.setupData.businessInformation,
                  businessOverview: data.setupData.businessInformation.businessOverview || "",
                },
                messageTaking: data.setupData.messageTaking,
                callNotifications: data.setupData.callNotifications,
              });
              
              setupDataFound = true;
            }
          } else if (response.status !== 404) {
            // Only throw if it's not a 404 (404 means no data found, which is not an error)
            throw new Error(`Failed to fetch existing setup data: ${response.status}`);
          }
        } catch (apiError) {
          console.error("Error fetching setup data from API:", apiError);
          // Continue to try localStorage if API fails
        }

        // If no data from backend, check localStorage
        if (!setupDataFound) {
          console.log("No setup data found from API, checking localStorage...");
          
          // First check for the structured setup data
          const storedSetupData = localStorage.getItem('flowonAI_setupData');
          if (storedSetupData) {
            try {
              const parsedSetupData: SetupData = JSON.parse(storedSetupData);
              console.log("Using structured setup data from localStorage:", parsedSetupData);
              
              reset({
                trainingSources: parsedSetupData.trainingSources,
                businessInformation: parsedSetupData.businessInformation,
                messageTaking: parsedSetupData.messageTaking,
                callNotifications: parsedSetupData.callNotifications,
              });
              
              setupDataFound = true;
            } catch (parseError) {
              console.error("Error parsing setup data from localStorage:", parseError);
            }
          }
          
          // If no structured data, try the flat onboarding data
          if (!setupDataFound) {
            const storedBusinessInfo = localStorage.getItem('flowonAI_businessInfo');
            if (storedBusinessInfo) {
              try {
                const parsedBusinessInfo: OnboardingData = JSON.parse(storedBusinessInfo);
                console.log("Using flat business info from localStorage:", parsedBusinessInfo);
                
                // Convert to structured format
                const convertedSetupData = convertOnboardingToSetupData(parsedBusinessInfo);
                console.log("Converted to setup data:", convertedSetupData);
                
                reset(convertedSetupData);
                
                setupDataFound = true;
              } catch (parseError) {
                console.error("Error parsing business info from localStorage:", parseError);
              }
            }
          }
        }
        
        if (!setupDataFound) {
          console.log("No setup data found - starting with default values");
        }
        
      } catch (error) {
        console.error("Error loading setup data:", error);
        setLoadError(
          "Failed to load your existing setup data. Starting with default values."
        );
      } finally {
        setIsLoadingData(false);
      }
    }

    fetchExistingSetupData();
  }, [userId, reset, getToken]);

  // Service management functions
  const addService = () => {
    if (newService.trim()) {
      const currentServices = getValues("businessInformation.coreServices");
      setValue("businessInformation.coreServices", [
        ...currentServices,
        newService.trim(),
      ]);
      setNewService("");
    }
  };

  const removeService = (index: number) => {
    const currentServices = getValues("businessInformation.coreServices");
    setValue(
      "businessInformation.coreServices",
      currentServices.filter((_: string, i: number) => i !== index)
    );
  };

  // Form submission
  const onSubmit = async (data: FormValues) => {
    try {
      setSuccessMessage(null);
      
      // Extra validation for notification fields
      if (data.callNotifications.emailNotifications.enabled) {
        if (data.callNotifications.emailNotifications.email === null) {
          data.callNotifications.emailNotifications.email = "";
          console.log("Fixed null email value before submission");
        }
      }
      
      if (data.callNotifications.smsNotifications.enabled) {
        if (data.callNotifications.smsNotifications.phoneNumber === null) {
          data.callNotifications.smsNotifications.phoneNumber = "";
          console.log("Fixed null phone number value before submission");
        }
      }

      // Get the authentication token
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      // Log the data before sending
      console.log("Form data to be sent:", data);
      
      // Use our utility to save data to all backend endpoints
      const setupData = data as unknown as SetupData; // Cast to SetupData type
      const saveResult = await saveSetupDataToBackend(setupData, token);

      if (!saveResult.success) {
        throw new Error(saveResult.error || "Failed to save setup data");
      }

      console.log("Setup data saved successfully:", saveResult.data);

      // Set success message
      setSuccessMessage("Your setup data has been saved successfully!");

      // Proceed to next step after a short delay
      setTimeout(() => {
        onNext();
      }, 1500);
    } catch (error) {
      console.error("Error submitting quick setup data:", error);
      // Display the error message to the user
      if (error instanceof Error) {
        setLoadError(error.message);
      } else {
        setLoadError("An unknown error occurred while submitting the form data.");
      }
    }
  };

  // Function to update fields with place data
  const updateFieldsWithPlaceData = (placeData: any, forceUpdate = false) => {
    if (!placeData) return;

    // Clear all fields if forceUpdate is true
    if (forceUpdate) {
      setValue("businessInformation.businessName", "");
      setValue("businessInformation.businessOverview", "");
      setValue("businessInformation.primaryBusinessAddress", "");
      setValue("businessInformation.primaryBusinessPhone", "");
      setValue("trainingSources.businessWebsite", "");
      setValue("businessInformation.coreServices", []);

      // Reset business hours to empty values but keep all days
      setValue("businessInformation.businessHours", {
        Monday: { open: "", close: "" },
        Tuesday: { open: "", close: "" },
        Wednesday: { open: "", close: "" },
        Thursday: { open: "", close: "" },
        Friday: { open: "", close: "" },
        Saturday: { open: "", close: "" },
        Sunday: { open: "", close: "" },
      });
    }

    try {
      // Use our mapPlaceDataToComponent utility with the QuickSetup mapping
      const mappedData = mapPlaceDataToComponent(placeData, componentMappings.quickSetupMapping);
      console.log("Mapped place data for QuickSetup:", mappedData);

      // Update businessInformation fields
      setValue("businessInformation.businessName", mappedData.businessInformation.businessName);
      setValue("businessInformation.businessOverview", mappedData.businessInformation.businessOverview);
      setValue("businessInformation.primaryBusinessAddress", mappedData.businessInformation.primaryBusinessAddress);
      setValue("businessInformation.primaryBusinessPhone", mappedData.businessInformation.primaryBusinessPhone);
      setValue("businessInformation.businessHours", mappedData.businessInformation.businessHours);
      
      // Update trainingSources fields
      setValue("trainingSources.businessWebsite", mappedData.trainingSources.businessWebsite);
      setValue("trainingSources.googleBusinessProfile", mappedData.trainingSources.googleBusinessProfile);
      
      // Update core services
      if (mappedData.businessInformation.coreServices.length > 0) {
        setValue("businessInformation.coreServices", mappedData.businessInformation.coreServices);
      }
    } catch (error) {
      console.error("Error mapping place data:", error);
    }
  };

  // Handle AI training
  const handleTraining = async () => {
    try {
      setIsTraining(true);
      setTrainingError(null);

      // Get the business website URL
      const websiteUrl = getValues("trainingSources.businessWebsite");

      // Get the authentication token
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      // Send request to retrain agent
      const response = await fetch(
        `${API_BASE_URL}/guided_setup/retrain_agent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            url: websiteUrl,
            setup_data: getValues(), // Send current form data
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to retrain agent");
      }

      const result = await response.json();

      if (result.success && result.setup_data) {
        // Update form with the new data
        reset({
          trainingSources: result.setup_data.trainingSources,
          businessInformation: result.setup_data.businessInformation,
          messageTaking: result.setup_data.messageTaking,
          callNotifications: result.setup_data.callNotifications,
        });

        setSuccessMessage("AI training completed successfully!");
      } else {
        throw new Error(result.error || "Training failed");
      }
    } catch (error) {
      console.error("Error training AI:", error);
      setTrainingError(
        error instanceof Error ? error.message : "Failed to train AI"
      );
    } finally {
      setIsTraining(false);
    }
  };

  // Add a question to the specific questions list
  const addQuestion = () => {
    if (newQuestion.trim()) {
      const currentQuestions = getValues("messageTaking.specificQuestions");
      setValue("messageTaking.specificQuestions", [
        ...currentQuestions,
        { question: newQuestion, required: true }
      ]);
      setNewQuestion("");
    }
  };

  // Handle place change dialog actions
  const handleKeepCurrentData = () => {
    if (pendingPlaceData) {
      setValue(
        "trainingSources.googleBusinessProfile",
        pendingPlaceData.name || ""
      );
    }
    setPendingPlaceData(null);
    setPlaceChangeDialog(false);
  };

  const handleUpdateAllFields = () => {
    if (pendingPlaceData) {
      setValue(
        "trainingSources.googleBusinessProfile",
        pendingPlaceData.name || ""
      );
      updateFieldsWithPlaceData(pendingPlaceData, true);
    }
    setPendingPlaceData(null);
    setPlaceChangeDialog(false);
  };

  // Render a loading indicator if data is being loaded
  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-500">Loading your setup data...</p>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
        {/* Show error alert if loading failed */}
        {loadError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        )}

        {/* Show success message */}
        {successMessage && (
          <Alert>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Business Setup Group */}
        <Card className="p-6">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Train Your Agent</h2>
            <TrainingSources 
              control={control}
              errors={errors}
              isTraining={isTraining}
              trainingError={trainingError}
              handleTraining={handleTraining}
              updateFieldsWithPlaceData={updateFieldsWithPlaceData}
              setPendingPlaceData={setPendingPlaceData}
              setPlaceChangeDialog={setPlaceChangeDialog}
              setValue={setValue}
              getValues={getValues}
            />
            <BusinessInformation 
              control={control}
              errors={errors}
              newService={newService}
              setNewService={setNewService}
              addService={addService}
              removeService={removeService}
            />
          </div>
        </Card>

        {/* Message Taking Section */}
        <MessageTaking 
          control={control}
          errors={errors}
          newQuestion={newQuestion}
          setNewQuestion={setNewQuestion}
          addQuestion={addQuestion}
          getValues={getValues}
          setValue={setValue}
        />

        {/* Call Notifications Section */}
        <CallNotifications 
          control={control}
          errors={errors}
          setValue={setValue}
        />

        {/* Form validation error */}
        {Object.keys(errors).length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please fill in all required fields before proceeding to the next step.
            </AlertDescription>
          </Alert>
        )}

        {/* Next Button */}
        <div className="flex justify-end">
          <Button type="submit">
            Next Step <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Place Change Dialog */}
        <PlaceChangeDialog
          open={placeChangeDialog}
          onOpenChange={setPlaceChangeDialog}
          onKeepData={handleKeepCurrentData}
          onUpdateAll={handleUpdateAllFields}
        />
      </form>
    </Form>
  );
}
