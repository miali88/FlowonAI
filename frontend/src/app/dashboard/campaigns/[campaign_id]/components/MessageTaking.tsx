import { Control, Controller, useWatch, UseFormGetValues, UseFormSetValue } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { X, Loader2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { CampaignResponse } from "@/types/campaigns";
// Define the form values interface
export interface MessageTakingFormValues {
  messageTaking: {
    callerName: {
      required: boolean;
      alwaysRequested: boolean;
    };
    callerPhoneNumber: {
      required: boolean;
      automaticallyCaptured: boolean;
    };
    specificQuestions: Array<{
      question: string;
      required: boolean;
    }>;
    openingLine: string;
    closingLine: string;
  };
}

export interface MessageTakingProps {
  control: Control<MessageTakingFormValues>;
  errors: Record<string, unknown>;
  newQuestion: string;
  setNewQuestion: (value: string) => void;
  addQuestion: () => void;
  getValues: UseFormGetValues<MessageTakingFormValues>;
  setValue: UseFormSetValue<MessageTakingFormValues>;
  campaignId: string;
  campaign: CampaignResponse;
  onUpdate: (data: CampaignResponse) => void;
}

export function MessageTaking({
  control,
  errors,
  newQuestion,
  setNewQuestion,
  addQuestion,
  getValues,
  setValue,
  campaignId,
  campaign,
  onUpdate,
}: MessageTakingProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Watch for specific questions to render the list
  const specificQuestions = useWatch({
    control,
    name: "messageTaking.specificQuestions",
  });

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const messageTakingData = getValues("messageTaking");
      
      // First, update the campaign with message taking settings
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...campaign,
          message_taking: {
            ...campaign.message_taking,
            caller_name: {
              required: messageTakingData.callerName.required,
              always_requested: messageTakingData.callerName.alwaysRequested,
            },
            caller_phone_number: {
              required: messageTakingData.callerPhoneNumber.required,
              automatically_captured: messageTakingData.callerPhoneNumber.automaticallyCaptured,
            },
            opening_line: messageTakingData.openingLine,
            closing_line: messageTakingData.closingLine,
            questions: messageTakingData.specificQuestions.map(q => ({
              question: q.question,
              answered: false,
            })),
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update message taking settings');
      }

      const updatedCampaign = await response.json();
      
      // If campaign is started, update the assistant with new message taking settings
      if (updatedCampaign.status === "started" && updatedCampaign.vapi_assistant_id) {
        const assistantResponse = await fetch(`/api/campaigns/${campaignId}/assistant`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedCampaign),
        });

        if (!assistantResponse.ok) {
          const error = await assistantResponse.json();
          throw new Error(error.error || 'Failed to update campaign assistant');
        }

        const assistantData = await assistantResponse.json();
        if (!assistantData.success) {
          throw new Error(assistantData.message || 'Failed to update campaign assistant');
        }
      }

      // Update the local campaign data with the new message taking settings
      onUpdate({
        ...updatedCampaign,
        message_taking: {
          ...updatedCampaign.message_taking,
          caller_name: {
            required: messageTakingData.callerName.required,
            always_requested: messageTakingData.callerName.alwaysRequested,
          },
          caller_phone_number: {
            required: messageTakingData.callerPhoneNumber.required,
            automatically_captured: messageTakingData.callerPhoneNumber.automaticallyCaptured,
          },
        },
      });
      
      toast.success("Message taking settings updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update message taking settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add useEffect to update form values when campaign data changes
  useEffect(() => {
    if (campaign.message_taking) {
      // Only set values if they haven't been set yet
      const currentValues = getValues("messageTaking");
      if (!currentValues.callerName) {
        setValue("messageTaking.callerName.required", campaign.message_taking.caller_name?.required || false);
        setValue("messageTaking.callerName.alwaysRequested", campaign.message_taking.caller_name?.always_requested || false);
      }
      if (!currentValues.callerPhoneNumber) {
        setValue("messageTaking.callerPhoneNumber.required", campaign.message_taking.caller_phone_number?.required || false);
        setValue("messageTaking.callerPhoneNumber.automaticallyCaptured", campaign.message_taking.caller_phone_number?.automatically_captured || false);
      }
      if (!currentValues.openingLine) {
        setValue("messageTaking.openingLine", campaign.message_taking.opening_line || "");
      }
      if (!currentValues.closingLine) {
        setValue("messageTaking.closingLine", campaign.message_taking.closing_line || "");
      }
      if (!currentValues.specificQuestions?.length) {
        setValue("messageTaking.specificQuestions", campaign.message_taking.questions?.map(q => ({
          question: q.question,
          required: true,
        })) || []);
      }
    }
  }, [campaign, setValue, getValues]);

  return (
    <Card className={errors.messageTaking ? "border-red-500" : ""}>
      <Accordion type="single" collapsible>
        <AccordionItem value="message-taking" className="border-none">
          <CardHeader className="border-b">
            <AccordionTrigger className="hover:no-underline">
              <CardTitle>Message Taking</CardTitle>
            </AccordionTrigger>
          </CardHeader>
          <AccordionContent>
            <CardContent className="space-y-4 pt-4">
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
                    render={({ field }) => (
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
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                <div className="text-sm text-gray-500 mb-4">
                    Add the opening line and closing line of your message.
                </div>
                  <Label htmlFor="openingLine">Opening Line</Label>
                  <Controller
                    control={control}
                    name="messageTaking.openingLine"
                    render={({ field }) => (
                      <textarea
                        id="openingLine"
                        placeholder="Type your opening message here..."
                        {...field}
                        className="h-10 w-full border border-gray-100 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-gray-200 shadow-sm placeholder-gray-300"
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="closingLine">Closing Line</Label>
                  <Controller
                    control={control}
                    name="messageTaking.closingLine"
                    render={({ field }) => (
                      <textarea
                        id="closingLine"
                        placeholder="Type your closing message here..."
                        {...field}
                        className="h-10 w-full border border-gray-100 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-gray-200 shadow-sm placeholder-gray-300"
                      />
                    )}
                  />
                </div>

                <Separator />

                {/* Custom Questions Section */}
                <div>
                  <Label className="block mb-2">Specific Questions</Label>
                  <div className="text-sm text-gray-500 mb-4">
                    Add custom questions for Flowon to ask callers. All questions will be required.
                  </div>

                  {/* List of existing questions */}
                  <div className="space-y-3 mb-4">
                    {specificQuestions?.map((_, index) => (
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
                            const currentQuestions = getValues("messageTaking.specificQuestions") as unknown as Array<{ question: string; required: boolean }>;
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
                      disabled={!newQuestion.trim()}
                    >
                      <span className="mr-1">+</span> Add
                    </Button>
                  </div>
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