'use client'

import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import dynamic from 'next/dynamic'

const ChatWidget = dynamic(() => import('./components/main'), {
  ssr: false
})

export default function ChatWidgetPage() {
  const params = useParams()
  
  useEffect(() => {
    // Set the embedded chatbot config with the agentId from the URL
    window.embeddedChatbotConfig = {
      agentId: params.agentId as string,
      domain: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
    }
  }, [params.agentId])
  
  return (
    <div id="embedded-chatbot-container" style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <ChatWidget />
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