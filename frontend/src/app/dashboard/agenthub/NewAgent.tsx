import React, { useState } from "react";
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import styles from './NewAgent.module.css';
import { useUser } from "@clerk/nextjs";
import { Agent } from "./AgentCards";

type SetupMethod = 'telephone' | 'text' | 'voice-web' | 'feedback' | 'name' | null;
type AgentType = 'widget' | 'outbound' | 'inbound' | null;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface NewAgentProps {
  onAgentCreated?: () => void;
  setSelectedAgent?: (agent: Agent) => void;
}

export function NewAgent({ onAgentCreated, setSelectedAgent }: NewAgentProps) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [setupMethod, setSetupMethod] = useState<'name' | null>(null);
  const [agentType, setAgentType] = useState<AgentType>(null);
  const [agentName, setAgentName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSetupMethodSelect = (method: SetupMethod) => {
    setSetupMethod('name');
    setAgentType(method === 'quick' ? 'widget' : null);
  };

  const handleAgentTypeSelect = (type: AgentType) => {
    setAgentType(type);
  };

  const handleBack = () => {
    if (agentName) {
      setAgentName('');
    } else {
      setSetupMethod(null);
      setAgentType(null);
    }
  };

  const getPlaceholderName = () => {
    switch (agentType) {
      case 'widget':
        return 'My Widget Agent';
      case 'outbound':
        return 'My Outbound Agent';
      case 'inbound':
        return 'My Inbound Agent';
      default:
        return 'My Agent';
    }
  };

  const handleCreateAgent = async () => {
    console.log("handleCreateAgent called");
    console.log("User ID:", user?.id);
    console.log("Agent Name:", agentName.trim());
    console.log("Agent Type:", agentType);

    if (!user?.id || !agentName.trim() || !agentType) {
      console.log("Missing required fields");
      return;
    }

    console.log("Creating agent...");

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/livekit/new_agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          userId: user.id,
          agentName: agentName.trim(),
          agentType: agentType,
          features: getDefaultFeatures(agentType),
          dataSource: '',
          language: 'en-GB',
          voice: '',
          openingLine: '',
        }),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error('Failed to create agent');
      }

      const newAgent = await response.json();
      console.log("Agent created:", newAgent);

      // Close dialog and reset state
      setIsOpen(false);
      setSetupMethod(null);
      setAgentType(null);
      setAgentName('');
      
      // Refresh the agents list
      onAgentCreated?.();

      // Create a properly formatted agent object with the required properties
      const formattedAgent: Agent = {
        id: newAgent.id,
        agentName: agentName.trim(),
        agentPurpose: '', // Set a default or get from response
        dataSource: '',
        language: 'en-GB',
        voice: '',
        openingLine: '',
        features: getDefaultFeatures(agentType),
        // Add any other required properties from the Agent interface
      };

      // Navigate to the workspace by setting the selected agent
      if (setSelectedAgent) {
        setSelectedAgent(formattedAgent);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create agent');
      console.error('Error creating agent:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultFeatures = (type: AgentType) => {
    switch (type) {
      case 'widget':
        return {
          form: { enabled: true },
          callTransfer: { enabled: false },
          appointmentBooking: { enabled: false },
          prospects: { enabled: false },
        };
      case 'outbound':
        return {
          form: { enabled: true },
          callTransfer: { enabled: true },
          appointmentBooking: { enabled: true },
          prospects: { enabled: true },
        };
      case 'inbound':
        return {
          form: { enabled: true },
          callTransfer: { enabled: true },
          appointmentBooking: { enabled: true },
          prospects: { enabled: false },
        };
      default:
        return {
          form: { enabled: false },
          callTransfer: { enabled: false },
          appointmentBooking: { enabled: false },
          prospects: { enabled: false },
        };
    }
  };

  const renderInitialSelection = () => (
    <div className="grid gap-6">
      <DialogHeader>
        <DialogTitle className="text-foreground dark:text-gray-200">Create New Assistant</DialogTitle>
      </DialogHeader>
      
      <div>
        <div className="grid grid-cols-2 gap-4 mb-6 text-center">
          <Button
            variant="outline"
            className="h-40 w-full relative group flex flex-col items-center justify-center hover:border-primary"
            onClick={() => handleSetupMethodSelect('telephone')}
            style={{ whiteSpace: 'normal', textAlign: 'center' }}
          >
            <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center">
              <PhoneIcon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold mt-2">Telephone Agent</h3>
            <p className="text-sm text-muted-foreground">Handle phone calls with AI</p>
          </Button>

          <Button
            variant="outline"
            className="h-40 w-full relative group flex flex-col items-center justify-center hover:border-primary"
            onClick={() => handleSetupMethodSelect('text')}
            style={{ whiteSpace: 'normal', textAlign: 'center' }}
          >
            <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center">
              <MessageSquareIcon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold mt-2">Text Based Agent</h3>
            <p className="text-sm text-muted-foreground">Advanced text based chatbot</p>
          </Button>

          <Button
            variant="outline"
            className="h-40 w-full relative group flex flex-col items-center justify-center hover:border-primary"
            onClick={() => handleSetupMethodSelect('voice-web')}
            style={{ whiteSpace: 'normal', textAlign: 'center' }}
          >
            <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center">
              <MicIcon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold mt-2">Voice Web Agent</h3>
            <p className="text-sm text-muted-foreground">Real time voice AI agent anywhere on your webste</p>
          </Button>

          <Button
            variant="outline"
            className="h-40 w-full relative group flex flex-col items-center justify-center hover:border-primary"
            onClick={() => handleSetupMethodSelect('feedback')}
            style={{ whiteSpace: 'normal', textAlign: 'center' }}
          >
            <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center">
              <MessageCircleIcon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold mt-2">Feedback Widget</h3>
            <p className="text-sm text-muted-foreground">Collect feedback in app and run campaigns</p>
          </Button>
        </div>
      </div>
    </div>
  );

  const renderNameInput = () => (
    <div className="grid gap-6">
      <DialogHeader>
        <DialogTitle className="text-foreground dark:text-gray-200">
          <Button 
            variant="ghost" 
            className="mr-2 p-0 h-8 w-8"
            onClick={handleBack}
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          Name your assistant
        </DialogTitle>
      </DialogHeader>

      <div className="grid gap-4">
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            placeholder={getPlaceholderName()}
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {error && (
            <span className="text-sm text-red-500">{error}</span>
          )}
        </div>
        <Button 
          onClick={handleCreateAgent}
          disabled={!agentName.trim() || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </>
          ) : (
            'Continue'
          )}
        </Button>
      </div>
    </div>
  );

  const renderQuickSetup = () => (
    <div className="grid gap-6">
      <DialogHeader>
        <DialogTitle className="text-foreground dark:text-gray-200">
          <Button 
            variant="ghost" 
            className="mr-2 p-0 h-8 w-8"
            onClick={handleBack}
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          Quick Assistant Setup
        </DialogTitle>
      </DialogHeader>

      <div className="grid grid-cols-1 gap-4">
        <Button
          variant="outline"
          className="h-24 flex items-center justify-start px-4 hover:border-primary"
          onClick={() => {
            setAgentType('outbound');
            setSetupMethod('name');
          }}
        >
          <div className="flex items-center gap-4">
            <ArrowUpRightIcon className="w-6 h-6" />
            <div className="flex flex-col items-start">
              <span className="font-semibold">Lead Generation</span>
              <span className="text-sm text-muted-foreground">Proactive outreach and lead qualification</span>
            </div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-24 flex items-center justify-start px-4 hover:border-primary"
          onClick={() => {
            setAgentType('widget');
            setSetupMethod('name');
          }}
        >
          <div className="flex items-center gap-4">
            <MessageSquareIcon className="w-6 h-6" />
            <div className="flex flex-col items-start">
              <span className="font-semibold">Feedback Agent</span>
              <span className="text-sm text-muted-foreground">Collect user feedback and analyze in real-time</span>
            </div>
          </div>
        </Button>
      </div>
    </div>
  );

  const renderTemplateSelection = () => (
    <div className="grid gap-6">
      <DialogHeader>
        <DialogTitle className="text-foreground dark:text-gray-200">
          <Button 
            variant="ghost" 
            className="mr-2 p-0 h-8 w-8"
            onClick={handleBack}
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          Browse Templates
        </DialogTitle>
      </DialogHeader>

      <div className="grid grid-cols-1 gap-4">
        <Button
          variant="outline"
          className="h-24 flex items-center justify-start px-4 hover:border-primary"
          onClick={async () => {
            setAgentType('widget');
            setAgentName('Support Template');
            await handleCreateAgent();
          }}
        >
          <div className="flex items-center gap-4">
            <MessageSquareIcon className="w-6 h-6" />
            <div className="flex flex-col items-start">
              <span className="font-semibold">Support Template</span>
              <span className="text-sm text-muted-foreground">Pre-configured support assistant</span>
            </div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-24 flex items-center justify-start px-4 hover:border-primary"
          onClick={async () => {
            setAgentType('inbound');
            setAgentName('Sales Template');
            await handleCreateAgent();
          }}
        >
          <div className="flex items-center gap-4">
            <ArrowDownLeftIcon className="w-6 h-6" />
            <div className="flex flex-col items-start">
              <span className="font-semibold">Sales Template</span>
              <span className="text-sm text-muted-foreground">Optimized for sales inquiries</span>
            </div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-24 flex items-center justify-start px-4 hover:border-primary"
          onClick={async () => {
            setAgentType('outbound');
            setAgentName('Marketing Template');
            await handleCreateAgent();
          }}
        >
          <div className="flex items-center gap-4">
            <ArrowUpRightIcon className="w-6 h-6" />
            <div className="flex flex-col items-start">
              <span className="font-semibold">Marketing Template</span>
              <span className="text-sm text-muted-foreground">Designed for marketing campaigns</span>
            </div>
          </div>
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsOpen(true)}>Create New Agent</Button>
      </DialogTrigger>
      <DialogContent className={`sm:max-w-[625px] ${styles.glassCard}`}>
        {setupMethod === null && renderInitialSelection()}
        {setupMethod === 'name' && renderNameInput()}
      </DialogContent>
    </Dialog>
  );
}

// Icons
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

const ArrowLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

const PhoneIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const MessageSquareIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const MicIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const MessageCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);