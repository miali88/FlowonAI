"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";

// Import schema and modular components
import { quickSetupSchema, FormValues } from "./schema";
import TrainingSources from "./form-sections/TrainingSources";
import BusinessInformation from "./form-sections/BusinessInformation";
import MessageTaking from "./form-sections/MessageTaking";
import CallNotifications from "./form-sections/CallNotifications";
import PlaceChangeDialog from "./form-sections/PlaceChangeDialog";

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

        const response = await fetch(
          `${API_BASE_URL}/guided_setup/setup_data`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            // No data found is not an error, just means this is the first time
            setIsLoadingData(false);
            return;
          }

          const errorData = await response.text();
          console.error("Error fetching setup data:", errorData);
          throw new Error("Failed to fetch existing setup data");
        }

        const data = await response.json();

        if (data.success && data.setupData) {
          console.log("Loaded existing setup data:", data.setupData);

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

      // Log the data before sending to check the format
      console.log("Form data to be sent:", data);

      const response = await fetch(
        `${API_BASE_URL}/guided_setup/quick_setup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => response.text());
        console.error("Error submitting setup data:", errorData);
        
        // Provide more detailed error message
        if (typeof errorData === 'object' && errorData.detail) {
          // Format validation errors in a more readable way
          if (Array.isArray(errorData.detail)) {
            const errors = errorData.detail.map((err: any) => 
              `Field ${err.loc.join('.')} is ${err.type}: ${err.msg}`
            ).join('\n');
            throw new Error(`Validation errors:\n${errors}`);
          } else {
            throw new Error(`API Error: ${JSON.stringify(errorData.detail)}`);
          }
        } else {
          throw new Error("Failed to submit quick setup data");
        }
      }

      const result = await response.json();
      console.log("Setup data saved successfully:", result);

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

    // Update fields with place data
    if (placeData.name) {
      setValue("businessInformation.businessName", placeData.name);
    }

    if (placeData.formatted_address) {
      setValue(
        "businessInformation.primaryBusinessAddress",
        placeData.formatted_address
      );
    }

    if (placeData.formatted_phone_number) {
      setValue(
        "businessInformation.primaryBusinessPhone",
        placeData.formatted_phone_number
      );
    }

    if (placeData.website) {
      setValue("trainingSources.businessWebsite", placeData.website);
    }

    if (placeData.editorial_summary?.overview) {
      setValue(
        "businessInformation.businessOverview",
        placeData.editorial_summary.overview
      );
    }

    // Update business hours if available
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

      // Start with current hours or empty structure with all days
      const businessHours: Record<string, { open: string; close: string }> =
        forceUpdate
          ? {
              Monday: { open: "", close: "" },
              Tuesday: { open: "", close: "" },
              Wednesday: { open: "", close: "" },
              Thursday: { open: "", close: "" },
              Friday: { open: "", close: "" },
              Saturday: { open: "", close: "" },
              Sunday: { open: "", close: "" },
            }
          : { ...getValues("businessInformation.businessHours") };

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
            businessHours[dayName] = {
              open: openTime,
              close: closeTime,
            };
          }
        }
      });

      // Always set hours to ensure the structure is maintained
      setValue("businessInformation.businessHours", businessHours);
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
        setValue("businessInformation.coreServices", relevantTypes);
      }
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 mb-16">
        {/* Show error alert if loading failed */}
        {loadError && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        )}

        {/* Show success message */}
        {successMessage && (
          <Alert className="mb-8 bg-green-50 text-green-800 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Place Change Dialog */}
        <PlaceChangeDialog 
          open={placeChangeDialog}
          onOpenChange={setPlaceChangeDialog}
          onKeepData={handleKeepCurrentData}
          onUpdateAll={handleUpdateAllFields}
        />

        {/* Training Sources Section */}
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

        {/* Business Information Section */}
        <BusinessInformation 
          control={control}
          errors={errors}
          newService={newService}
          setNewService={setNewService}
          addService={addService}
          removeService={removeService}
        />

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
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please fill in all required fields before proceeding to the next
              step.
            </AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <div className="flex justify-end mt-12 mb-8">
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 text-lg font-semibold rounded-xl shadow-lg transition-all hover:shadow-xl hover:scale-105"
            disabled={isSubmitting}
          >
            Next Step
            <ArrowRight className="ml-3 h-5 w-5" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
