import { useState, useEffect } from "react";
import { CampaignSetting } from "./CampaignSetting";
import { MessageTaking, MessageTakingFormValues } from "./MessageTaking";
import { useForm } from "react-hook-form";
import { Control } from "react-hook-form";
import { UseFormSetValue, UseFormGetValues } from "react-hook-form";
import { CampaignResponse } from "@/types/campaigns";
import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

interface CampaignFormValues {
  messageTaking: MessageTakingFormValues['messageTaking'];
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
        openingLine: "",
        closingLine: "",
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
    if (campaign) {
      form.reset({
        messageTaking: {
          callerName: {
            required: false,
            alwaysRequested: false,
          },
          callerPhoneNumber: {
            required: false,
            automaticallyCaptured: false,
          },
          specificQuestions: campaign.message_taking?.questions?.map(q => ({ question: q.question, required: true })) || [],
          openingLine: campaign.message_taking?.opening_line || "",
          closingLine: campaign.message_taking?.closing_line || "",
        },
        campaignSettings: {
          coolOffPeriod: {
            hours: campaign.agent_details?.cool_off || 0,
            days: 0,
          },
          numberOfRetries: campaign.agent_details?.number_of_retries || 3,
        },
      });
    }
  }, [campaign, form]);

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
          openingLine: campaign.message_taking.opening_line || "",
          closingLine: campaign.message_taking.closing_line || "",
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

  const handleCampaignStartUpdate = (date: Date | undefined, time: string) => {
    if (date) {
      setScheduledStart({ date, time });
      toast.success(`Campaign will start on ${format(date, "PPP")} at ${time}`);
    }
  };

  return (
    <div className="space-y-6">
      <MessageTaking
        control={form.control as unknown as Control<MessageTakingFormValues>}
        errors={form.formState.errors.messageTaking || {}}
        newQuestion={newQuestion}
        setNewQuestion={setNewQuestion}
        addQuestion={() => {
          const currentQuestions = form.getValues("messageTaking.specificQuestions") || [];
          form.setValue("messageTaking.specificQuestions", [
            ...currentQuestions,
            { question: newQuestion.trim(), required: true },
          ]);
          setNewQuestion("");
        }}
        getValues={form.getValues as unknown as UseFormGetValues<MessageTakingFormValues>}
        setValue={form.setValue as unknown as UseFormSetValue<MessageTakingFormValues>}
        campaignId={campaignId}
        campaign={campaign}
        onUpdate={onUpdate}
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
        campaign={campaign}
        onUpdateCampaign={onUpdate}
      />
    </div>
  );
} 