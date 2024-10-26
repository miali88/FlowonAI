import { useState } from 'react';
import Image from 'next/image';

const ChatBotMini = () => {
  const [message, setMessage] = useState('');

  return (
    <div className="flex flex-col h-[600px] w-[400px] bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center p-4 border-b">
        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
          <span className="text-white text-xl">C</span>
        </div>
        <div className="ml-3 font-semibold">Chatbase AI</div>
        <div className="ml-auto">
          <button className="p-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex items-start">
          <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
            <span className="text-white text-sm">C</span>
          </div>
          <div className="ml-3 bg-gray-100 rounded-lg p-3 max-w-[80%]">
            👋 Hi! I am Chatbase AI, ask me anything about Chatbase!
          </div>
        </div>
        <div className="flex items-start">
          <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
            <span className="text-white text-sm">C</span>
          </div>
          <div className="ml-3 bg-gray-100 rounded-lg p-3 max-w-[80%]">
            By the way, you can create a chatbot like me for your website! 🤩
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 space-x-2">
        <button className="px-4 py-2 bg-gray-100 rounded-full text-gray-700 text-sm hover:bg-gray-200">
          What is Chatbase?
        </button>
        <button className="px-4 py-2 bg-gray-100 rounded-full text-gray-700 text-sm hover:bg-gray-200">
          How do I add data to my chatbot?
        </button>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message..."
            className="w-full p-3 pr-12 rounded-lg border focus:outline-none focus:border-blue-500"
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <div className="mt-2 text-sm text-gray-500 text-center">
          By chatting, you agree to our <a href="#" className="underline">privacy policy</a>.
        </div>
      </div>
    </div>
  );
};

export default ChatBotMini;
