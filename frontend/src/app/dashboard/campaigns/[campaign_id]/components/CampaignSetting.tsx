import { Control, Controller } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface CampaignSettingProps {
  control: Control<Record<string, unknown>>;
  errors: Record<string, unknown>;
  startTime: string;
  setStartTime: (value: string) => void;
  endTime: string;
  setEndTime: (value: string) => void;
}

export function CampaignSetting({
  control,
  errors,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
}: CampaignSettingProps) {
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
                  <Label>Working Hours</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-32"
                    />
                    <span className="self-center">to</span>
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-32"
                    />
                  </div>
                </div>

                <hr className="border-t" />

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
                          />
                        )}
                      />
                      <span className="text-sm text-muted-foreground">days</span>
                    </div>
                  </div>
                </div>

                <hr className="border-t" />

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
                      />
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
} 