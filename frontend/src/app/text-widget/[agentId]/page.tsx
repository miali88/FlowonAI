'use client'

import { useParams } from 'next/navigation'
import TextWidget from './TextWidget'

export default function ChatWidgetPage() {
  const params = useParams()
  
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
        agentId={params.agentId as string}
        apiBaseUrl={process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}
        suggestedQuestions={[
          "What services do you offer?",
          "How can I get started?",
          "What are your working hours?",
          "Tell me more about your company",
        ]}
      />
    </div>
  )
}

// Add TypeScript declaration for the window object
declare global {
  interface Window {
    embeddedChatbotConfig: {
      agentId: string
      domain: string
    }
  }
}