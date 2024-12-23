import { CardSpotlight } from "@/components/ui/card-spotlight";
import { 
  FaSlack, 
  FaDiscord, 
  FaSalesforce, 
  FaWhatsapp,
  FaMicrosoft 
} from "react-icons/fa";
import { SiZendesk, SiHubspot, SiIntercom } from "react-icons/si";

export function IntegrationsSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-black">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 text-white">
          Seamless Integrations
        </h2>
        <p className="text-xl text-neutral-200 mb-12">
          Connect your AI assistant with your favorite tools and platforms
        </p>

        <CardSpotlight className="p-8">
          <div className="grid grid-cols-3 md:grid-cols-4 gap-8">
            {platforms.map((platform) => (
              <div key={platform.name} className="flex flex-col items-center">
                <div className="bg-neutral-800/50 p-4 rounded-xl w-20 h-20 flex items-center justify-center mb-3">
                  <platform.icon className="w-12 h-12 text-white" />
                </div>
                <span className="text-sm text-neutral-300">{platform.name}</span>
              </div>
            ))}
          </div>
        </CardSpotlight>
      </div>
    </section>
  );
}

const platforms = [
  { name: 'Slack', icon: FaSlack },
  { name: 'Discord', icon: FaDiscord },
  { name: 'Salesforce', icon: FaSalesforce },
  { name: 'HubSpot', icon: SiHubspot },
  { name: 'Zendesk', icon: SiZendesk },
  { name: 'Microsoft Teams', icon: FaMicrosoft },
  { name: 'Intercom', icon: SiIntercom },
  { name: 'WhatsApp', icon: FaWhatsapp },
]; 