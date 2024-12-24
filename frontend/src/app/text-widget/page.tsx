'use client'

import { useSearchParams } from 'next/navigation'
import TextWidget from './TextWidget'

export default function ChatWidgetPage() {
  const searchParams = useSearchParams()
  const agentId = searchParams.get('agentId')
  
  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <TextWidget 
        agentId={agentId || ''}
        apiBaseUrl={process.env.NEXT_PUBLIC_API_BASE_URL || 'please set NEXT_PUBLIC_API_BASE_URL'}
        suggestedQuestions={[
          "What services do you offer?",
          "How can I get started?",
          "Tell me more about your company",
        ]}
      />
    </div>
  )
}

// Define a type for the config
type EmbeddedChatbotConfig = {
  agentId: string
  domain: string
}

declare global {
  interface Window {
    embeddedChatbotConfig: EmbeddedChatbotConfig | undefined
  }
}
