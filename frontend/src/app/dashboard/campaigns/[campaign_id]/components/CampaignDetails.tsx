import { useState, useEffect } from "react";
import { MessageTaking, MessageTakingFormValues } from "@/components/ui/message-taking";
import { CampaignSetting } from "./CampaignSetting";
import { useForm } from "react-hook-form";
import { Control } from "react-hook-form";
import { UseFormSetValue, UseFormGetValues } from "react-hook-form";
import { CampaignResponse } from "@/types/campaigns";
import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

interface CampaignFormValues extends MessageTakingFormValues {
  campaignSettings: {
    coolOffPeriod: {
      hours: number;
      days: number;
    };
    numberOfRetries: number;
  };
}

interface CampaignDetailsProps {
  campaignId: string;
  campaign: CampaignResponse;
  onUpdate: Dispatch<SetStateAction<CampaignResponse | null>>;
}

export function CampaignDetails({ campaignId, campaign, onUpdate }: CampaignDetailsProps) {
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [newQuestion, setNewQuestion] = useState("");
  const [scheduledStart, setScheduledStart] = useState<{ date: Date; time: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CampaignFormValues>({
    defaultValues: {
      messageTaking: {
        callerName: {
          required: false,
          alwaysRequested: false,
        },
        callerPhoneNumber: {
          required: false,
          automaticallyCaptured: false,
        },
        specificQuestions: [],
      },
      campaignSettings: {
        coolOffPeriod: {
          hours: undefined,
          days: undefined,
        },
        numberOfRetries: 3,
      },
    },
  });

  useEffect(() => {
    if (campaign.message_taking) {
      form.reset({
        messageTaking: {
          callerName: campaign.message_taking.opening_line ? {
            required: true,
            alwaysRequested: true,
          } : {
            required: false,
            alwaysRequested: false,
          },
          callerPhoneNumber: {
            required: false,
            automaticallyCaptured: true,
          },
          specificQuestions: campaign.message_taking.questions?.map(q => ({
            question: q.question,
            required: true,
          })) || [],
        },
        campaignSettings: {
          coolOffPeriod: {
            hours: campaign.agent_details?.cool_off || 0,
            days: 0,
          },
          numberOfRetries: campaign.agent_details?.number_of_retries || 3,
        },
      });

      // Set working hours from campaign data
      if (campaign.agent_details?.working_hours) {
        setStartTime(campaign.agent_details.working_hours.start);
        setEndTime(campaign.agent_details.working_hours.end);
      }

      // Set scheduled start if exists
      if (campaign.scheduled_start) {
        setScheduledStart({
          date: new Date(campaign.scheduled_start.date),
          time: campaign.scheduled_start.time,
        });
      }
    }
  }, [campaign, form]);

  useEffect(() => {
    if (scheduledStart) {
      const now = new Date();
      const startDateTime = new Date(scheduledStart.date);
      const [hours, minutes] = scheduledStart.time.split(':').map(Number);
      startDateTime.setHours(hours, minutes, 0, 0);

      if (now >= startDateTime && campaign.status !== 'started') {
        const startCampaign = async () => {
          try {
            const response = await fetch(`/api/campaigns/${campaignId}/status`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ status: 'started' }),
            });

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.error || 'Failed to start campaign');
            }

            const updatedCampaign = await response.json();
            onUpdate(updatedCampaign);
            toast.success("Campaign started successfully");
            setScheduledStart(null);
          } catch (error) {
            toast.error("Failed to start campaign");
          }
        };
        startCampaign();
      }
    }
  }, [scheduledStart, campaignId, campaign.status, onUpdate]);

  const addQuestion = async () => {
    if (newQuestion.trim()) {
      try {
        const currentQuestions = form.getValues("messageTaking.specificQuestions");
        const newQuestions = [...currentQuestions, { question: newQuestion.trim(), required: true }];
        
        const response = await fetch(`/api/campaigns/${campaignId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...campaign,
            message_taking: {
              ...campaign.message_taking,
              questions: newQuestions.map(q => ({
                question: q.question,
                answered: false,
              })),
            },
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to add question');
        }

        const updatedCampaign = await response.json();
        onUpdate(updatedCampaign);
        setNewQuestion("");
        toast.success("Question added successfully");
      } catch (error) {
        toast.error("Failed to add question");
      }
    }
  };

  const handleFormSubmit = async (data: CampaignFormValues) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...campaign,
          message_taking: {
            opening_line: data.messageTaking.callerName.required ? "Hello" : undefined,
            closing_line: "Thank you",
            questions: data.messageTaking.specificQuestions.map(q => ({
              question: q.question,
              answered: false,
            })),
          },
          agent_details: {
            cool_off: data.campaignSettings.coolOffPeriod.hours,
            number_of_retries: data.campaignSettings.numberOfRetries,
            working_hours: {
              start: startTime,
              end: endTime,
            },
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update campaign details');
      }

      const updatedCampaign = await response.json();
      onUpdate(updatedCampaign);
      toast.success("Campaign details updated successfully");
    } catch (error) {
      toast.error("Failed to update campaign details");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCampaignStartUpdate = (date: Date | undefined, time: string) => {
    if (date) {
      setScheduledStart({ date, time });
      toast.success(`Campaign will start on ${format(date, "PPP")} at ${time}`);
    }
  };

  // Auto-save when form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      if (Object.keys(form.formState.dirtyFields).length > 0) {
        form.handleSubmit(handleFormSubmit)();
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
      <MessageTaking
        control={form.control as unknown as Control<MessageTakingFormValues>}
        errors={form.formState.errors}
        newQuestion={newQuestion}
        setNewQuestion={setNewQuestion}
        addQuestion={addQuestion}
        getValues={form.getValues as unknown as UseFormGetValues<MessageTakingFormValues>}
        setValue={form.setValue as unknown as UseFormSetValue<MessageTakingFormValues>}
      />
      
      <CampaignSetting
        campaignId={campaignId}
        control={form.control as unknown as Control<Record<string, unknown>>}
        errors={form.formState.errors}
        startTime={startTime}
        setStartTime={setStartTime}
        endTime={endTime}
        setEndTime={setEndTime}
        onUpdate={handleCampaignStartUpdate}
        defaultStartDate={scheduledStart?.date}
        defaultWorkingHours={campaign.agent_details?.working_hours}
      />
    </form>
  );
} 