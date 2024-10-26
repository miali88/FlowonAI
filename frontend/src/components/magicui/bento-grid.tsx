import {
    PersonIcon,  // Changed from UsersIcon
    ClipboardIcon,  // Replace HeartFilledIcon with ClipboardIcon
    HeartFilledIcon,
} from "@radix-ui/react-icons";
import { PoundSterling, DollarSign } from "lucide-react";
  
  import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
  
  import Image from 'next/image';

  const features = [
    {
      Icon: PersonIcon,
      name: "HR Assistant",
      description: "Streamlines employee onboarding by guiding through paperwork and policies",
      href: "/hr",
      cta: "Learn more",
      features: [
        "Automated form filling for new hires",
        "Policy explanation and FAQ handling",
        "Leave request processing",
        "Benefits enrollment assistance"
      ],
      background: <img className="absolute -right-20 -top-20 opacity-60" />,
    },
    {
      Icon: () => (
        <div className="flex gap-1">
          <PoundSterling className="text-black" />
          <DollarSign className="text-black" />
        </div>
      ),
      name: "Sales Qualifier",
      description: "Identifies and qualifies leads through natural conversation",
      href: "/sales",
      cta: "Learn more",
      features: [
        "Lead scoring based on conversation",
        "Meeting scheduling",
        "Product recommendation",
        "Instant notifications to sales team"
      ],
      background: <img className="absolute -right-20 -top-20 opacity-60" />,
    },
    {
      Icon: () => <Image src="/icons/graduation.png" alt="Graduation" width={20} height={20} />,
      name: "Educational Guide",
      description: "Assists students with course selection and academic planning",
      href: "/education",
      cta: "Learn more",
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
      Icon: HeartFilledIcon,
      name: "Healthcare Scheduler",
      description: "Streamlines patient scheduling and appointment management",
      href: "/healthcare",
      cta: "Learn more",
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
      Icon: ClipboardIcon,  // Changed from HeartFilledIcon
      name: "Insurance Agent",
      description: "Assists customers with insurance policy selection and enrollment",
      href: "/insurance",
      cta: "Learn more",
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
