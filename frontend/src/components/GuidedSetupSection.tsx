import Image from "next/image";

export function GuidedSetupSection() {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">
            Easy Setup Process
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get started in minutes with our guided setup process. Flowon makes it simple to configure your business information and training sources.
          </p>
        </div>
        
        <div className="relative mx-auto max-w-5xl rounded-xl shadow-2xl overflow-hidden">
          <Image
            src="/app_pics/guided_setup.png"
            alt="Flowon Guided Setup Process"
            width={1200}
            height={800}
            className="w-full h-auto"
            priority
          />
          <div className="absolute inset-0 rounded-xl ring-1 ring-gray-900/10"></div>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Our step-by-step process guides you through setting up your business profile, connecting training sources, and launching your AI assistant.
          </p>
        </div>
      </div>
    </section>
  );
} 