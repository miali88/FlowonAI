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
}

const demoAgents: DemoAgent[] = [
  {
    id: "prospecting",
    title: "Prospecting Agent",
    description: "Qualify visitors based on defined criteria at scale to keep your pipeline full.",
  },
  {
    id: "onboarding",
    title: "Onboarding Agent",
    description: "Guide new users through your product to ensure a smooth onboarding experience.",
  },
  {
    id: "support",
    title: "Support Agent",
    description: "Provide immediate assistance to users with their queries and issues.",
  },
  {
    id: "booking",
    title: "Booking Agent",
    description: "Agent with scheduling and calendar management capabilities."
  },
  {
    id: "receptionist",
    title: "Receptionist",
    description: "Link your telephone number to an agent for intelligent call handling and routing."
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
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
