import { Button } from "./ui/button";
import { Card } from "./ui/card";

export function DeploySection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-8">
          Deploy Your AI Agent
        </h2>
        <p className="text-xl text-muted-foreground mb-12">
          Choose how you want to integrate your AI assistant with your business
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Website Integration</h3>
            <div className="mb-4">
              <img
                //src="/widget-illustration.svg" // You'll need to add this asset
                alt="Website Widget"
                className="w-full h-48 object-contain"
              />
            </div>
            <p className="text-muted-foreground mb-4">
              Add a customizable chat or voice widget to your website. Engage visitors
              in real-time with AI-powered conversations.
            </p>
            <Button variant="outline">Learn More</Button>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Telephony Integration</h3>
            <div className="mb-4">
              <img
                src="/twilio.svg"
                alt="Phone System"
                className="w-full h-48 object-contain"
              />
            </div>
            <p className="text-muted-foreground mb-4">
              Set up an AI-powered phone system using Twilio. Handle customer calls
              automatically with natural conversation flow.
            </p>
            <Button variant="outline">Learn More</Button>
          </Card>
        </div>
      </div>
    </section>
  );
}
