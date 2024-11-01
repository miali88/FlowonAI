import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const integrations = [
  {
    name: "Calendar",
    icon: "/icons/gmail.png",
    description: "Your agents can see your availability and book meetings",
    category: "Calendar",
    status: "Not Connected",
  },
  {
    name: "Emails",
    icon: "/icons/outlook.png",
    description: "Have drafts responses to customers written and ready to send",
    category: "Email",
    status: "Not connected",
  },
  {
    name: "Zapier",
    icon: "/icons/zapier.png",
    description: "Automate workflows with Zapier.",
    category: "Automation",
    status: "Coming soon",
  },
  {
    name: "WhatsApp",
    icon: "/icons/whatsapp.png",
    description: "Connect WhatsApp Business API.",
    category: "Communication",
    status: "Coming soon",
  },
  {
    name: "Shopify",
    icon: "/icons/shopify.png",
    description: "Integrate your Shopify store.",
    category: "E-commerce",
    status: "Coming soon",
  },
  {
    name: "Slack",
    icon: "/icons/slack.png",
    description: "Connect with your Slack workspace.",
    category: "Communication",
    status: "Coming soon",
  },
]

export default function IntegrationsPage() {
  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-2">Integrations</h1>
      <p className="text-gray-500 mb-6">
        Connect your favorite apps and services to enhance your workflow.
      </p>

      <div className="relative mb-6">
        <Input
          type="search"
          placeholder="Search integrations..."
          className="w-full bg-background"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {integrations.map((integration) => (
          <div
            key={integration.name}
            className="p-4 rounded-lg border bg-card"
          >
            <div className="flex items-center gap-3 mb-2">
              <img
                src={integration.icon}
                alt={integration.name}
                className="w-10 h-10 rounded-lg"
              />
              <div>
                <h3 className="font-semibold">{integration.name}</h3>
                <span className="text-sm px-2 py-1 rounded-full bg-background">
                  {integration.status}
                </span>
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-3">
              {integration.description}
            </p>
            <span className="text-xs px-2 py-1 rounded-full bg-background mb-4 inline-block">
              {integration.category}
            </span>
            <Button
              variant={integration.status === "Connected" ? "secondary" : "default"}
              className="w-full"
              disabled={integration.status === "Coming soon"}
            >
              {integration.status}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
