import { useState, useEffect } from "react";
import { Control, ControllerRenderProps, useFormState, useWatch } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Info, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AutoSearchPlacesInput from "../AutoSearchPlacesInput";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { FormValues } from "../schema";

interface TrainingSourcesProps {
  control: Control<FormValues>;
  errors: any;
  isTraining: boolean;
  trainingError: string | null;
  handleTraining: () => Promise<void>;
  updateFieldsWithPlaceData: (placeData: any, forceUpdate?: boolean) => void;
  setPendingPlaceData: (data: any) => void;
  setPlaceChangeDialog: (open: boolean) => void;
  setValue: (name: any, value: any) => void;
  getValues: (name?: any) => any;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function TrainingSources({
  control,
  errors,
  isTraining,
  trainingError,
  handleTraining,
  updateFieldsWithPlaceData,
  setPendingPlaceData,
  setPlaceChangeDialog,
  setValue,
  getValues,
}: TrainingSourcesProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [trainedOnWebsite, setTrainedOnWebsite] = useState(false);
  const { getToken } = useAuth();
  
  // Fetch initial trained status
  useEffect(() => {
    async function fetchTrainingStatus() {
      try {
        const token = await getToken();
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/guided_setup/setup_data`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.setupData) {
            setTrainedOnWebsite(data.setupData.trained_on_website || false);
          }
        }
      } catch (error) {
        console.error('Error fetching training status:', error);
      }
    }
    fetchTrainingStatus();
  }, [getToken]);

  // Watch for business website value for enabling/disabling the training button
  const businessWebsite = useWatch({
    control,
    name: "trainingSources.businessWebsite",
  });

  // Effect to reset trained status when website changes
  useEffect(() => {
    if (businessWebsite) {
      setTrainedOnWebsite(false);
    }
  }, [businessWebsite]);

  // Enhanced training handler
  const handleTrainingWithStatus = async () => {
    try {
      await handleTraining();
      
      // Get the auth token
      const token = await getToken();
      
      // Update training status in database
      const response = await fetch(`${API_BASE_URL}/guided_setup/update_training_status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          trained_on_website: true
        }),
      });

      if (response.ok) {
        setTrainedOnWebsite(true);
      } else {
        console.error('Failed to update training status:', await response.text());
      }
    } catch (error) {
      console.error('Error updating training status:', error);
    }
  };

  // CSS classes for the pulsating effect
  const buttonClasses = cn(
    "bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold",
    !trainedOnWebsite && businessWebsite && "animate-pulse"
  );

  // Determine if we should show the tooltip content (only when not trained and has website)
  const showTooltipContent = !trainedOnWebsite && businessWebsite;

  return (
    <Card
      className={
        errors.trainingSources && "trainingSources" in errors
          ? "border-red-500"
          : ""
      }
    >
      <Accordion type="single" collapsible>
        <AccordionItem value="sources" className="border-none">
          <CardHeader className="border-b">
            <AccordionTrigger className="hover:no-underline">
              <CardTitle className="flex items-center gap-2">
                <span>Sources</span>
                <Info className="h-4 w-4 text-gray-400" />
              </CardTitle>
            </AccordionTrigger>
          </CardHeader>
          <AccordionContent>
            <CardContent className="space-y-4 pt-4">
              <div className="text-sm text-gray-500 mb-4">
                Flowon uses these sources to learn about your business, which
                helps it answer caller questions effectively. While entering both
                sources is ideal, just one is enough to get it started. Update
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
                </div>
                <div className="flex gap-2 mt-4">
                  {trainingError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{trainingError}</AlertDescription>
                    </Alert>
                  )}
                  <TooltipProvider>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="default"
                          disabled={!businessWebsite || isTraining}
                          onClick={handleTrainingWithStatus}
                          className={buttonClasses}
                        >
                          {isTraining ? (
                            <>
                              <span className="mr-2">🔄</span>
                              Training...
                            </>
                          ) : (
                            <>
                              <span className="mr-2">✨</span>
                              {trainedOnWebsite ? 'Retrain Agent' : 'Train Agent'}
                            </>
                          )}
                        </Button>
                      </TooltipTrigger>
                      {showTooltipContent && (
                        <TooltipContent side="left" sideOffset={5} className="animate-in fade-in-0 zoom-in-95">
                          <p>Click to train agent with your business website</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
} 