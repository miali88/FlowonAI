'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './TextWidget.module.css';
import LiveKitTextEntry from './LiveKitTextEntry';
import { IoSend } from "react-icons/io5";

interface Message {
  text: string;
  isBot: boolean;
}

interface FormField {
  type: string;
  label: string;
}

interface ChatInterfaceProps {
  agentId?: string;
  apiBaseUrl?: string;
  suggestedQuestions?: string[];
}

const TextWidget: React.FC<ChatInterfaceProps> = ({ 
  agentId, 
  apiBaseUrl,
  suggestedQuestions = [
    "What services do you offer?",
    "How can I get started?",
    "What are your working hours?",
  ]
}) => {
  console.log('Suggested questions:', suggestedQuestions);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [roomName, setRoomName] = useState<string | null>(null);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Add initial messages when component mounts
  useEffect(() => {
    setMessages([
      { text: "👋 Hello! I'm Flowon's AI chatbot assistant, ask me anything about Flowon!", isBot: true },
      { text: "Also, you can create a chatbot like me for your website! 👀", isBot: true }
    ]);
  }, []); // Empty dependency array means this runs once on mount

  // Add form fields fetch effect
  useEffect(() => {
    const fetchFormFields = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/conversation/form_fields/${agentId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch form fields');
        }
        const data = await response.json();
        console.log('Retrieved form fields:', data);
        setFormFields(data.fields || []);
      } catch (error) {
        console.error('Error fetching form fields:', error);
      }
    };

    if (agentId) {
      fetchFormFields();
    }
  }, [agentId, apiBaseUrl]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim() || !roomName) return;

    const userMessage: Message = { text: inputText, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    
    const currentInput = inputText;
    setInputText('');
    
    let accumulatedResponse = '';

    try {
      const response = await fetch(`${apiBaseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          agent_id: agentId,
          room_name: roomName
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      // Add initial empty bot message
      const botMessage: Message = { text: '', isBot: true };
      setMessages(prev => [...prev, botMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const content = line.slice(6).trim();
            
            if (content === '[DONE]') {
              console.log('Complete response:', accumulatedResponse);
              break;
            }

            try {
              const data = JSON.parse(content);
              if (data.response?.answer) {
                const newText = data.response.answer;
                accumulatedResponse += newText;

                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage.isBot) {
                    lastMessage.text = accumulatedResponse;
                  }
                  return newMessages;
                });
              }
            } catch (parseError) {
              console.warn('Failed to parse chunk:', content, parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        text: "Sorry, there was an error processing your message.",
        isBot: true
      }]);
    }
  };

  const handleSuggestionClick = (question: string) => {
    setInputText(question);
  };

  const handleRoomConnected = (newRoomName: string) => {
    setRoomName(newRoomName);
    console.log('Room connected:', newRoomName);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${apiBaseUrl}/conversation/chat_message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          user_id: null,
          room_name: roomName,
          participant_identity: null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      // Add success message to chat
      setMessages(prev => [...prev, {
        text: "Thank you for submitting the form!",
        isBot: true
      }]);
      
      // Clear form data and hide form
      setFormData({});
      setShowForm(false);
    } catch (error) {
      console.error('Failed to submit form:', error);
      setMessages(prev => [...prev, {
        text: "Sorry, there was an error submitting the form. Please try again.",
        isBot: true
      }]);
    }
  };

  const handleInputChange = (fieldLabel: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldLabel]: value
    }));
  };

  return (
    <div style={{ 
      width: '100%',
      height: '100%',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <LiveKitTextEntry 
        agentId={agentId || ''} 
        apiBaseUrl={apiBaseUrl || ''} 
        onRoomConnected={handleRoomConnected}
      />
      <div className={styles.chatContainer}>
        <div className={styles.messageContainer} ref={messageContainerRef}>
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
        
        {showForm && (
          <form onSubmit={handleFormSubmit} className={styles.formContainer}>
            {formFields.map((field, index) => (
              <div key={index} className={styles.formField}>
                <label htmlFor={field.label}>{field.label}</label>
                <input
                  type={field.type}
                  id={field.label}
                  value={formData[field.label] || ''}
                  onChange={(e) => handleInputChange(field.label, e.target.value)}
                  required
                />
              </div>
            ))}
            <button type="submit" className={styles.submitButton}>
              Submit
            </button>
          </form>
        )}
        
        <div className={styles.suggestedQuestionsContainer}>
          {suggestedQuestions.map((question, index) => (
            <div
              key={index}
              className={styles.suggestionBubble}
              onClick={() => handleSuggestionClick(question)}
            >
              {question}
            </div>
          ))}
        </div>
        
        <div className={styles.inputContainer}>
          <form onSubmit={handleSendMessage} className={styles.chatForm}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className={styles.chatInput}
              placeholder="Message..."
            />
            <button type="submit" className={styles.sendButton}>
              <IoSend size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TextWidget;

