// Updated CampaignSetting.tsx
import { FieldErrors } from "react-hook-form";
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
  startTime: string;
  setStartTime: (time: string) => void;
  endTime: string;
  setEndTime: (time: string) => void;
  onUpdate: (date: Date | undefined) => void;
  defaultStartDate?: Date;
  defaultWorkingHours?: {
    start: string;
    end: string;
  };
  campaign: CampaignResponse;
  onUpdateCampaign: (data: CampaignResponse) => void;
  errors: FieldErrors;
}

export function CampaignSetting({
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  onUpdate,
  defaultStartDate,
  defaultWorkingHours,
  campaign,
  onUpdateCampaign,
  errors,
}: CampaignSettingProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(defaultStartDate);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coolOff, setCoolOff] = useState<number>(campaign?.agent_details?.cool_off || 1);
  const [retries, setRetries] = useState<number>(campaign?.agent_details?.number_of_retries || 3);
  const [isValidTime, setIsValidTime] = useState({ start: true, end: true });

  useEffect(() => {
    // Check both possible date sources
    if (campaign?.scheduled_start?.date) {
      setStartDate(new Date(campaign.scheduled_start.date));
    } else if (campaign?.agent_details?.campaign_start_date) {
      setStartDate(new Date(campaign.agent_details.campaign_start_date));
    }

    // Set working hours from agent_details
    if (campaign?.agent_details?.working_hours) {
      const { start, end } = campaign.agent_details.working_hours;
      setStartTime(start);
      setEndTime(end);
      setIsValidTime({
        start: validateTime(start),
        end: validateTime(end)
      });
    }

    // Set other agent details
    if (campaign?.agent_details) {
      setCoolOff(campaign.agent_details.cool_off || 1);
      setRetries(campaign.agent_details.number_of_retries || 3);
    }
  }, [campaign]);

  useEffect(() => {
    if (defaultWorkingHours) {
      setStartTime(defaultWorkingHours.start);
      setEndTime(defaultWorkingHours.end);
    }
  }, [defaultWorkingHours]);

  const validateTime = (time: string): boolean => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  const handleTimeChange = (type: 'start' | 'end', value: string) => {
    const isValid = validateTime(value);
    setIsValidTime(prev => ({ ...prev, [type]: isValid }));
    if (type === 'start') {
      setStartTime(value);
    } else {
      setEndTime(value);
    }
  };

  const handleSave = async () => {
    if (!startDate) {
      toast.error("Please select a start date");
      return;
    }

    if (!isValidTime.start || !isValidTime.end) {
      toast.error("Please enter valid working hours in HH:MM format");
      return;
    }

    // Validate that end time is after start time
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    if (end <= start) {
      toast.error("End time must be after start time");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Saving campaign settings:", {
        startTime,
        endTime,
        startDate,
        coolOff,
        retries
      });

      // Prepare the update data with all fields
      const updateData = {
        agent_details: {
          working_hours: {
            start: startTime,
            end: endTime
          },
          campaign_start_date: startDate.toISOString(),
          cool_off: coolOff,
          number_of_retries: retries
        }
      };

      console.log("Sending update:", updateData);

      const response = await fetch(`/api/campaigns/${campaign.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Failed to update campaign settings");
      }

      const updatedCampaign: CampaignResponse = await response.json();
      console.log("Updated campaign response:", updatedCampaign);
      
      // Validate the response and update all local state
      if (!updatedCampaign.agent_details) {
        console.error("Agent details missing from response:", updatedCampaign);
        throw new Error("Agent details not found in updated campaign response");
      }

      const { working_hours, cool_off, number_of_retries, campaign_start_date } = updatedCampaign.agent_details;

      // Update all local state with the response data
      if (working_hours) {
        setStartTime(working_hours.start);
        setEndTime(working_hours.end);
      }
      if (cool_off !== undefined) {
        setCoolOff(cool_off);
      }
      if (number_of_retries !== undefined) {
        setRetries(number_of_retries);
      }
      if (campaign_start_date) {
        const newStartDate = new Date(campaign_start_date);
        setStartDate(newStartDate);
        onUpdate(newStartDate);
      }
      
      // Update parent component
      onUpdateCampaign(updatedCampaign);
      toast.success("Campaign settings updated successfully");
    } catch (error: unknown) {
      console.error("Error updating campaign settings:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update campaign settings";
      toast.error(errorMessage);
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
                            "w-42 justify-start text-left font-normal",
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
                          onSelect={(date) => setStartDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Working Hours</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="time"
                        value={startTime}
                        onChange={(e) => handleTimeChange('start', e.target.value)}
                        className={cn(
                          "w-32 text-center",
                          !isValidTime.start && 'border-red-500'
                        )}
                      />
                      <span className="text-sm text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={endTime}
                        onChange={(e) => handleTimeChange('end', e.target.value)}
                        className={cn(
                          "w-32 text-center",
                          !isValidTime.end && 'border-red-500'
                        )}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Cool-off Period (hours)</Label>
                  <p className="text-sm text-gray-500 mb-4">
                    Minimum time between retry attempts for failed calls
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={coolOff}
                      onChange={(e) => setCoolOff(parseInt(e.target.value) || 1)}
                      className="w-32 text-center"
                    />
                    <span className="text-sm text-muted-foreground">hours</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Number of Retries</Label>
                  <p className="text-sm text-gray-500 mb-4">
                    Maximum number of retry attempts for failed calls (0-10)
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={retries}
                      onChange={(e) => setRetries(parseInt(e.target.value) || 0)}
                      className="w-32 text-center"
                    />
                    <span className="text-sm text-muted-foreground">attempts</span>
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
              </div>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
