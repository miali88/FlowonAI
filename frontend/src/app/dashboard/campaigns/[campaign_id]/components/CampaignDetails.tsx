import { useState } from "react";
import { MessageTaking, MessageTakingFormValues } from "@/components/ui/message-taking";
import { CampaignSetting } from "./CampaignSetting";
import { useForm } from "react-hook-form";
import { Control } from "react-hook-form";
import { UseFormSetValue, UseFormGetValues } from "react-hook-form";

interface CampaignFormValues extends MessageTakingFormValues {
  campaignSettings: {
    coolOffPeriod: {
      hours: number;
      days: number;
    };
    numberOfRetries: number;
  };
}

export function CampaignDetails() {
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [newQuestion, setNewQuestion] = useState("");

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

  const addQuestion = () => {
    if (newQuestion.trim()) {
      const currentQuestions = form.getValues("messageTaking.specificQuestions");
      form.setValue("messageTaking.specificQuestions", [
        ...currentQuestions,
        { question: newQuestion.trim(), required: true },
      ]);
      setNewQuestion("");
    }
  };

  return (
    <div className="space-y-6">
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
        control={form.control as unknown as Control<Record<string, unknown>>}
        errors={form.formState.errors}
        startTime={startTime}
        setStartTime={setStartTime}
        endTime={endTime}
        setEndTime={setEndTime}
      />
    </div>
  );
} 