export interface TrainingSource {
  googleBusinessProfile?: string;
  businessWebsite?: string;
}

export interface BusinessInformation {
  businessName: string;
  businessOverview: string;
  primaryBusinessAddress: string;
  primaryBusinessPhone: string;
  coreServices: string[];
  businessHours: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
}

export interface MessageTaking {
  callerName: {
    required: boolean;
    alwaysRequested: boolean;
  };
  callerPhoneNumber: {
    required: boolean;
    automaticallyCaptured: boolean;
  };
  specificQuestions: {
    question: string;
    required: boolean;
  }[];
}

export interface CallNotifications {
  emailNotifications: {
    enabled: boolean;
    email: string;
  };
  smsNotifications: {
    enabled: boolean;
    phoneNumber: string;
  };
}

export interface QuickSetupData {
  trainingSources: TrainingSource;
  businessInformation: BusinessInformation;
  messageTaking: MessageTaking;
  callNotifications: CallNotifications;
}

export type SetupStep = "quick-setup" | "talk-to-rosie" | "launch";
