import React, { useState, useRef, useEffect } from 'react';
import './ChatBot.css';

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<{ type: 'incoming' | 'outgoing', content: string }[]>([
    { type: 'incoming', content: 'Hello 👏 \nHow can I assist you today?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(true);
  const chatboxRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      setMessages([...messages, { type: 'outgoing', content: inputMessage }]);
      setInputMessage('');
      // Here you would typically call an API to get the chatbot's response
      // For now, we'll just simulate a response after a short delay
      setTimeout(() => {
        setMessages(prev => [...prev, { type: 'incoming', content: 'This is a simulated response.' }]);
      }, 1000);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div className={`chatbot ${isMinimized ? 'minimized' : ''}`}>
      {isMinimized ? (
        <div className="chat-bubble" onClick={toggleMinimize}>
          <span className="material-symbols-outlined">chat</span>
        </div>
      ) : (
        <>
          <header>
            <h2>Flowon</h2>
            <span className="material-symbols-outlined close-btn" onClick={toggleMinimize}>close</span>
          </header>
          <ul className="chatbox" ref={chatboxRef}>
            {messages.map((message, index) => (
              <li key={index} className={`chat ${message.type}`}>
                {message.type === 'incoming' && (
                  <span className="material-symbols-outlined">smart_toy</span>
                )}
                <p>{message.content}</p>
              </li>
            ))}
          </ul>
          <div className="chat-input">
            <textarea
              placeholder="Send a Message"
              spellCheck={false}
              required
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <span id="send-btn" className="material-symbols-outlined" onClick={handleSendMessage}>
              send
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBot;
