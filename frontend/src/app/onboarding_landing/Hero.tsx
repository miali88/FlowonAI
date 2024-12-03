import { Button } from "@/components/ui/button";
import WordPullUp from "@/components/ui/word-pull-up";
import SparklesText from "@/components/ui/sparkles-text";

export default function Hero() {
  return (
    <div className="mx-auto max-w-7xl">
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <WordPullUp
            words="Say Goodbye to Boring Forms"
            className="text-5xl font-bold tracking-tight text-white sm:text-6xl"
          />
          <SparklesText
            text="Hello Natural Conversations"
            className="text-6xl sm:text-7xl font-bold text-white"
          />
          <p className="mt-6 text-xl text-gray-300">
            Complete your user onboarding in under 3 minutes with AI-powered conversations
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Button size="lg" className="bg-white hover:bg-gray-200 text-black font-semibold">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
