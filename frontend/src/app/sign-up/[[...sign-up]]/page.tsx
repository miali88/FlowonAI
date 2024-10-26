import { SignUp } from "@clerk/nextjs";
import Image from "next/image";

export default function Page() {
  return (
    <div className="relative min-h-screen">
      <div className="absolute top-4 left-4">
        {/* <Image src="/assets/waves.webp" alt="Logo" width={100} height={100} /> */}
      </div>
      <div className="flex justify-center items-center min-h-screen">
        <SignUp />
      </div>
    </div>
  );
}