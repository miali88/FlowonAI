import React, { useState, useRef } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

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

export function NewAgent() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [dataSource, setDataSource] = useState<string>("");
  const [formData, setFormData] = useState({
    agentName: "",
    agentPurpose: "",
    dataSource: "",
    tag: "",
    openingLine: "",
    voice: "",
    instructions: "",
    language: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [availableVoices, setAvailableVoices] = useState(VOICE_OPTIONS["en-GB"]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (field === "dataSource") {
      setDataSource(value);
    }
  };

  const handleVoiceChange = (value: string) => {
    setSelectedVoice(value);
    handleSelectChange("voice", value);
  };

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    handleSelectChange("language", value);
    setAvailableVoices(VOICE_OPTIONS[value as keyof typeof VOICE_OPTIONS] || []);
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
      const dataToSend = { ...formData, userId: user.id };
      
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
        setResponseMessage('Agent created successfully. Please refresh the page.');
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsOpen(true)}>Create New Agent</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background text-foreground dark:bg-gray-800 dark:text-gray-200">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-foreground dark:text-gray-200">Create New Agent</DialogTitle>
            <DialogDescription className="text-muted-foreground dark:text-gray-400">
              Fill in the details to create a new agent. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Agent Name */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agentName" className="text-right text-foreground dark:text-gray-200">
                Agent Name
              </Label>
              <Input
                id="agentName"
                placeholder="Enter agent name"
                className="col-span-3 bg-background text-foreground dark:bg-gray-700 dark:text-gray-200 border-input"
                value={formData.agentName}
                onChange={handleInputChange}
              />
            </div>
            {/* Agent Purpose */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agentPurpose" className="text-right text-foreground dark:text-gray-200">
                Agent Purpose
              </Label>
              <Select onValueChange={(value) => handleSelectChange("agentPurpose", value)}>
                <SelectTrigger className="col-span-3 bg-background text-foreground dark:bg-gray-700 dark:text-gray-200 border-input">
                  <SelectValue placeholder="Select agent purpose" />
                </SelectTrigger>
                <SelectContent className="bg-background text-foreground dark:bg-gray-700 dark:text-gray-200">
                  <SelectItem value="prospecting">Prospecting</SelectItem>
                  <SelectItem value="question-answer">Question & Answer</SelectItem>
                  <SelectItem value="customer-service">Customer Service</SelectItem>
                  <SelectItem value="product-recommendation">Product Recommendation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Data Source */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dataSource" className="text-right text-foreground">
                Data Source
              </Label>
              <Select onValueChange={(value) => handleSelectChange("dataSource", value)}>
                <SelectTrigger className="col-span-3 bg-background text-foreground border-muted-foreground">
                  <SelectValue placeholder="Select data source" />
                </SelectTrigger>
                <SelectContent className="bg-background text-foreground">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="tagged">Items with tag...</SelectItem>
                  <SelectItem value="natural-language">Describe using natural language</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Conditional Tag Input */}
            {dataSource === "tagged" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tag" className="text-right text-foreground">
                  Tag
                </Label>
                <Input
                  id="tag"
                  placeholder="Enter tag"
                  className="col-span-3 bg-background text-foreground border-muted-foreground"
                  value={formData.tag}
                  onChange={handleInputChange}
                />
              </div>
            )}
            {/* Instructions */}
            <div className="grid grid-cols-4 items-center gap-4">
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
            </div>
            {/* Opening Line */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="openingLine" className="text-right text-foreground">
                Opening Line
              </Label>
              <Input
                id="openingLine"
                placeholder="Enter opening line"
                className="col-span-3 bg-background text-foreground border-muted-foreground"
                value={formData.openingLine}
                onChange={handleInputChange}
              />
            </div>
            {/* Language Selection */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="language" className="text-right text-foreground">
                Language
              </Label>
              <div className="col-span-3">
                <Select onValueChange={handleLanguageChange} value={selectedLanguage}>
                  <SelectTrigger className="w-full bg-background text-foreground dark:bg-gray-700 dark:text-gray-200 border-input">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent className="bg-background text-foreground dark:bg-gray-700 dark:text-gray-200">
                    {LANGUAGE_OPTIONS.map((language) => (
                      <SelectItem key={language.id} value={language.id}>
                        {language.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Voice Selection */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="voice" className="text-right text-foreground">
                Voice
              </Label>
              <div className="col-span-3">
                <Select onValueChange={handleVoiceChange} value={selectedVoice}>
                  <SelectTrigger className="w-full bg-background text-foreground dark:bg-gray-700 dark:text-gray-200 border-input">
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent className="bg-background text-foreground dark:bg-gray-700 dark:text-gray-200">
                    {availableVoices.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        {voice.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Voice Sample Buttons */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              {availableVoices.map((voice) => (
                <Button
                  key={voice.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => playVoiceSample(voice.id, voice.file)}
                  className={`${selectedVoice === voice.id ? "border-primary" : ""} ${
                    playingVoiceId === voice.id ? "bg-primary text-primary-foreground" : ""
                  }`}
                >
                  {playingVoiceId === voice.id ? "Stop" : `Play ${voice.name}`}
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground dark:bg-blue-600 dark:text-white">
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
      </DialogContent>
    </Dialog>
  )
}
