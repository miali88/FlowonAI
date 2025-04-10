import { Control, Controller, FieldErrors } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { CampaignResponse } from "@/types/campaigns";

interface CampaignSettingProps {
  campaignId: string;
  control: Control<Record<string, unknown>>;
  errors: FieldErrors;
  startTime: string;
  setStartTime: (time: string) => void;
  endTime: string;
  setEndTime: (time: string) => void;
  onUpdate: (date: Date | undefined, time: string) => void;
  defaultStartDate?: Date;
  defaultWorkingHours?: {
    start: string;
    end: string;
  };
  campaign: CampaignResponse;
  onUpdateCampaign: (data: CampaignResponse) => void;
}

export function CampaignSetting({
  campaignId,
  control,
  errors,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  onUpdate,
  defaultStartDate,
  defaultWorkingHours,
  campaign,
  onUpdateCampaign,
}: CampaignSettingProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(defaultStartDate);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (defaultWorkingHours) {
      setStartTime(defaultWorkingHours.start);
      setEndTime(defaultWorkingHours.end);
    }
  }, [defaultWorkingHours, setStartTime, setEndTime]);

  const handleDateSelect = (date: Date | undefined) => {
    setStartDate(date);
    onUpdate(date, startTime);
  };

  const handleTimeChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartTime(value);
    } else {
      setEndTime(value);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...campaign,
          agent_details: {
            ...campaign.agent_details,
            working_hours: {
              start: startTime,
              end: endTime,
            },
            cool_off: control._getWatch("campaignSettings.coolOffPeriod.hours"),
            number_of_retries: control._getWatch("campaignSettings.numberOfRetries"),
          },
          scheduled_start: startDate ? {
            date: startDate.toISOString(),
            time: startTime,
          } : campaign.scheduled_start,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update campaign settings');
      }

      const updatedCampaign = await response.json();
      onUpdateCampaign(updatedCampaign);
      toast.success("Campaign settings updated successfully");
    } catch (error) {
      toast.error("Failed to update campaign settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={errors.campaignSettings ? "border-red-500" : ""}>
      <Accordion type="single" collapsible>
        <AccordionItem value="campaign-settings" className="border-none">
          <CardHeader className="border-b">
            <AccordionTrigger className="hover:no-underline">
              <CardTitle>Campaign Settings</CardTitle>
            </AccordionTrigger>
          </CardHeader>
          <AccordionContent>
            <CardContent className="space-y-4 pt-4">
              <div className="text-sm text-gray-500 mb-4">
                Configure your campaign settings including working hours, cool-off period, and retry attempts.
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Campaign Start</Label>
                  <div className="flex items-center gap-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-[240px] justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={handleDateSelect}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Working Hours</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => handleTimeChange('start', e.target.value)}
                      className="w-32"
                    />
                    <span className="self-center">to</span>
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => handleTimeChange('end', e.target.value)}
                      className="w-32"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Cool-off Period</Label>
                  <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <Controller
                        control={control}
                        name="campaignSettings.coolOffPeriod.hours"
                        render={({ field }) => (
                          <Input 
                            type="number" 
                            placeholder="Hours" 
                            className="w-24"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => {
                              field.onChange(e);
                            }}
                          />
                        )}
                      />
                      <span className="text-sm text-muted-foreground">hours</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Controller
                        control={control}
                        name="campaignSettings.coolOffPeriod.days"
                        render={({ field }) => (
                          <Input 
                            type="number" 
                            placeholder="Days" 
                            className="w-24"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => {
                              field.onChange(e);
                            }}
                          />
                        )}
                      />
                      <span className="text-sm text-muted-foreground">days</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Number of Retries</Label>
                  <Controller
                    control={control}
                    name="campaignSettings.numberOfRetries"
                    render={({ field }) => (
                      <Input 
                        type="number" 
                        placeholder="3" 
                        className="w-32" 
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  type="button" 
                  onClick={handleSave}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
} 