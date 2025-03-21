import { HeartHandshake, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from 'next-intl';

import { Button } from "@/components/ui/button";

export function CtaSection() {
  const t = useTranslations('ctaSection');
  
  return (
    <section className="py-14 w-full">
      <div className="container px-4 mx-auto text-center">
        <div className="mx-auto size-24 rounded-[2rem] border p-3 shadow-2xl backdrop-blur-md bg-background/10 lg:size-32">
          <HeartHandshake size={16} className="mx-auto size-16 lg:size-24" />
        </div>
        <div className="z-10 mt-4 flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center lg:text-4xl font-heading">
            {t('title')}
          </h2>
          {/* <p className="mt-2">Start your 7-day free trial. No credit card required.</p> */}
          <Button
            size="lg"
            asChild
            variant="outline"
            className="group mt-6 rounded-full px-6 hover:bg-border"
          >
            <Link href="https://cal.com/michael-ali-5fcg8p/30min" className="flex items-center justify-center transition-all duration-300 ease-out">
              {t('buttonText')}
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