import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useTranslations } from 'next-intl';
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function GuidedSetupSection() {
  const t = useTranslations('guidedSetupSection');
  
  return (
    <section className="py-16 bg-gradient-to-b from-background/50 to-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('sectionTitle')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('subtitle')}
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
          <Link href="https://calendly.com/michael-flowon/catch-up?month=2025-03">
            <Button variant="outline" className="group">
              {t('buttonText')}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
} 