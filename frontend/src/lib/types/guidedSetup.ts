export interface TradeInSource {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
}

export interface BusinessInformation {
  businessName: string;
  industry: string;
  website: string;
  description: string;
}

export interface MessageTracking {
  enabled: boolean;
  channels: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
}

export interface CallNotification {
  enabled: boolean;
  notifyEmail: string;
  notifySMS: string;
}

export interface GuidedSetupData {
  userId: string;
  tradeInSources: TradeInSource[];
  businessInformation: BusinessInformation;
  messageTracking: MessageTracking;
  callNotifications: CallNotification;
  completedSteps: {
    tradeInSources: boolean;
    businessInformation: boolean;
    messageTracking: boolean;
    callNotifications: boolean;
  };
  currentStep: 'tradeInSources' | 'businessInformation' | 'messageTracking' | 'callNotifications' | 'completed';
}