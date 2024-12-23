import { CardSpotlight } from "@/components/ui/card-spotlight";
import { IntegrationsSection } from "@/components/integrations";

export function DeploySection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-black">
      <div className="max-w-4xl mx-auto text-center">
        {/* <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-8 text-white">
          Deploy Your AI Agent
        </h2> */}
        <p className="text-xl text-neutral-200 mb-12">
          Choose how you want to integrate your AI assistant with your business
        </p>

        <div className="grid md:grid-cols-2 gap-8">
        <CardSpotlight className="p-6">
            <h3 className="text-xl font-bold relative z-20 text-white mb-4">
              Text Based Agent
            </h3>
            <div className="mb-4 relative z-20">
              <img
                src="/icons/live-chat.png"
                alt="Text Messaging"
                className="w-full h-40 object-contain rounded-lg"
              />
            </div>
            <p className="text-neutral-200 mb-4 relative z-20">
              An intelligence chatbot agent embedded in your website
            </p>
          </CardSpotlight>
          <CardSpotlight className="p-6">
            <h3 className="text-xl font-bold relative z-20 text-white mb-4">
              Telephony Integration
            </h3>
            <div className="mb-4 relative z-20">
              <img
                src="/phone.webp"
                alt="Phone System"
                className="w-full h-40 object-contain rounded-lg"
              />
            </div>
            <p className="text-neutral-200 mb-4 relative z-20">
              Make your agent reachable with local phone numbers across 60 countries
            </p>
          </CardSpotlight>
          <CardSpotlight className="p-6">
            <h3 className="text-xl font-bold relative z-20 text-white mb-4">
              Voice Web Agent
            </h3>
            <div className="mb-4 relative z-20">
              <img
                src="/icons/mic-widget.png"
                alt="Website Widget"
                className="w-full h-48 object-contain rounded-lg"
              />
            </div>
            <p className="text-neutral-200 mb-4 relative z-20">
              Engage users in real-time with AI-powered conversations.
            </p>
          </CardSpotlight>

        </div>
        <IntegrationsSection />
      </div>
    </section>
  );
}