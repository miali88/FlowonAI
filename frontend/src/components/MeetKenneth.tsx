import TextReveal from "@/components/ui/text-reveal";
import Image from "next/image";

export function MeetKenneth() {
  return (
    <div className="z-10 flex min-h-64 flex-col items-center justify-center gap-8 rounded-lg border bg-white p-8 dark:bg-black">
      <TextReveal text="Introducing Kenneth, The UK's First Corporate Law Agent." />
      <Image
        src="/kenneth.png"
        alt="Kenneth AI Agent"
        width={200}
        height={200}
        className="rounded-full"
      />
    </div>
  );
}
