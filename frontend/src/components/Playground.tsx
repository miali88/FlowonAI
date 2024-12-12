// import React, { useState, useEffect, useRef } from 'react';
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Card, CardContent } from "@/components/ui/card";
// import { SendIcon, Bot } from 'lucide-react';
// import { useUser, useAuth } from "@clerk/nextjs";
// import ReactMarkdown from 'react-markdown';

// // Add this constant at the top of your file, outside of any component
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// interface Message {
//   text: string;
//   type: 'incoming' | 'outgoing';
// }

// export function Playground() {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [inputMessage, setInputMessage] = useState('');
//   const chatboxRef = useRef<HTMLDivElement>(null);

//   const { user } = useUser();
//   const { getToken } = useAuth();

//   useEffect(() => {
//     // Load initial message
//     setMessages([{ text: "Hello 👋 How can I assist you today?", type: 'incoming' }]);
//   }, []);

//   useEffect(() => {
//     // Scroll to bottom of chat
//     if (chatboxRef.current) {
//       chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
//     }
//   }, [messages]);

//   const handleSendMessage = async () => {
//     if (!inputMessage.trim() || !user) return;

//     // Add user message to chat
//     setMessages(prev => [...prev, { text: inputMessage, type: 'outgoing' }]);
//     setInputMessage('');

//     // Add "Typing..." message
//     setMessages(prev => [...prev, { text: "Typing...", type: 'incoming' }]);

//     try {
//       const token = await getToken();
//       const response = await fetch(`${API_BASE_URL}/chat`, {
//         method: 'POST',
//         headers: { 
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//           'X-User-ID': user.id,
//         },
//         body: JSON.stringify({ 
//           message: inputMessage,
//           user_id: user.id,
//           type: "playground",
//         }),
//       });
//       const data = await response.json();
      
//       console.log('API response:', data); // Add this line for debugging

//       // Replace "Typing..." with actual response
//       setMessages(prev => [
//         ...prev.slice(0, -1),
//         { text: data.response?.answer?.trim() || "Sorry, I couldn't process that request.", type: 'incoming' }
//       ]);
//     } catch (error) {
//       console.error('Error:', error);
//       setMessages(prev => [
//         ...prev.slice(0, -1),
//         { text: "Oops! Something went wrong. Please try again.", type: 'incoming' }
//       ]);
//     }
//   };

//   return (
//     <div className="flex flex-col h-full max-w-3xl mx-auto px-4">
//       <ScrollArea className="flex-grow mb-4 h-[calc(100vh-200px)]">
//         {messages.map((message, index) => (
//           <Card key={index} className={`mb-4 ${message.type === 'outgoing' ? 'ml-auto bg-primary text-primary-foreground' : 'mr-auto bg-secondary'} max-w-[80%]`}>
//             <CardContent className="p-3 flex items-start">
//               {message.type === 'incoming' && <Bot className="mr-2 h-6 w-6" />}
//               <div className={`${message.type === 'outgoing' ? 'text-primary-foreground' : 'text-secondary-foreground'}`}>
//                 <ReactMarkdown>{message.text}</ReactMarkdown>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </ScrollArea>
//       <div className="flex items-center space-x-2 mb-4">
//         <Input
//           value={inputMessage}
//           onChange={(e) => setInputMessage(e.target.value)}
//           placeholder="Type your message..."
//           className="flex-grow"
//           onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
//         />
//         <Button onClick={handleSendMessage}>
//           <SendIcon className="h-4 w-4" />
//         </Button>
//       </div>
//     </div>
//   );
// }
