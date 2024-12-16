'use client'

import TextWidget from './TextWidget'

export default function ChatWidgetPage() {
  const params = new URLSearchParams(window.location.search)
  const agentId = params.get('agentId')
  
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }}>
      <TextWidget 
        agentId={agentId || ''}
        apiBaseUrl={import.meta.env.VITE_API_BASE_URL || 'please set VITE_API_BASE_URL'}
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
