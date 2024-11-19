'use client';

import { useState } from 'react';
import styles from './ChatWidget.module.css';

interface Message {
  text: string;
  isBot: boolean;
}

interface ChatInterfaceProps {
  agentId?: string;
  apiBaseUrl?: string;
}

const TextWidget: React.FC<ChatInterfaceProps> = ({ agentId, apiBaseUrl }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('TextWidget: handleSendMessage called', {
      inputText,
      apiBaseUrl
    });
    
    if (!inputText.trim()) return;

    const userMessage: Message = { text: inputText, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    
    const currentInput = inputText;
    setInputText('');

    try {
      console.log('TextWidget: Sending message to:', `${apiBaseUrl}/chat`);
      const response = await fetch(`${apiBaseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          agent_id: agentId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      // Add initial empty bot message
      const botMessage: Message = { text: '', isBot: true };
      setMessages(prev => [...prev, botMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Convert the chunk to text
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const content = line.slice(6).trim();
            
            // Handle [DONE] case separately
            if (content === '[DONE]') {
              console.log('Stream completed');
              break;
            }

            try {
              const data = JSON.parse(content);
              if (data.response?.answer) {
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage.isBot) {
                    lastMessage.text += data.response.answer;
                  }
                  return newMessages;
                });
              }
            } catch (parseError) {
              console.warn('Failed to parse chunk:', content, parseError);
              continue;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = { 
        text: "Sorry, there was an error processing your message.", 
        isBot: true 
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <div className={styles.mainWrapper}>
      <div className={styles.contentContainer}>
        <div className={styles.messageContainer}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`${styles.messageBubble} ${
                message.isBot ? styles.assistantMessage : styles.userMessage
              }`}
            >
              {message.text}
            </div>
          ))}
        </div>
      </div>
      
      <form onSubmit={handleSendMessage} className={styles.inputContainer}>
        <div className={styles.chatForm}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className={styles.chatInput}
            placeholder="Type your message..."
          />
          <button type="submit" className={styles.sendButton}>
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default TextWidget;

