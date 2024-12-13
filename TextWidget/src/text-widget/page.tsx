'use client'

import TextWidget from './TextWidget'

export default function ChatWidgetPage() {
  const params = new URLSearchParams(window.location.search)
  const agentId = params.get('agentId')
  
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
        apiBaseUrl={import.meta.env.VITE_API_BASE_URL || 'please set VITE_API_BASE_URL'}
        suggestedQuestions={[
          "What services do you offer?",
          "How can I get started?",
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
