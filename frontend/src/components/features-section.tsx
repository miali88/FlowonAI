import Image from "next/image";

export function FeaturesSection() {
  return (
    <section className="container flex flex-col items-center justify-center gap-10 py-24 md:flex-row md:items-center md:gap-24">
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
