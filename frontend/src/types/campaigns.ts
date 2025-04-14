export interface MessageQuestion {
  question: string;
  answered: boolean;
}

export interface MessageTaking {
  opening_line: string;
  closing_line: string;
  questions: Array<{
    question: string;
    answered: boolean;
  }>;
  caller_name?: {
    required: boolean;
    always_requested: boolean;
  };
  caller_phone_number?: {
    required: boolean;
    automatically_captured: boolean;
  };
}

export interface WorkingHours {
  start: string;
  end: string;
}

export interface ScheduledStart {
  date: string;
  time: string;
}

export interface AgentDetails {
  cool_off?: number;
  number_of_retries?: number;
  working_hours?: WorkingHours;
  campaign_start_date?: string;
}

export interface ClientStatus {
  status: string;
  number_of_calls: number;
  call_id?: string;
}

export interface PersonalDetails {
  age?: number;
  occupation?: string;
  best_time_to_call?: string;
  interested_in?: string;
  [key: string]: string | number | undefined;
}

export interface Client {
  name: string;
  phone_number: string;
  language?: string;
  personal_details?: PersonalDetails;
  status: ClientStatus;
}

export interface BusinessInformation {
  name?: string;
  description?: string;
  website?: string;
  industry?: string;
  [key: string]: string | undefined;
}

export interface CampaignBase {
  name: string;
  business_information?: BusinessInformation;
  message_taking?: MessageTaking;
  agent_details?: AgentDetails;
  clients?: Client[];
  status: string;
  user_text_file_id?: string;
  user_web_data_id?: string;
  scheduled_start?: ScheduledStart;
}

export interface CampaignCreate extends CampaignBase {}

export interface CampaignUpdate {
  name?: string;
  business_information?: BusinessInformation;
  message_taking?: MessageTaking;
  agent_details?: AgentDetails;
  clients?: Client[];
  status?: string;
  user_text_file_id?: string[];
  user_web_data_id?: string[];
  scheduled_start?: ScheduledStart;
}

export interface CampaignResponse extends CampaignBase {
  id: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
  vapi_assistant_id?: string;
} 