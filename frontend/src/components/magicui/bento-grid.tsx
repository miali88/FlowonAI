  import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
  
  import Image from 'next/image';

  const features = [
    {
      name: "HR Assistant",
      description: "Streamlines employee onboarding by guiding through paperwork and policies",
      href: "/hr",
      features: [
        "Automated form filling for new hires",
        "Policy explanation and FAQ handling",
        "Leave request processing",
        "Benefits enrollment assistance"
      ],
      background: <img className="absolute -right-20 -top-20 opacity-60" />,
    },
    {
      name: "Sales Qualifier",
      description: "Identifies and qualifies leads through natural conversation",
      href: "/sales",
      features: [
        "Lead scoring based on conversation",
        "Meeting scheduling",
        "Product recommendation",
        "Instant notifications to sales team"
      ],
      background: <img className="absolute -right-20 -top-20 opacity-60" />,
    },
    {
      name: "Educational Guide",
      description: "Assists students with course selection and academic planning",
      href: "/education",
      features: [
        "Course requirement analysis",
        "Prerequisite checking",
        "Schedule planning",
        "Deadline reminders"
      ],
      background: (
        <div className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-0">
          <Image 
            src="/bento/mid_aged_lady.jpg"  // Add your background image path here
            alt="Education background"
            fill
            className="object-cover opacity-60"
          />
        </div>
      ),
    },
    {
      name: "Healthcare Scheduler",
      description: "Streamlines patient scheduling and appointment management",
      href: "/healthcare",
      features: [
        "Automated appointment reminders",
        "Patient intake and registration",
        "Scheduling and calendar management",
        "Instant notifications to healthcare team"
      ],
      background: (
        <div className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-0">
          <Image 
            src="/bento/nurse_2.jpg"
            alt="Healthcare background"
            fill
            className="object-cover opacity-60"
          />
        </div>
      ),
    },
    {
      name: "Insurance Agent",
      description: "Assists customers with insurance policy selection and enrollment",
      href: "/insurance",
      features: [
        "Policy comparison and recommendation",
        "Enrollment and application assistance",
        "Claims processing and management",
        "Instant notifications to insurance team"
      ],
      background: (
        <div className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-0">
          <Image 
            src="/bento/insurance.webp"
            alt="Insurance background"
            fill
            className="object-cover opacity-60"
          />
        </div>
      ),
    },
    {
      name: "Law Firm",
      description: "Assists with legal document review and case management",
      href: "/legal",
      features: [
        "Document review and analysis",
        "Case scheduling and deadlines",
        "Client intake automation",
        "Legal research assistance"
      ],
      background: (
        <div className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-0">
          <Image 
            src="/bento/law_firm.webp"  // Make sure to add this image to your public folder
            alt="Law firm background"
            fill
            className="object-cover opacity-60"
          />
        </div>
      ),
    },
  ];
  
  // Add type for the onGridClick prop
  interface BentoDemoProps {
    onGridClick: (title: string) => void;
  }

  export function BentoDemo({ onGridClick }: BentoDemoProps) {
    return (
      <BentoGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {features.map((feature) => (
          <div
            key={feature.name}
            onClick={() => onGridClick(feature.name)}
            className="w-full aspect-[4/5]"  // Changed from aspect-square to aspect-[4/5]
          >
            <BentoCard 
              key={feature.name} 
              {...feature}
              className="h-full w-full"
            />
          </div>
        ))}
      </BentoGrid>
    );
  }
