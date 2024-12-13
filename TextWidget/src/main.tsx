import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import TextWidget from './text-widget/TextWidget'

// Get configuration from window object if available
const config = (window as any).embeddedChatbotConfig || {
  agentId: '',
  domain: 'http://localhost:3000' // fallback domain
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TextWidget 
      agentId={config.agentId}
      apiBaseUrl={config.domain}
      suggestedQuestions={[
        "What services do you offer?",
        "How can I get started?",
        "Tell me more about your company",
      ]}
    />
  </StrictMode>,
)
