'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'

const ChatWidget = dynamic(() => import('../chat-widget/[agentId]/components/main'), {
  ssr: false
})

export default function DevPage() {
  useEffect(() => {
    // Set the development configuration for the chatbot
    window.embeddedChatbotConfig = {
      agentId: 'test-agent-id', // Replace with your test agent ID
      domain: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
    }
  }, [])
  
  return (
    <div 
      id="embedded-chatbot-container" 
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <ChatWidget />
    </div>
  )
}
