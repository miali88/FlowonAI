import { HeartHandshake, ChevronRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="py-14">
      <div className="container z-10">
        <div className="mx-auto size-24 rounded-[2rem] border p-3 shadow-2xl backdrop-blur-md bg-background/10 lg:size-32">
          <HeartHandshake size={16} className="mx-auto size-16 lg:size-24" />
        </div>
        <div className="z-10 mt-4 flex flex-col items-center text-center">
          <h2 className="text-3xl font-bold lg:text-4xl font-heading">
            Make customers love interacting with your brand.
          </h2>
          {/* <p className="mt-2">Start your 7-day free trial. No credit card required.</p> */}
          <Button
            size="lg"
            asChild
            variant="outline"
            className="group mt-4 rounded-full px-6 hover:bg-border"
          >
            <Link href="/sign-up" className="group mt-4 px-6 transition-all duration-300 ease-out">
              Get Started
              <ChevronRight
                size={16}
                className="ml-1 size-4 transition-all duration-300 ease-out group-hover:translate-x-1"
              />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
