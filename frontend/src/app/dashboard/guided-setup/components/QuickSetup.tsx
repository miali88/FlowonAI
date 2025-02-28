"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Info, X, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm, Controller, ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import AutoSearchPlacesInput from "./AutoSearchPlacesInput";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Define the Zod schema for validation
const quickSetupSchema = z.object({
  trainingSources: z
    .object({
      googleBusinessProfile: z.string(),
      businessWebsite: z.string(),
    })
    .refine((data) => data.googleBusinessProfile || data.businessWebsite, {
      message: "At least one training source is required",
      path: ["_errors"],
    }),
  businessInformation: z.object({
    businessName: z.string().min(1, "Business name is required"),
    businessOverview: z.string().min(1, "Business overview is required"),
    primaryBusinessAddress: z.string().min(1, "Business address is required"),
    primaryBusinessPhone: z
      .string()
      .min(1, "Business phone number is required"),
    coreServices: z
      .array(z.string())
      .min(1, "At least one core service is required"),
    businessHours: z.record(
      z.object({
        open: z.string(),
        close: z.string(),
      })
    ),
  }),
  messageTaking: z.object({
    callerName: z.object({
      required: z.boolean(),
      alwaysRequested: z.boolean(),
    }),
    callerPhoneNumber: z.object({
      required: z.boolean(),
      automaticallyCaptured: z.boolean(),
    }),
    specificQuestions: z.array(
      z.object({
        question: z.string(),
        required: z.boolean(),
      })
    ),
  }),
  callNotifications: z.object({
    emailNotifications: z.object({
      enabled: z.boolean(),
      email: z
        .string()
        .email("Invalid email address")
        .optional()
        .or(z.literal("")),
    }),
    smsNotifications: z.object({
      enabled: z.boolean(),
      phoneNumber: z.string().optional().or(z.literal("")),
    }),
  }),
});

type FormValues = z.infer<typeof quickSetupSchema>;

export default function QuickSetup({ onNext }: { onNext: () => void }) {
  const [newService, setNewService] = useState("");
  const [placeChangeDialog, setPlaceChangeDialog] = useState(false);
  const [pendingPlaceData, setPendingPlaceData] = useState<any>(null);
  const { getToken, userId } = useAuth();
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingError, setTrainingError] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState("");

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
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    formState,
    watch,
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

        const response = await fetch(
          `${API_BASE_URL}/guided_setup/setup_data?user_id=${userId || ""}`,
          {}
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
            businessInformation: data.setupData.businessInformation,
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
  }, [userId, reset]);

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

  const onSubmit = async (data: FormValues) => {
    try {
      setSuccessMessage(null);

      // Send data to backend using API_BASE_URL
      const response = await fetch(
        `${API_BASE_URL}/guided_setup/quick_setup?user_id=${userId || ""}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Error submitting setup data:", errorData);
        throw new Error("Failed to submit quick setup data");
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
    }
  };

  // Watch values for conditional rendering
  const emailNotificationsEnabled = watch(
    "callNotifications.emailNotifications.enabled"
  );
  const smsNotificationsEnabled = watch(
    "callNotifications.smsNotifications.enabled"
  );
  const coreServices = watch("businessInformation.coreServices");
  const googleBusinessProfile = watch("trainingSources.googleBusinessProfile");

  // Function to update all fields with place data
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

    // Update business name if available
    if (placeData.name) {
      setValue("businessInformation.businessName", placeData.name);
    }

    // Update address if available
    if (placeData.formatted_address) {
      setValue(
        "businessInformation.primaryBusinessAddress",
        placeData.formatted_address
      );
    }

    // Update phone if available
    if (placeData.formatted_phone_number) {
      setValue(
        "businessInformation.primaryBusinessPhone",
        placeData.formatted_phone_number
      );
    }

    // Update website if available
    if (placeData.website) {
      setValue("trainingSources.businessWebsite", placeData.website);
    }

    // Update business overview if available
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

  const handleTraining = async () => {
    try {
      setIsTraining(true);
      setTrainingError(null);

      // Get the business website URL
      const websiteUrl = getValues("trainingSources.businessWebsite");

      // Send request to retrain agent
      const response = await fetch(
        `${API_BASE_URL}/guided_setup/retrain_agent?user_id=${userId || ""}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
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

  const addQuestion = () => {
    const currentQuestions = getValues("messageTaking.specificQuestions");
    setValue("messageTaking.specificQuestions", [
      ...currentQuestions,
      { question: newQuestion, required: true }
    ]);
    setNewQuestion("");
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
        <Dialog open={placeChangeDialog} onOpenChange={setPlaceChangeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Business Information?</DialogTitle>
              <DialogDescription>
                You&apos;ve selected a new business. Would you like to update
                all your business information with data from this new place?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  // Just update the place name without changing other fields
                  if (pendingPlaceData) {
                    setValue(
                      "trainingSources.googleBusinessProfile",
                      pendingPlaceData.name || ""
                    );
                  }
                  setPendingPlaceData(null);
                  setPlaceChangeDialog(false);
                }}
              >
                Keep Current Data
              </Button>
              <Button
                onClick={() => {
                  // Update all fields with the new place data
                  if (pendingPlaceData) {
                    setValue(
                      "trainingSources.googleBusinessProfile",
                      pendingPlaceData.name || ""
                    );
                    updateFieldsWithPlaceData(pendingPlaceData, true);
                  }
                  setPendingPlaceData(null);
                  setPlaceChangeDialog(false);
                }}
              >
                Update All Fields
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Training Sources */}
        <Card
          className={
            errors.trainingSources && "trainingSources" in errors
              ? "border-red-500"
              : ""
          }
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Training Sources</span>
              <Info className="h-4 w-4 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-500 mb-4">
              Flowon uses these sources to learn about your business, which
              helps her answer caller questions effectively. While entering both
              sources is ideal, just one is enough to get her started. Update
              these sources at anytime to retrain Flowon.
            </div>
            {errors.trainingSources &&
              Object.keys(errors.trainingSources).some(
                (key) => key === "_errors"
              ) && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    At least one training source is required
                  </AlertDescription>
                </Alert>
              )}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <FormField
                    control={control}
                    name="trainingSources.googleBusinessProfile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Google Business Profile</FormLabel>
                        <FormControl>
                          <AutoSearchPlacesInput
                            value={field.value}
                            onChange={field.onChange}
                            onPlaceSelect={(placeData) => {
                              // Log the full place data
                              console.log("Place data in parent:", placeData);

                              // Check if we already have data in the form
                              const hasExistingData =
                                getValues("businessInformation.businessName") ||
                                getValues(
                                  "businessInformation.primaryBusinessAddress"
                                ) ||
                                getValues(
                                  "businessInformation.primaryBusinessPhone"
                                ) ||
                                getValues("trainingSources.businessWebsite");

                              if (
                                hasExistingData &&
                                field.value &&
                                field.value !== placeData.name
                              ) {
                                // Store the place data and show confirmation dialog
                                setPendingPlaceData(placeData);
                                setPlaceChangeDialog(true);
                              } else {
                                // First time selecting a place or no existing data, update directly
                                setValue(
                                  "trainingSources.googleBusinessProfile",
                                  placeData.name || ""
                                );
                                updateFieldsWithPlaceData(placeData);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <FormField
                    control={control}
                    name="trainingSources.businessWebsite"
                    render={({
                      field,
                    }: {
                      field: ControllerRenderProps<
                        FormValues,
                        "trainingSources.businessWebsite"
                      >;
                    }) => (
                      <FormItem>
                        <FormLabel>Business Website</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="http://www.example.com"
                            {...field}
                            className={
                              errors.trainingSources &&
                              Object.keys(errors.trainingSources).some(
                                (key) => key === "_errors"
                              )
                                ? "border-red-500"
                                : ""
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button variant="outline" className="mt-6">
                  Edit
                </Button>
              </div>
              <div className="flex gap-2 mt-4">
                {trainingError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{trainingError}</AlertDescription>
                  </Alert>
                )}
                <Button
                  type="button"
                  variant="default"
                  disabled={
                    !watch("trainingSources.businessWebsite") || isTraining
                  }
                  onClick={handleTraining}
                  className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold"
                >
                  {isTraining ? (
                    <>
                      <span className="mr-2">🔄</span>
                      Training...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">🤖</span>
                      Train with AI
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    // Reset the website field
                    setValue("trainingSources.businessWebsite", "");
                    setTrainingError(null);
                  }}
                  disabled={isTraining}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card className={errors.businessInformation ? "border-red-500" : ""}>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-500 mb-4">
              This business information gives Flowon context to handle your
              calls and was gathered from the training sources you provided
              above. Refine it here as you see fit. Update or add to it at
              anytime.
            </div>
            <div className="space-y-4">
              <FormField
                control={control}
                name="businessInformation.businessName"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<
                    FormValues,
                    "businessInformation.businessName"
                  >;
                }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className={
                          errors.businessInformation?.businessName
                            ? "border-red-500"
                            : ""
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="businessInformation.businessOverview"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<
                    FormValues,
                    "businessInformation.businessOverview"
                  >;
                }) => (
                  <FormItem>
                    <FormLabel>Business Overview</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className={`min-h-[100px] ${
                          errors.businessInformation?.businessOverview
                            ? "border-red-500"
                            : ""
                        }`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="businessInformation.primaryBusinessAddress"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<
                    FormValues,
                    "businessInformation.primaryBusinessAddress"
                  >;
                }) => (
                  <FormItem>
                    <FormLabel>Primary Business Address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className={
                          errors.businessInformation?.primaryBusinessAddress
                            ? "border-red-500"
                            : ""
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="businessInformation.primaryBusinessPhone"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<
                    FormValues,
                    "businessInformation.primaryBusinessPhone"
                  >;
                }) => (
                  <FormItem>
                    <FormLabel>Primary Business Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className={
                          errors.businessInformation?.primaryBusinessPhone
                            ? "border-red-500"
                            : ""
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <Label>Core Services</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {coreServices.map((service, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-black"
                    >
                      <span>{service}</span>
                      <button
                        type="button"
                        onClick={() => removeService(index)}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type and hit Enter to add service"
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addService())
                    }
                    className={
                      errors.businessInformation?.coreServices
                        ? "border-red-500"
                        : ""
                    }
                  />
                  <Button type="button" onClick={addService}>
                    Add
                  </Button>
                </div>
                {errors.businessInformation?.coreServices && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.businessInformation.coreServices.message}
                  </p>
                )}
              </div>

              <div>
                <Label>Business Hours</Label>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                  {/* Weekdays Column */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-500">Weekdays</h3>
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                      <div key={day} className="flex items-center gap-4">
                        <span className="w-24 font-medium">{day}</span>
                        <div className="flex items-center gap-2 flex-1">
                          <Controller
                            control={control}
                            name={
                              `businessInformation.businessHours.${day}.open` as any
                            }
                            render={({ field }: { field: any }) => (
                              <Input type="time" {...field} />
                            )}
                          />
                          <span>to</span>
                          <Controller
                            control={control}
                            name={
                              `businessInformation.businessHours.${day}.close` as any
                            }
                            render={({ field }: { field: any }) => (
                              <Input type="time" {...field} />
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Weekends Column */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-500">Weekends</h3>
                    {["Saturday", "Sunday"].map((day) => (
                      <div key={day} className="flex items-center gap-4">
                        <span className="w-24 font-medium">{day}</span>
                        <div className="flex items-center gap-2 flex-1">
                          <Controller
                            control={control}
                            name={
                              `businessInformation.businessHours.${day}.open` as any
                            }
                            render={({ field }: { field: any }) => (
                              <Input type="time" {...field} />
                            )}
                          />
                          <span>to</span>
                          <Controller
                            control={control}
                            name={
                              `businessInformation.businessHours.${day}.close` as any
                            }
                            render={({ field }: { field: any }) => (
                              <Input type="time" {...field} />
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Message Taking */}
        <Card>
          <CardHeader>
            <CardTitle>Message Taking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-500 mb-4">
              Add specific questions you&apos;d like Flowon to ask your callers
              when taking a message.
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Caller Name</Label>
                <Controller
                  control={control}
                  name="messageTaking.callerName.alwaysRequested"
                  render={({ field }: { field: any }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Caller Phone Number</Label>
                <Controller
                  control={control}
                  name="messageTaking.callerPhoneNumber.automaticallyCaptured"
                  render={({ field }: { field: any }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
              
              {/* Custom Questions Section */}
              <div className="pt-4 border-t">
                <Label className="block mb-2">Specific Questions</Label>
                <div className="text-sm text-gray-500 mb-4">
                  Add custom questions for Flowon to ask callers. All questions will be required.
                </div>
                
                {/* List of existing questions */}
                <div className="space-y-3 mb-4">
                  {watch("messageTaking.specificQuestions").map((_, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="flex-1">
                        <Controller
                          control={control}
                          name={`messageTaking.specificQuestions.${index}.question`}
                          render={({ field }) => (
                            <Input 
                              {...field} 
                              placeholder="Enter question..." 
                            />
                          )}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const currentQuestions = getValues("messageTaking.specificQuestions");
                          setValue(
                            "messageTaking.specificQuestions",
                            currentQuestions.filter((_, i) => i !== index)
                          );
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                {/* Add new question input and button */}
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Type new question here..."
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && newQuestion.trim()) {
                          e.preventDefault();
                          addQuestion();
                        }
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addQuestion}
                  >
                    <span className="mr-1">+</span> Add
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Call Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-500 mb-4">
              Get notified as soon as a new call comes in.
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Email Notifications</Label>
                  <Controller
                    control={control}
                    name="callNotifications.emailNotifications.enabled"
                    render={({ field }: { field: any }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
                {emailNotificationsEnabled && (
                  <FormField
                    control={control}
                    name="callNotifications.emailNotifications.email"
                    render={({
                      field,
                    }: {
                      field: ControllerRenderProps<
                        FormValues,
                        "callNotifications.emailNotifications.email"
                      >;
                    }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            {...field}
                            className={
                              errors.callNotifications?.emailNotifications
                                ?.email
                                ? "border-red-500"
                                : ""
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Text Message Notifications</Label>
                  <Controller
                    control={control}
                    name="callNotifications.smsNotifications.enabled"
                    render={({ field }: { field: any }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
                {smsNotificationsEnabled && (
                  <FormField
                    control={control}
                    name="callNotifications.smsNotifications.phoneNumber"
                    render={({
                      field,
                    }: {
                      field: ControllerRenderProps<
                        FormValues,
                        "callNotifications.smsNotifications.phoneNumber"
                      >;
                    }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="Add your phone number..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {Object.keys(errors).length > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please fill in all required fields before proceeding to the next
              step.
            </AlertDescription>
          </Alert>
        )}

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
