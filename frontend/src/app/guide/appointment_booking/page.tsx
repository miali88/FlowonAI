import { Metadata } from 'next';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const LazyVideo = dynamic(() => import('../../../components/LazyVideo'), { ssr: false });

export const metadata: Metadata = {
  title: 'Supercharge Your Flowon AI Agents with Free Scheduling Integration',
  description: 'Learn how to enhance your Flowon AI phone answering service with free scheduling integrations like Calendly and Cal.com',
};

const AppointmentBookingGuidePage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 prose prose-slate lg:prose-lg">
      <h1 className="text-4xl font-bold mb-8">
        Supercharge Your Flowon AI Agents with Free Scheduling Integration
      </h1>

      <section className="mb-8">
        <p>
          Want to make your Flowon AI phone answering service even more powerful? You can easily enhance your agents&apos; capabilities 
          by integrating free scheduling services like Calendly or Cal.com. This seamless integration allows your AI agents to forward the scheduling link 
          to your callers, providing a complete end-to-end scheduling solution for your callers – at no additional cost!

          This guide will walk you through the process of setting up Calendly to work with your Flowon AI agents.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Why Add Scheduling to Your AI Agents?</h2>
        <ul className="list-disc pl-6">
          <li>Enable instant appointment booking during calls</li>
          <li>Eliminate back-and-forth scheduling communications</li>
          <li>Be there for your callers when they need to schedule appointments</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Setting Up with Calendly</h2>
        
        <div className="mb-4">
          <ul className="list-none pl-0">
            <li>
              <Link href="https://calendly.com/signup" className="text-blue-600 hover:text-blue-800">
                🔗 Sign up
              </Link>
            </li>
            <li>
              <Link href="https://calendly.com/blog/getting-started-guide" className="text-blue-600 hover:text-blue-800">
                🔗 Getting Started Guide
              </Link>
            </li>
          </ul>
        </div>

        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">What You Get with Calendly&apos;s Free Plan:</h3>
          <ul className="list-disc pl-6">
            <li>Unlimited one-on-one meetings</li>
            <li>Personal scheduling page</li>
            <li>Calendar integration (Google, Outlook, iCloud)</li>
            <li>Basic email notifications</li>
          </ul>
        </div>

        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Setup Steps:</h3>
          <ol className="list-decimal pl-6">
            <li>Sign up at Calendly.com with your email</li>
            <li>Connect your primary calendar</li>
            <li>Create an event type (e.g., &quot;30-minute meeting&quot;)</li>
            <li>Customize your availability</li>
            <li>Get your scheduling link</li>
            <li>Add the link to your Flowon AI agent setup</li>
          </ol>
        </div>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Integrating with Flowon AI</h2>
        <div className="w-full aspect-video rounded-lg overflow-hidden mb-6">
          <LazyVideo
            src="/product_clips/app_booking_guide.mp4"
            className="w-full h-full object-cover"
            controls
          />
        </div>
        <p>Once you have your scheduling link from either service:</p>
        <ol className="list-decimal pl-6">
          <li>Log into your Flowon AI dashboard</li>
          <li>Navigate to Agent Configuration</li>
          <li>Add your scheduling link to the guided setup</li>
          <li>Enable scheduling capabilities for your agent</li>
        </ol>

        <p className="mt-4">Your AI agent will now be able to:</p>
        <ul className="list-disc pl-6">
          <li>Offer scheduling options during calls</li>
          <li>Send scheduling links to callers</li>
          <li>Handle scheduling-related inquiries</li>
          <li>Confirm appointments automatically</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Best Practices</h2>
        <ul className="list-disc pl-6">
          <li>Keep your calendar up to date</li>
          <li>Configure appropriate meeting durations</li>
          <li>Set specific business hours</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Need help?</h2>
        <p className="mt-4">
          If you have any questions or need assistance, please reach out to us at support@flowon.ai.
        </p>
      </section>
    </div>
  );
};

export default AppointmentBookingGuidePage;
