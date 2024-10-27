'use client';

import Image from "next/image";
import { useTheme } from "next-themes";
import { MagicCard } from "@/components/ui/magic-card";

export function FeaturesSection() {
  const { theme } = useTheme();
  return (
    <section className="container flex flex-col items-center justify-center gap-10 py-24 md:flex-row md:items-center md:gap-24">
      <div className="flex h-[500px] w-full flex-col gap-4 lg:h-[250px] lg:flex-row">
        <MagicCard
          className="cursor-pointer flex-col items-center justify-center shadow-2xl whitespace-nowrap text-2xl"
          gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
        >
          Retrieve data during a call
        </MagicCard>
        <MagicCard
          className="cursor-pointer flex-col items-center justify-center shadow-2xl whitespace-nowrap text-4xl"
          gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
        >
          Card
        </MagicCard>
      </div>    
      <div className="flex justify-center w-full">
        <Image
          alt="Image"
          src="/images/integrations.png"
          width={102300}
          height={1000}
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
          placeholder="empty"
        />
      </div>
    </section>
  );
}
