import { useState } from "react";
import { Control, ControllerRenderProps, useFormState, useWatch } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Info, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AutoSearchPlacesInput from "../AutoSearchPlacesInput";

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
  // Watch for business website value for enabling/disabling the training button
  const businessWebsite = useWatch({
    control,
    name: "trainingSources.businessWebsite",
  });

  return (
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
              disabled={!businessWebsite || isTraining}
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 