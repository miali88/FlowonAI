"use client";

import { ClerkProvider } from "@clerk/nextjs";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { ThemeModeProvider } from "@/components/DarkModeProvider";

// Initialize PostHog
if (typeof window !== "undefined") {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!posthogKey || !posthogHost) {
    console.error("PostHog environment variables are not set");
  } else {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      person_profiles: "identified_only",
    });
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider client={posthog}>
      <ClerkProvider>
        <ThemeModeProvider>
          {children}
        </ThemeModeProvider>
      </ClerkProvider>
    </PostHogProvider>
  );
}
