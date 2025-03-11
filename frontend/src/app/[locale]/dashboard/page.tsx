"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "../../i18n/navigation.js";

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.endsWith("/dashboard")) {
      router.push(`${pathname}/guided-setup`);
    }
  }, [pathname, router]);

  return null;
} 