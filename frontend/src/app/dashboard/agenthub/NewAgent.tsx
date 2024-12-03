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

type SetupMethod = 'scratch' | 'quick' | null;
type AgentType = 'widget' | 'outbound' | 'inbound' | null;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface NewAgentProps {
  knowledgeBaseItems?: Array<{
    id: string | number;
    title: string;
    data_type: string;
  }>;
  onAgentCreated?: () => void;
  setSelectedAgent?: (agent: Agent) => void;
}

export function NewAgent({ knowledgeBaseItems = [], onAgentCreated, setSelectedAgent }: NewAgentProps) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [setupMethod, setSetupMethod] = useState<SetupMethod>(null);
  const [agentType, setAgentType] = useState<AgentType>(null);
  const [agentName, setAgentName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSetupMethodSelect = (method: SetupMethod) => {
    setSetupMethod(method);
  };

  const handleAgentTypeSelect = (type: AgentType) => {
    setAgentType(type);
  };

  const handleBack = () => {
    if (agentName) {
      setAgentName('');
    } else if (agentType !== null) {
      setAgentType(null);
    } else if (setupMethod !== null) {
      setSetupMethod(null);
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
    if (!user?.id || !agentName.trim() || !agentType) return;
    
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
          dataSource: [],
          language: 'en-GB',
          voice: '',
          openingLine: '',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create agent');
      }

      const newAgent = await response.json();

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
        dataSource: [],
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
          form: true,
          callTransfer: false,
          appointmentBooking: false,
          prospects: false,
        };
      case 'outbound':
        return {
          form: true,
          callTransfer: true,
          appointmentBooking: true,
          prospects: true,
        };
      case 'inbound':
        return {
          form: true,
          callTransfer: true,
          appointmentBooking: true,
          prospects: false,
        };
      default:
        return {
          form: false,
          callTransfer: false,
          appointmentBooking: false,
          prospects: false,
        };
    }
  };

  const renderInitialSelection = () => (
    <div className="grid gap-6">
      <DialogHeader>
        <DialogTitle className="text-foreground dark:text-gray-200">Create New Assistant</DialogTitle>
      </DialogHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          variant="outline"
          className="h-32 flex flex-col items-center justify-center gap-2 hover:border-primary"
          onClick={() => handleSetupMethodSelect('scratch')}
        >
          <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center">
            <PlusIcon className="w-6 h-6" />
          </div>
          <span className="font-semibold">Start from scratch</span>
          <span className="text-sm text-muted-foreground">Build your AI Assistant from the ground up</span>
        </Button>

        <Button
          variant="outline"
          className="h-32 flex flex-col items-center justify-center gap-2 hover:border-primary"
          onClick={() => handleSetupMethodSelect('quick')}
        >
          <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center">
            <SparklesIcon className="w-6 h-6" />
          </div>
          <span className="font-semibold">Quick Assistant Setup</span>
          <span className="text-sm text-muted-foreground">Use presets to streamline setup & adjust settings</span>
        </Button>

        <Button
          variant="outline"
          className="h-32 flex flex-col items-center justify-center gap-2 hover:border-primary"
        >
          <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center">
            <LayoutTemplateIcon className="w-6 h-6" />
          </div>
          <span className="font-semibold">Browse our Templates</span>
          <span className="text-sm text-muted-foreground">Get inspired by our templates to get started</span>
        </Button>
      </div>
    </div>
  );

  const renderAgentTypeSelection = () => (
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
          Choose type of assistant
        </DialogTitle>
      </DialogHeader>

      <div className="grid grid-cols-1 gap-4">
        <Button
          variant="outline"
          className="h-24 flex items-center justify-start px-4 hover:border-primary"
          onClick={() => handleAgentTypeSelect('outbound')}
        >
          <div className="flex items-center gap-4">
            <ArrowUpRightIcon className="w-6 h-6" />
            <div className="flex flex-col items-start">
              <span className="font-semibold">Outbound</span>
              <span className="text-sm text-muted-foreground">Automate calls within workflows using Zapier, REST API, or HighLevel</span>
            </div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-24 flex items-center justify-start px-4 hover:border-primary"
          onClick={() => handleAgentTypeSelect('inbound')}
        >
          <div className="flex items-center gap-4">
            <ArrowDownLeftIcon className="w-6 h-6" />
            <div className="flex flex-col items-start">
              <span className="font-semibold">Inbound</span>
              <span className="text-sm text-muted-foreground">Manage incoming calls via phone, Zapier, REST API, or HighLevel</span>
            </div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-24 flex items-center justify-start px-4 hover:border-primary"
          onClick={() => handleAgentTypeSelect('widget')}
        >
          <div className="flex items-center gap-4">
            <MessageSquareIcon className="w-6 h-6" />
            <div className="flex flex-col items-start">
              <span className="font-semibold">Widget</span>
              <span className="text-sm text-muted-foreground">Create a widget and easily embed it anywhere in your app</span>
            </div>
          </div>
        </Button>
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsOpen(true)}>Create New Agent</Button>
      </DialogTrigger>
      <DialogContent className={`sm:max-w-[625px] ${styles.glassCard}`}>
        {setupMethod === null && renderInitialSelection()}
        {setupMethod === 'scratch' && !agentType && renderAgentTypeSelection()}
        {setupMethod === 'scratch' && agentType && renderNameInput()}
        {/* Add quick setup flow here when needed */}
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

const LayoutTemplateIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
    <rect width="18" height="7" x="3" y="3" rx="1" />
    <rect width="9" height="7" x="3" y="14" rx="1" />
    <rect width="5" height="7" x="16" y="14" rx="1" />
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

const ArrowUpRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
    <path d="M7 17V7h10" />
    <path d="M7 7l10 10" />
  </svg>
);

const ArrowDownLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
    <path d="M17 7L7 17" />
    <path d="M17 17H7V7" />
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