'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './TextWidget.module.css';
import LiveKitTextEntry from './LiveKitTextEntry';
import { IoSend } from "react-icons/io5";
import ReactMarkdown from 'react-markdown';
import Footer from './Footer';
import CalendlyWidget from './CalendlyWidget';

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

const LoadingBubbles = () => (
  <div className={styles.loadingBubbles} data-loading-spinner>
    <div className={styles.bubble}></div>
    <div className={styles.bubble}></div>
    <div className={styles.bubble}></div>
  </div>
);

const SUGGESTED_QUESTIONS = [
  "What services do you offer?",
  "How can I get started?",
  "Tell me more about your company",
  "Who's on your team at WeCreate?"
];

const DEBUG_SHOW_FORM = false; // Set to true to always show the form for debugging

const TextWidget: React.FC<ChatInterfaceProps> = ({ 
  agentId, 
  apiBaseUrl,
}) => {
  console.log('Received suggestedQuestions:', SUGGESTED_QUESTIONS);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [roomName, setRoomName] = useState<string | null>(null);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showForm, setShowForm] = useState(false);
  const [activeSuggestions, setActiveSuggestions] = useState<string[]>(SUGGESTED_QUESTIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [participantIdentity, setParticipantIdentity] = useState<string | null>(null);
  const [showCalendly, setShowCalendly] = useState(false);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Add initial messages when component mounts
  useEffect(() => {
    setMessages([
      { text: "Welcome to WeCreate👋! Looking to boost your brand's online presence? What's your biggest goal right now?", isBot: true },
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

  useEffect(() => {
    if (participantIdentity || DEBUG_SHOW_FORM) {
      const eventSource = new EventSource(`${apiBaseUrl}/conversation/events/${participantIdentity}`);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'show_chat_input') {
          setShowForm(true);
        }
      };

      return () => {
        eventSource.close();
      };
    }
  }, [participantIdentity, apiBaseUrl]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim() || !roomName) return;

    // Check if the user wants to schedule a meeting
    if (inputText.toLowerCase().includes('schedule') || 
        inputText.toLowerCase().includes('book') || 
        inputText.toLowerCase().includes('meeting')) {
      setShowCalendly(true);
      return;
    }

    const userMessage: Message = { text: inputText, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    
    const currentInput = inputText;
    setInputText('');
    
    // Add empty bot message immediately to show loading state
    setMessages(prev => [...prev, { text: '', isBot: true }]);
    
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

                // Check if the bot's response should trigger Calendly
                handleBotResponse(accumulatedResponse);

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

  const handleSuggestionClick = async (suggestion: string) => {
    if (!roomName) return;

    // Remove the clicked suggestion
    setActiveSuggestions(prev => prev.filter(s => s !== suggestion));

    // Add user message to UI immediately
    setMessages(prev => [...prev, { text: suggestion, isBot: false }]);
    
    // Send directly to chat API
    try {
      const response = await fetch(`${apiBaseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: suggestion,
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

      let accumulatedResponse = '';

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

  const handleRoomConnected = (newRoomName: string) => {
    setRoomName(newRoomName);
    setParticipantIdentity(newRoomName); // Assuming roomName is used as participantIdentity
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
          participant_identity: participantIdentity, // Include participantIdentity
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

  // Add this function to handle bot responses that should trigger Calendly
  const handleBotResponse = (response: string) => {
    // Check if the bot's response contains keywords that should trigger Calendly
    if (response.toLowerCase().includes('schedule a meeting') || 
        response.toLowerCase().includes('book a call')) {
      setShowCalendly(true);
    }
  };

  console.log('Current activeSuggestions:', activeSuggestions);

  return (
    <div style={{ 
      width: '100%',
      height: '100%',
      position: 'fixed',
      top: 0,
      left: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.05)',
      overflow: 'hidden',
      minHeight: '-webkit-fill-available',
      paddingBottom: 'env(safe-area-inset-bottom)'
    }}>
      <LiveKitTextEntry 
        agentId={agentId || ''} 
        apiBaseUrl={apiBaseUrl || ''} 
        onRoomConnected={handleRoomConnected}
      />
      <div className={styles.chatContainer}>
        {showCalendly ? (
          <div className={styles.calendlyContainer}>
            <button 
              className={styles.closeButton}
              onClick={() => setShowCalendly(false)}
            >
              Close Calendar
            </button>
            <CalendlyWidget />
          </div>
        ) : (
          <>
            <div className={styles.messageContainer} ref={messageContainerRef}>
              {messages.map((message, index) => (
                message.text ? (
                  <div
                    key={index}
                    className={`${styles.messageBubble} ${
                      message.isBot ? styles.assistantMessage : styles.userMessage
                    }`}
                  >
                    <div className={styles.messageBubbleContent}>
                      <ReactMarkdown>{message.text}</ReactMarkdown>
                    </div>
                    
                    {/* Render form inside the assistant's message bubble */}
                    {message.isBot && (showForm || DEBUG_SHOW_FORM) && index === messages.length - 1 && (
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
                  </div>
                ) : message.isBot ? (
                  <LoadingBubbles key={index} />
                ) : null
              ))}
            </div>
            
            <div className={styles.suggestedQuestionsContainer}>
              {activeSuggestions.map((question, index) => (
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
            
            {/* <div className={styles.scheduleButtonContainer}>
              <button 
                className={styles.scheduleButton}
                onClick={() => setShowCalendly(true)}
              >
                Schedule a Meeting
              </button>
            </div> */}
            
            <Footer />
          </>
        )}
      </div>
    </div>
  );
};

export default TextWidget;

