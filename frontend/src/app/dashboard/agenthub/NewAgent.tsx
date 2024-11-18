import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MultiSelect } from "./multiselect_newagent"
import { useUser } from "@clerk/nextjs";
import { Loader2, ChevronLeft } from "lucide-react";
import { AgentFeatures } from './AgentFeatures';
import styles from './NewAgent.module.css';
import { Switch } from "@/components/ui/switch"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const LANGUAGE_OPTIONS = [
  { id: "en-GB", name: "English GB" },
  { id: "en-US", name: "English US" },
  { id: "fr", name: "French" },
  { id: "de", name: "German" },
  { id: "ar", name: "Arabic" },
  { id: "nl", name: "Dutch" },
  { id: "zh", name: "Mandarin" },
];

const VOICE_OPTIONS = {
  "en-GB": [
    { id: "voice1", name: "Alex K", file: "/voices/AlexK.wav" },
    { id: "voice2", name: "Beatrice W", file: "/voices/BeatriceW.wav" },
    { id: "voice3", name: "Felicity A", file: "/voices/FelicityA.wav" },
  ],
  "en-US": [
    { id: "us-voice1", name: "US Voice 1", file: "/voices/USVoice1.wav" },
    { id: "us-voice2", name: "US Voice 2", file: "/voices/USVoice2.wav" },
  ],
  "fr": [
    { id: "ab7c61f5-3daa-47dd-a23b-4ac0aac5f5c3", name: "Male", file: "/voices/cartesia_french1.wav" },
    { id: "a249eaff-1e96-4d2c-b23b-12efa4f66f41", name: "Female", file: "/voices/cartesia_french2.wav" },
  ],
  // Add placeholder voices for other languages
  "de": [{ id: "de-voice1", name: "German Voice 1", file: "/voices/cartesia_german1.wav" }],
  "ar": [{ id: "ar-voice1", name: "Arabic Voice 1", file: "/voices/cartesia_arabic1.wav" }],
  "nl": [{ id: "nl-voice1", name: "Dutch Voice 1", file: "/voices/cartesia_dutch1.wav" }],
  "zh": [{ id: "zh-voice1", name: "Mandarin Voice 1", file: "/voices/cartesia_mandarin1.wav" }],
};

// Update the FormData interface to match DB schema
interface FormData {
  agentName: string;
  agentPurpose: string;
  instructions: string;
  dataSource: Array<{
    id: string | number;
    title: string;
    data_type: string;
  }>;  // Changed from string to array of objects
  openingLine: string;
  voice: string;
  language: string;
  features: {
    notifyOnInterest: boolean;
    collectWrittenInformation: boolean;
    transferCallToHuman: boolean;
    bookCalendarSlot: boolean;
    prospects: boolean;
    form: boolean;
    callTransfer: boolean;
    appointmentBooking: boolean
  };
}

interface NewAgentProps {
  knowledgeBaseItems?: Array<{
    id: string | number;
    title: string;
    data_type: string;
  }>;
}

// Format voice options to match MultiSelect interface
const getVoiceOptionsFormatted = (voices: typeof VOICE_OPTIONS[keyof typeof VOICE_OPTIONS]) => {
  return voices.map(voice => ({
    id: voice.id,
    title: voice.name,
    file: voice.file // Keep the file property for voice samples
  }));
};

const AGENT_PURPOSES = {
  "prospecting": {
    title: "Lead Generation & Prospecting",
    description: "Create an agent that qualifies leads and collects prospect information",
    features: {
      notifyOnInterest: true,
      collectWrittenInformation: true,
      form: true,
      prospects: true
    }
  },
  "appointment-booking": {
    title: "Appointment Booking",
    description: "Create an agent that manages your calendar and books appointments",
    features: {
      bookCalendarSlot: true,
      appointmentBooking: true
    }
  },
  "question-answer": {
    title: "Question & Answer",
    description: "Create an agent that answers questions based on your knowledge base",
    features: {
      collectWrittenInformation: false,
      transferCallToHuman: true
    }
  },
  "customer-service": {
    title: "Customer Service",
    description: "Create an agent that handles customer inquiries and support",
    features: {
      transferCallToHuman: true,
      callTransfer: true
    }
  }
};

export function NewAgent({ knowledgeBaseItems = [], onAgentCreated }: NewAgentProps) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'purpose' | 'details'>('purpose');
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    agentName: '',
    agentPurpose: '',
    instructions: '',
    dataSource: [],
    openingLine: '',
    voice: '',
    language: '',
    features: {
      notifyOnInterest: false,
      collectWrittenInformation: false,
      transferCallToHuman: false,
      bookCalendarSlot: false,
      prospects: false,
      form: false,
      callTransfer: false,
      appointmentBooking: false
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en-GB");
  const [availableVoices, setAvailableVoices] = useState(VOICE_OPTIONS["en-GB"]);
  const [agentFeatures, setAgentFeatures] = useState({});
  const [availableVoicesFormatted, setAvailableVoicesFormatted] = useState(
    getVoiceOptionsFormatted(VOICE_OPTIONS["en-GB"])
  );

  // Move state updates to useEffect
  useEffect(() => {
    console.log('Knowledge base items:', knowledgeBaseItems);
  }, [knowledgeBaseItems]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSelectChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleVoiceChange = (value: string) => {
    setSelectedVoice(value);
    handleSelectChange("voice", value);
  };

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    handleSelectChange("language", value);
    const newVoices = VOICE_OPTIONS[value as keyof typeof VOICE_OPTIONS] || [];
    setAvailableVoices(newVoices);
    setAvailableVoicesFormatted(getVoiceOptionsFormatted(newVoices));
    setSelectedVoice(""); // Reset voice selection when language changes
  };

  const playVoiceSample = (voiceId: string, file: string) => {
    if (playingVoiceId === voiceId) {
      // If the clicked voice is currently playing, stop it
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPlayingVoiceId(null);
      return;
    }

    console.log("Attempting to play:", file);
    
    // If there's already an audio playing, stop it
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Create a new Audio instance or reuse the existing one
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    audioRef.current.src = file;
    audioRef.current.play()
      .then(() => {
        console.log("Audio started playing");
        setPlayingVoiceId(voiceId);
      })
      .catch(error => {
        console.error("Error playing audio:", error);
        setPlayingVoiceId(null);
      });

    // Add an event listener for when the audio finishes playing
    audioRef.current.onended = () => {
      console.log("Audio finished playing");
      setPlayingVoiceId(null);
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    setIsLoading(true);
    setResponseMessage("");

    try {
      const dataToSend = { 
        ...formData, 
        userId: user.id,
        features: agentFeatures 
      };
      
      if (dataToSend.dataSource === "all") {
        delete dataToSend.tag;
      }

      const response = await fetch(`${API_BASE_URL}/livekit/new_agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        setResponseMessage('Agent created successfully.');
        // Call the callback to refresh agents
        onAgentCreated?.();
        // Close the dialog after a short delay
        setTimeout(() => {
          setIsOpen(false);
        }, 1500);
      } else {
        setResponseMessage('Failed to create agent');
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      setResponseMessage('Error creating agent');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurposeSelect = (purpose: string) => {
    setSelectedPurpose(purpose);
    setFormData(prev => ({
      ...prev,
      agentPurpose: purpose,
      features: {
        ...prev.features,
        ...AGENT_PURPOSES[purpose as keyof typeof AGENT_PURPOSES].features
      }
    }));
    setStep('details');
  };

  const handleBack = () => {
    setStep('purpose');
    setSelectedPurpose(null);
  };

  // Convert your existing options to the Item format
  const AGENT_PURPOSE_OPTIONS = [
    { id: "prospecting", title: "Prospecting" },
    { id: "onboarding", title: "Onboarding" },
    { id: "receptionist", title: "Receptionist" },
    { id: "question-answer", title: "Question & Answer" },
    { id: "customer-service", title: "Customer Service" },
    { id: "appointment-booking", title: "Appointment Booking" },
  ];

  const LANGUAGE_OPTIONS_FORMATTED = LANGUAGE_OPTIONS.map(lang => ({
    id: lang.id,
    title: lang.name,
  }));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Create New Agent</Button>
      </DialogTrigger>
      <DialogContent 
        className={`
          ${styles.glassCard}
          ${step === 'purpose' ? 'sm:max-w-[600px]' : 'sm:max-w-[425px]'}
        `}
      >
        {step === 'purpose' ? (
          <div className="space-y-4">
            <DialogHeader className="text-center pb-4">
              <DialogTitle>Select Agent Purpose</DialogTitle>
              <DialogDescription>
                Choose the main purpose for your agent
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 px-2">
              {Object.entries(AGENT_PURPOSES).map(([key, purpose]) => (
                <Button
                  key={key}
                  variant="outline"
                  onClick={() => handlePurposeSelect(key)}
                  className="w-full h-auto p-4 flex flex-col items-start space-y-2 border border-gray-600 hover:border-gray-400 transition-colors"
                >
                  <span className="font-semibold text-base">{purpose.title}</span>
                  <span className="text-sm text-muted-foreground text-left">{purpose.description}</span>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          // Agent Details Form
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div>
                  <DialogTitle>{AGENT_PURPOSES[selectedPurpose as keyof typeof AGENT_PURPOSES].title}</DialogTitle>
                  <DialogDescription>
                    Configure your {AGENT_PURPOSES[selectedPurpose as keyof typeof AGENT_PURPOSES].title.toLowerCase()} agent
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            {/* Common fields */}
            <div className="grid gap-4 py-4">
              {/* Agent Name */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="agentName" className="text-right text-foreground dark:text-gray-200">
                  Agent Name
                </Label>
                <Input
                  id="agentName"
                  placeholder="Enter agent name"
                  className="col-span-3 bg-transparent text-foreground dark:text-gray-200 border-gray-600"
                  value={formData.agentName}
                  onChange={handleInputChange}
                />
              </div>
              {/* Data Source */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dataSource" className="text-right text-foreground">
                  Data Source
                </Label>
                <div className="col-span-3">
                  <MultiSelect 
                    items={[
                      { id: 'all', title: 'All Knowledge Base Items', data_type: 'all' },
                      ...(Array.isArray(knowledgeBaseItems) ? knowledgeBaseItems : [])
                    ]}
                    selectedItems={formData.dataSource}
                    onChange={(selectedItems) => {
                      // If "All" is selected, clear other selections
                      const newSelection = selectedItems.some(item => item.id === 'all') 
                        ? [{ id: 'all', title: 'All Knowledge Base Items', data_type: 'all' }]
                        : selectedItems;
                      
                      setFormData(prev => ({
                        ...prev,
                        dataSource: newSelection
                      }));
                    }}
                    multiSelect={true}  // Enable multiselect
                  />
                </div>
              </div>
              {/* Instructions */}
              {/* <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="instructions" className="text-right text-foreground">
                  Instructions
                </Label>
                <Input
                  id="instructions"
                  placeholder="Enter instructions for the agent"
                  className="col-span-3 bg-background text-foreground border-input"
                  value={formData.instructions}
                  onChange={handleInputChange}
                />
              </div> */}
              {/* Opening Line */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="openingLine" className="text-right text-foreground dark:text-gray-200">
                  Opening Line
                </Label>
                <Input
                  id="openingLine"
                  placeholder="Enter opening line"
                  className="col-span-3 bg-transparent text-foreground dark:text-gray-200 border-gray-600"
                  value={formData.openingLine}
                  onChange={handleInputChange}
                />
              </div>
              {/* Language Selection */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="language" className="text-right text-foreground dark:text-gray-200">
                  Language
                </Label>
                <div className="col-span-3">
                  <MultiSelect
                    items={LANGUAGE_OPTIONS_FORMATTED}
                    selectedItems={selectedLanguage ? [{ id: selectedLanguage, title: LANGUAGE_OPTIONS.find(lang => lang.id === selectedLanguage)?.name || '' }] : []}
                    onChange={(items) => handleLanguageChange(items[0]?.id as string)}
                    placeholder="Select a language"
                    multiSelect={false}
                  />
                </div>
              </div>
              {/* Voice Selection */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="voice" className="text-right text-foreground dark:text-gray-200">
                  Voice
                </Label>
                <div className="col-span-3">
                  <MultiSelect
                    items={availableVoicesFormatted}
                    selectedItems={selectedVoice ? [availableVoicesFormatted.find(voice => voice.id === selectedVoice)!] : []}
                    onChange={(items) => handleVoiceChange(items[0]?.id as string)}
                    placeholder="Select a voice"
                    multiSelect={false}
                  />
                </div>
              </div>
              {/* Voice Sample Buttons */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                {availableVoicesFormatted.map((voice) => (
                  <Button
                    key={voice.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => playVoiceSample(voice.id as string, voice.file!)}
                    className={`${selectedVoice === voice.id ? "border-primary" : ""} ${
                      playingVoiceId === voice.id ? "bg-primary text-primary-foreground" : ""
                    }`}
                  >
                    {playingVoiceId === voice.id ? "Stop" : `Play ${voice.title}`}
                  </Button>
                ))}
              </div>
            </div>
            <div className="border-t border-border mt-4 pt-4">
              <AgentFeatures
                selectedAgent={formData}
                setSelectedAgent={(agent) => {
                  console.log("Updated agent:", agent);
                  setFormData(prev => ({
                    ...prev,
                    features: {
                      ...prev.features,
                      ...agent.features
                    }
                  }));
                }}
                handleSaveFeatures={async (features) => {
                  console.log("Saving features:", features);
                  setFormData(prev => ({
                    ...prev,
                    features: {
                      ...prev.features,
                      ...features
                    }
                  }));
                }}
              />
            </div>
            <DialogFooter className="mt-8">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Agent'
                )}
              </Button>
            </DialogFooter>
            {responseMessage && (
              <div className={`mt-4 text-center ${
                responseMessage.includes('successfully') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {responseMessage}
              </div>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}