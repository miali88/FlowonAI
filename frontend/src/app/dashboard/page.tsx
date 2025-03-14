"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLoading from "./loading";

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (pathname === "/dashboard" && !redirecting) {
      setRedirecting(true);
      console.log("Redirecting from dashboard to guided-setup");
      // Use replace instead of push to avoid adding to history stack
      router.replace("/dashboard/guided-setup");
    }
  }, [pathname, router, redirecting]);

  // Show a loading indicator while redirecting
  if (redirecting) {
    return <DashboardLoading isLoading={true} />;
  }

  return null;
}
