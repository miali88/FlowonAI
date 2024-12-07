import Marquee from "@/components/ui/marquee";

const leads = [
  {
    email: "sales@designstudio.com",
    subject: "Website Redesign Project",
    preview: "Interested in discussing a complete redesign of our enterprise platform..."
  },
  {
    email: "sales@saasco.com",
    subject: "SaaS Integration Inquiry",
    preview: "Looking for a solution that can integrate with our existing tech stack..."
  },
  {
    email: "charles@recruitmentCo.com",
    subject: "Marketing Director Position",
    preview: "Candidate has 8+ years of experience running successful digital marketing campaigns..."
  },
  {
    email: "leads@techstart.io",
    subject: "AI Implementation",
    preview: "We're exploring AI solutions for our customer service department..."
  },
  {
    email: "info@growthcorp.com",
    subject: "Partnership Opportunity",
    preview: "Interested in discussing how we can leverage your AI solution..."
  }
];

export function LeadsMarquee() {
  return (
    <section className="py-20 overflow-hidden">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Real-Time Lead Generation</h2>
        <p className="text-gray-600">Watch as qualified leads flow into your inbox</p>
      </div>
      
      <Marquee
        pauseOnHover
        className="py-4"
        reverse
      >
        {leads.map((lead, idx) => (
          <div
            key={idx}
            className="mx-4 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg min-w-[300px]"
          >
            <div className="text-sm text-blue-400">{lead.email}</div>
            <div className="font-medium mb-1">{lead.subject}</div>
            <div className="text-sm text-gray-400 truncate">{lead.preview}</div>
          </div>
        ))}
      </Marquee>
    </section>
  );
} 