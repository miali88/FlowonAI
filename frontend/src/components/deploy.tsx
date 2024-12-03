import { CardSpotlight } from "@/components/ui/card-spotlight";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

export function DeploySection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-8 text-white">
          Deploy Your AI Agent
        </h2>
        <p className="text-xl text-neutral-200 mb-12">
          Choose how you want to integrate your AI assistant with your business
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <CardSpotlight className="p-6">
            <h3 className="text-xl font-bold relative z-20 text-white mb-4">
              Website Integration
            </h3>
            <div className="mb-4 relative z-20">
              <Image
                src="/widget.png"
                alt="Website Widget"
                width={400}
                height={192}
                className="w-full h-48 object-contain"
              />
            </div>
            <p className="text-neutral-200 mb-4 relative z-20">
              Add a customizable chat or voice widget to your website. Engage visitors
              in real-time with AI-powered conversations.
            </p>
          </CardSpotlight>

          <CardSpotlight className="p-6">
            <h3 className="text-xl font-bold relative z-20 text-white mb-4">
              Telephony Integration
            </h3>
            <div className="mb-4 relative z-20">
              <Image
                src="/phone.webp"
                alt="Phone System"
                width={400}
                height={160}
                className="w-full h-40 object-contain"
              />
            </div>
            <p className="text-neutral-200 mb-4 relative z-20">
              Empower your AI agents with local phone numbers across 60 countries
            </p>
          </CardSpotlight>
        </div>

        <div className="mt-20 flex items-center justify-center relative z-10">
          <Link 
            href="https://calendly.com/michael-flowon/30min" 
            className="inline-block relative z-20"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button 
              className="translate-y-[-1rem] animate-fade-in gap-1 rounded-lg opacity-0 ease-in-out [--animation-delay:600ms] text-lg px-6 py-6 hover:bg-primary/90 cursor-pointer"
              type="button"
            >
              <span>Start handling customer calls automatically</span>
              <ArrowRight
                size={20}
                className="ml-1 size-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1"
              />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}