"use client";

import { Suspense } from "react";
import TextWidget from "./TextWidget";

export default function TextWidgetPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TextWidget
        apiBaseUrl={process.env.NEXT_PUBLIC_API_BASE_URL}
        agentId={process.env.NEXT_PUBLIC_DEFAULT_AGENT_ID}
      />
    </Suspense>
  );
}

// Define a type for the config
type EmbeddedChatbotConfig = {
  agentId: string;
  domain: string;
};

declare global {
  interface Window {
    embeddedChatbotConfig: EmbeddedChatbotConfig | undefined;
  }
}
