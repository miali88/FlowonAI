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