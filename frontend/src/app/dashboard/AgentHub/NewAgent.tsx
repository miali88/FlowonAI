import React, { useState, useRef, useEffect } from "react";
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
import { Loader2 } from "lucide-react"; // Import Loader2 icon

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Add this constant at the top of your file, outside the component
const VOICE_OPTIONS = [
  { id: "voice1", name: "Alex K", file: "/voices/Alex K.mp3" },
  { id: "voice2", name: "Beatrice W", file: "/voices/Beatrice W.mp3" },
  { id: "voice3", name: "Felicity A", file: "/voices/Felicity A.mp3" },
  // Add more voice options as needed
];

export function DialogDemo() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [dataSource, setDataSource] = useState<string>("");
  const [formData, setFormData] = useState({
    agentName: "",
    agentPurpose: "",
    dataSource: "",
    tag: "",
    openingLine: "", // Ensure openingLine is in the initial state
    voice: "", // Add voice to the initial state
    instructions: "", // Add instructions to the initial state
  });
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [audioSrc, setAudioSrc] = useState<string>("");

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

  const playVoiceSample = (file: string) => {
    console.log("Attempting to play:", file);
    setAudioSrc(file);
  };

  useEffect(() => {
    if (audioSrc && audioRef.current) {
      console.log("Playing audio:", audioSrc);
      audioRef.current.load(); // Ensure the audio is loaded before playing
      audioRef.current.play().catch(error => {
        console.error("Error playing audio:", error);
      });
    }
  }, [audioSrc]);

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
            {dataSource === "natural-language" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-span-4 text-sm text-muted-foreground italic">
                  You can tag items using natural language in the knowledge base. Please tag, then select them here.
                </div>
              </div>
            )}
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
                    {VOICE_OPTIONS.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        {voice.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
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
        <audio ref={audioRef} src={audioSrc} />
        <p className="text-sm text-muted-foreground mt-2">
          Current audio: {audioSrc || "None selected"}
        </p>
      </DialogContent>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {VOICE_OPTIONS.map((voice) => (
          <Button
            key={voice.id}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => playVoiceSample(voice.file)}
            className={selectedVoice === voice.id ? "border-primary" : ""}
          >
            Play {voice.name}
          </Button>
        ))}
      </div>
    </Dialog>
  )
}