// ✅ Updated: CampaignDetails.tsx
import { useState, useEffect } from "react";
import { CampaignSetting } from "./CampaignSetting";
import { MessageTaking, MessageTakingFormValues } from "./MessageTaking";
import { useForm } from "react-hook-form";
import { Control, UseFormSetValue, UseFormGetValues } from "react-hook-form";
import { CampaignResponse } from "@/types/campaigns";
import { Dispatch, SetStateAction } from "react";

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
  const [campaignStartDate, setCampaignStartDate] = useState<Date | undefined>(
    campaign.scheduled_start?.date ? new Date(campaign.scheduled_start.date) : undefined
  );

  const form = useForm<CampaignFormValues>({
    defaultValues: {
      messageTaking: {
        ask_caller_name: false,
        ask_caller_phone_number: false,
        specificQuestions: [],
        openingLine: "",
        closingLine: "",
      },
      campaignSettings: {
        coolOffPeriod: { hours: 0, days: 0 },
        numberOfRetries: 3,
      },
    },
  });

  useEffect(() => {
    if (campaign) {
      form.reset({
        messageTaking: {
          ask_caller_name: campaign.message_taking?.ask_caller_name || false,
          ask_caller_phone_number: campaign.message_taking?.ask_caller_phone_number || false,
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

      if (campaign.agent_details?.working_hours) {
        setStartTime(campaign.agent_details.working_hours.start);
        setEndTime(campaign.agent_details.working_hours.end);
      }

      if (campaign.agent_details?.campaign_start_date) {
        setCampaignStartDate(new Date(campaign.agent_details.campaign_start_date));
      } else if (campaign.scheduled_start?.date) {
        setCampaignStartDate(new Date(campaign.scheduled_start.date));
      }
    }
  }, [campaign, form]);

  return (
    <div className="space-y-6">
      <MessageTaking
        control={form.control as unknown as Control<MessageTakingFormValues>}
        errors={form.formState.errors.messageTaking || {}}
        newQuestion={newQuestion}
        setNewQuestion={setNewQuestion}
        addQuestion={() => {
          const current = form.getValues("messageTaking.specificQuestions") || [];
          form.setValue("messageTaking.specificQuestions", [...current, { question: newQuestion.trim(), required: true }]);
          setNewQuestion("");
        }}
        getValues={form.getValues as unknown as UseFormGetValues<MessageTakingFormValues>}
        setValue={form.setValue as unknown as UseFormSetValue<MessageTakingFormValues>}
        campaignId={campaignId}
        campaign={campaign}
        onUpdate={onUpdate}
      />

      <CampaignSetting
        errors={form.formState.errors}
        startTime={startTime}
        setStartTime={setStartTime}
        endTime={endTime}
        setEndTime={setEndTime}
        onUpdate={setCampaignStartDate}
        defaultStartDate={campaignStartDate}
        defaultWorkingHours={campaign.agent_details?.working_hours}
        campaign={campaign}
        onUpdateCampaign={onUpdate}
      />
    </div>
  );
}
