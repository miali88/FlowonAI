'use client'

import { useParams } from 'next/navigation'
import TextWidget from './TextWidget'

export default function ChatWidgetPage() {
  const params = useParams()
  
  return (
    <div id="embedded-chatbot-container" style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <TextWidget 
        agentId={params.agentId as string}
        apiBaseUrl={process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}
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