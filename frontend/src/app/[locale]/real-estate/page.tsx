import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function RealEstatePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container px-4 mx-auto">
          <div className="flex flex-wrap items-center -mx-4">
            <div className="w-full px-4 mb-16 md:w-1/2 md:mb-0">
              <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                Never Miss a Real Estate Lead Again
              </h1>
              <p className="mb-8 text-xl text-muted-foreground">
                Let AI handle your property inquiries 24/7. Qualify leads, schedule viewings, and provide instant property information while you focus on closing deals.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg">Start Free Trial</Button>
                <Button size="lg" variant="outline">Book a Demo</Button>
              </div>
            </div>
            <div className="w-full px-4 md:w-1/2">
              <div className="relative">
                <Image
                  src="/images/chat_integ.png"
                  alt="Real Estate Agent Dashboard"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container px-4 mx-auto">
          <h2 className="mb-12 text-3xl font-bold text-center md:text-4xl">
            Transform Your Real Estate Business
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="p-6 bg-background rounded-lg shadow-sm">
              <div className="mb-4 text-primary">
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold">24/7 Availability</h3>
              <p className="text-muted-foreground">
                Never miss a lead with round-the-clock automated responses to property inquiries.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-background rounded-lg shadow-sm">
              <div className="mb-4 text-primary">
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold">Automated Scheduling</h3>
              <p className="text-muted-foreground">
                Let AI handle viewing appointments and automatically sync with your calendar.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-background rounded-lg shadow-sm">
              <div className="mb-4 text-primary">
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold">Lead Qualification</h3>
              <p className="text-muted-foreground">
                AI-powered conversations qualify leads and collect essential information before they reach you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container px-4 mx-auto text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Ready to Revolutionize Your Real Estate Business?
          </h2>
          <p className="mb-8 text-xl text-muted-foreground">
            Join the growing number of real estate professionals using AI to close more deals.
          </p>
          <Button size="lg" className="px-8">Get Started Now</Button>
        </div>
      </section>
    </>
  );
} 