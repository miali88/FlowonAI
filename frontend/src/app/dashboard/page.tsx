"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/dashboard") {
      router.push("/dashboard/guided-setup");
    }
  }, [pathname, router]);

  return null;
}
