import { Control, ControllerRenderProps, Controller, useWatch } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { FormValues } from "../schema";

interface BusinessInformationProps {
  control: Control<FormValues>;
  errors: any;
  newService: string;
  setNewService: (value: string) => void;
  addService: () => void;
  removeService: (index: number) => void;
}

export default function BusinessInformation({
  control,
  errors,
  newService,
  setNewService,
  addService,
  removeService,
}: BusinessInformationProps) {
  // Watch for core services to display the list
  const coreServices = useWatch({
    control,
    name: "businessInformation.coreServices",
  });

  return (
    <Card className={errors.businessInformation ? "border-red-500" : ""}>
      <Accordion type="single" collapsible>
        <AccordionItem value="briefing" className="border-none">
          <CardHeader className="border-b">
            <AccordionTrigger className="hover:no-underline">
              <CardTitle>Briefing</CardTitle>
            </AccordionTrigger>
          </CardHeader>
          <AccordionContent>
            <CardContent className="space-y-4 pt-4">
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
                    {coreServices?.map((service: string, index: number) => (
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
} 