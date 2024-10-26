import {
    BellIcon,
    CalendarIcon,
    FileTextIcon,
    GlobeIcon,
    InputIcon,
    PersonIcon,  // Changed from UsersIcon
    HomeIcon,
    CrossCircledIcon,
    HeartFilledIcon,
} from "@radix-ui/react-icons";
  
  import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
  
  import Image from 'next/image';

  const features = [
    {
      Icon: PersonIcon,  // Changed from UsersIcon
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
      className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
    },
    {
      Icon: HomeIcon,
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
      className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
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
      background: <img className="absolute -right-20 -top-20 opacity-60" />,
      className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
    },
    {
      Icon: CrossCircledIcon,
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
      background: <img className="absolute -right-20 -top-20 opacity-60" />,
      className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
    },
    {
      Icon: HeartFilledIcon,
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
      background: <img className="absolute -right-20 -top-20 opacity-60" />,
      className: "lg:col-start-3 lg:col-end-3 lg:row-start-3 lg:row-end-4",
    },
  ];
  
  export async function BentoDemo() {
    return (
      <BentoGrid className="lg:grid-rows-3">
        {features.map((feature) => (
          <BentoCard key={feature.name} {...feature} />
        ))}
      </BentoGrid>
    );
  }
