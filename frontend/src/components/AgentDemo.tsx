import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface DemoAgent {
  id: string;
  title: string;
  description: string;
  example: string;
}

const demoAgents: DemoAgent[] = [
  {
    id: "sales",
    title: "Sales Agent",
    description: "A sales representative that can qualify leads and book meetings",
    example: "Hi! I'm looking to learn more about your services."
  },
  {
    id: "support",
    title: "Support Agent",
    description: "A support agent that can answer common questions and troubleshoot issues",
    example: "How do I integrate the chatbot with my website?"
  },
  {
    id: "booking",
    title: "Booking Agent",
    description: "An agent that can handle appointment scheduling and calendar management",
    example: "I'd like to schedule a consultation"
  },
  {
    id: "receptionist",
    title: "Receptionist",
    description: "Link your telephone number to an agent for intelligent call handling and routing.",
    example: "Hello, I'd like to speak to support"
  },
];

interface BentoDemoProps {
  onAgentSelect: (title: string, example: string) => void;
}

export function BentoDemo({ onAgentSelect }: BentoDemoProps) {
  return (
    <div className="w-full max-w-[500px] p-6">
      <h3 className="text-2xl font-semibold mb-4">Explore Our AI Agents</h3>
      <Accordion 
        type="single" 
        collapsible 
        className="w-full [&>*]:!border-b-0 [&>*]:!border-0 [&_button]:!border-0 [&_button]:!border-b-0"
      >
        {demoAgents.map((agent) => (
          <AccordionItem 
            key={agent.id} 
            value={agent.id}
            className="!border-b-0 !border-0 data-[state=open]:!border-0"
          >
            <AccordionTrigger 
              className="text-left !border-b-0 !border-0 hover:no-underline data-[state=open]:!border-0 text-lg"
            >
              {agent.title}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <p className="text-base text-muted-foreground">
                  {agent.description}
                </p>
                <button
                  onClick={() => onAgentSelect(agent.title, agent.example)}
                  className="text-base text-primary hover:underline w-full text-left p-2 rounded bg-primary/10 hover:bg-primary/20 transition-colors"
                >
                  Try this example: "{agent.example}"
                </button>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
