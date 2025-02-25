"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { QuickSetupData } from "../types";
import { Info, X, ArrowRight, AlertCircle } from "lucide-react";
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
import GooglePlacesSearch, { PlaceData } from "./GooglePlacesSearch";

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
          Monday: { open: "10:00", close: "20:00" },
          Tuesday: { open: "10:00", close: "20:00" },
          Wednesday: { open: "10:00", close: "20:00" },
          Thursday: { open: "10:00", close: "20:00" },
          Friday: { open: "10:00", close: "20:00" },
          Saturday: { open: "10:00", close: "20:00" },
          Sunday: { open: "10:00", close: "20:00" },
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

  const { control, handleSubmit, formState, watch, setValue, getValues } = form;
  const { errors, isSubmitting } = formState;

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
      // Send data to backend using API_BASE_URL
      const response = await fetch(`${API_BASE_URL}/guided-setup/quick-setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to submit quick setup data");
      }

      // Proceed to next step
      onNext();
    } catch (error) {
      console.error("Error submitting quick setup data:", error);
      // You could add error handling UI here if needed
    }
  };

  // Handle Google Places selection
  const handlePlaceSelect = (placeData: PlaceData) => {
    // Update business information with Google Places data
    if (placeData.name) {
      setValue("businessInformation.businessName", placeData.name);
    }

    if (placeData.address) {
      setValue("businessInformation.primaryBusinessAddress", placeData.address);
    }

    if (placeData.phoneNumber) {
      setValue(
        "businessInformation.primaryBusinessPhone",
        placeData.phoneNumber
      );
    }

    if (placeData.website) {
      setValue("trainingSources.businessWebsite", placeData.website);
    }

    // Update business hours if available
    if (placeData.businessHours) {
      // Create a new object with all days of the week
      const defaultHours = {
        Monday: { open: "10:00", close: "20:00" },
        Tuesday: { open: "10:00", close: "20:00" },
        Wednesday: { open: "10:00", close: "20:00" },
        Thursday: { open: "10:00", close: "20:00" },
        Friday: { open: "10:00", close: "20:00" },
        Saturday: { open: "10:00", close: "20:00" },
        Sunday: { open: "10:00", close: "20:00" },
      };

      // Merge with the hours from Google Places
      const mergedHours = { ...defaultHours, ...placeData.businessHours };
      setValue("businessInformation.businessHours", mergedHours);
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

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
              Rosie uses these sources to learn about your business, which helps
              her answer caller questions effectively. While entering both
              sources is ideal, just one is enough to get her started. Update
              these sources at anytime to retrain Rosie.
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
                    render={({
                      field,
                    }: {
                      field: ControllerRenderProps<
                        FormValues,
                        "trainingSources.googleBusinessProfile"
                      >;
                    }) => (
                      <FormItem>
                        <FormLabel>Google Business Profile</FormLabel>
                        <FormControl>
                          <GooglePlacesSearch
                            value={field.value}
                            onChange={field.onChange}
                            onPlaceSelect={handlePlaceSelect}
                            placeholder="Search for your business..."
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
              This business information gives Rosie context to handle your calls
              and was gathered from the training sources you provided above.
              Refine it here as you see fit. Update or add to it at anytime.
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {Object.entries(
                    getValues("businessInformation.businessHours")
                  ).map(([day, hours]) => (
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
          </CardContent>
        </Card>

        {/* Message Taking */}
        <Card>
          <CardHeader>
            <CardTitle>Message Taking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-500 mb-4">
              Add specific questions you&apos;d like Rosie to ask your callers
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

        <div className="flex justify-end mt-8">
          <Button
            type="submit"
            className="bg-black hover:bg-gray-800 text-white px-8"
            disabled={isSubmitting}
          >
            Next Step
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
