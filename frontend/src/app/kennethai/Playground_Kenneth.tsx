import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { SendIcon, Bot, Pen } from 'lucide-react';
import { useUser, useAuth, useSession } from "@clerk/nextjs";
import ReactMarkdown from 'react-markdown';
import { Copy, Check, ThumbsUp, ThumbsDown, FileText } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import '@/styles/github-markdown-light.css';
import axios from 'axios';
import { ReasoningBoard } from "@/components/ReasoningBoard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LiveKitTextEntry } from './LiveKitTextEntry';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Message {
  text: string;
  type: 'incoming' | 'outgoing';
  references?: [string, string][];
  searchType?: string;
}

// Add this new component for suggested queries
const SuggestedQuery = ({ query, onClick }: { query: string; onClick: () => void }) => (
  <Badge
    variant="secondary"
    className="mr-2 mb-2 cursor-pointer bg-gray-100 text-gray-700 hover:bg-gray-300 border border-gray-200"
    onClick={onClick}
  >
    {query}
  </Badge>
);

export function Playground() {
  const [messages, setMessages] = useState<Message[]>(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    return savedMessages ? JSON.parse(savedMessages) : [{ text: "Hello 👋 I'm Kenneth, an AI powered search engine specialising in UK Corporate Law. All my answers are grounded in legislations, I can help you with anything related to:\n\nCompanies Act 2006\n\nFinancial Services and Markets Act 2000\n\nInsolvency Act 1986\n\nInsolvency Rules 2016\n\nYou can also upload your own documents to the knowledge base, allowing me to reference and analyse your specific data alongside these legislations.\n\nHow can I assist you with your corporate law inquiry today?", type: 'incoming' }];
  });
  const [inputMessage, setInputMessage] = useState('');
  const chatboxRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
  const [likedMessageId, setLikedMessageId] = useState<number | null>(null);
  const [dislikedMessageId, setDislikedMessageId] = useState<number | null>(null);
  const [currentReferences, setCurrentReferences] = useState<[string, string][]>([]);
  const [showReasoningBoard, setShowReasoningBoard] = useState(false);
  const [searchType, setSearchType] = useState("Deep Search");
  const [reasoningSteps, setReasoningSteps] = useState<string[]>([]);
  const [roomName, setRoomName] = useState<string | null>(null);

  const { user } = useUser();
  const { getToken } = useAuth();
  const { session } = useSession();

  const suggestedQueries = [
    "What are the main duties of company directors in the UK?",
    "I want to restructure my profitable but insolvent company. What options do I have?",
    "How does the Financial Services and Markets Act 2000 regulate financial activities?",
    "Explain how FSMA is 'applicable to a contract of insurance'"
  ];

const kennethai_agent_id = "83b0f5db-9691-4328-8f47-6ab9cbf9f10d"

  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      setMessages([{ text: "Hello 👋 I'm Kenneth, an AI powered search engine specialising in UK Corporate Law. All my answers are grounded in legislations, I can help you with anything related to:\n\nCompanies Act 2006\n\nFinancial Services and Markets Act 2000\n\nInsolvency Act 1986\n\nInsolvency Rules 2016\n\nYou can also upload your own documents to the knowledge base, allowing me to reference and analyse your specific data alongside these legislations.\n\nHow can I assist you with your corporate law inquiry today?", type: 'incoming' }]);
    }
  }, [session]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  };

  const handleRoomConnected = (newRoomName: string) => {
    setRoomName(newRoomName);
    console.log('Room connected:', newRoomName);
  };

  const handleSendMessage = async (query?: string) => {
    const messageToSend = query || inputMessage;
    if (!messageToSend.trim() || !user) return;

    setMessages(prev => [...prev, { text: messageToSend, type: 'outgoing' }]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const token = await getToken();
      const payload = {
        message: messageToSend,
        user_id: user.id,
        agent_id: kennethai_agent_id,
        type: "kennethai",
        search_type: searchType,
        session_id: session?.id,
        room_name: roomName,
      };

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      // Add a temporary message that will be updated with chunks
      setMessages(prev => [...prev, { text: '', type: 'incoming' }]);
      
      let accumulatedText = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Convert the chunk to text
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const content = line.slice(6).trim();
            
            // Handle special messages
            if (content === '[DONE]') {
              continue; // Skip processing for done message
            }

            // Handle regular JSON data
            try {
              const data = JSON.parse(content);

              if (data.response?.answer) {
                accumulatedText += data.response.answer;
                // Update the last message with accumulated text
                setMessages(prev => [
                  ...prev.slice(0, -1),
                  {
                    text: accumulatedText,
                    type: 'incoming',
                    references: currentReferences,
                    searchType: searchType,
                  }
                ]);
              } else if (data.rag_results) {
                // Handle RAG results if needed
                setCurrentReferences(data.rag_results);
              }
            } catch (parseError) {
              console.warn('Failed to parse message:', content);
              continue;
            }
          }
        }
      }

      setIsTyping(false);

    } catch (error) {
      setIsTyping(false);
      console.error('Error:', error);
      setMessages(prev => [
        ...prev.slice(0, -1),
        { text: "Oops! Something went wrong. Please try again.", type: 'incoming' }
      ]);
    }
  };

  // Add this new component for the typing indicator
  const TypingIndicator = useCallback(() => {
    const [opacity, setOpacity] = useState(1);

    useEffect(() => {
      const intervalId = setInterval(() => {
        setOpacity(prev => prev === 1 ? 0.5 : 1);
      }, 500);

      return () => clearInterval(intervalId);
    }, []);

    return (
      <div style={{ opacity, transition: 'opacity 0.5s ease-in-out' }}>
        Pondering...
      </div>
    );
  }, []);

  const handleCopy = (text: string, messageId: number) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        description: "Text copied to clipboard",
      });
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000); // Reset after 2 seconds
    }).catch((err) => {
      console.error('Failed to copy text: ', err);
      toast({
        variant: "destructive",
        description: "Failed to copy text",
      });
    });
  };

  const handleLike = (messageId: number) => {
    setLikedMessageId(messageId);
    setDislikedMessageId(null); // Reset dislike state
    // TODO: Implement like functionality
    setTimeout(() => setLikedMessageId(null), 2000); // Reset after 2 seconds
  };

  const handleDislike = (messageId: number) => {
    setDislikedMessageId(messageId);
    setLikedMessageId(null); // Reset like state
    // TODO: Implement dislike functionality
    setTimeout(() => setDislikedMessageId(null), 2000); // Reset after 2 seconds
  };

  // Add this new function
  const handleFileNote = async () => {
    try {
      const token = await getToken();
      const lastBotMessage = messages
        .filter(msg => msg.type === 'incoming')
        .pop();

      if (!lastBotMessage) {
        toast({
          variant: "destructive",
          description: "No bot message to save as file note",
        });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/chat/file_note`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: lastBotMessage.text }),
      });

      if (response.ok) {
        // Create a Blob from the response
        const blob = await response.blob();
        // Create a link element and trigger the download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'file_note.docx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast({
          description: "File note downloaded successfully",
        });
      } else {
        throw new Error('Failed to download file note');
      }
    } catch (error) {
      console.error('Error downloading file note:', error);
      toast({
        variant: "destructive",
        description: "Failed to download file note",
      });
    }
  };

  const handleSearch = () => {
    switch(searchType) {
      case "Deep Search":
        break;
      case "Quick Search":
      default:
        // Perform Quick Search by default
        break;
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    setMessages([{ text: "Hello 👋 I'm Kenneth, an AI powered search engine specialising in UK Corporate Law. All my answers are grounded in legislations, I can help you with anything related to:\n\nCompanies Act 2006\n\nFinancial Services and Markets Act 2000\n\nInsolvency Act 1986\n\nInsolvency Rules 2016\n\nYou can also upload your own documents to the knowledge base, allowing me to reference and analyse your specific data alongside these legislations.\n\nHow can I assist you with your corporate law inquiry today?", type: 'incoming' }]);
    setInputMessage('');
    setCurrentReferences([]);
    setReasoningSteps([]);
  };

  return (
    <div className="flex flex-col h-full">
      <LiveKitTextEntry 
        agentId={user?.id || ''} 
        apiBaseUrl={API_BASE_URL || ''} 
        onRoomConnected={handleRoomConnected}
      />
      <div className="flex justify-start p-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-white hover:text-black transition-colors duration-200"
                onClick={handleNewChat}
              >
                <Pen className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>New Chat</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex-grow overflow-y-auto" ref={chatboxRef}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex flex-col space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex flex-col ${message.type === 'outgoing' ? 'items-end' : 'items-start'}`}>
                {message.type === 'incoming' && index === messages.length - 1 && message.searchType === "Deep Search" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mb-2"
                    onClick={() => setShowReasoningBoard(true)}
                  >
                    See reasoning steps
                  </Button>
                )}
                <Card className={`${message.type === 'outgoing' ? 'bg-primary text-primary-foreground' : 'bg-background'} ${message.type === 'incoming' ? 'w-full' : 'max-w-[65%]'} inline-block group`}>
                  <CardContent className="p-3 flex flex-col">
                    <div className="flex items-start">
                      {message.type === 'incoming' && <Bot className="mr-2 h-6 w-6 flex-shrink-0" />}
                      <div className={`break-words ${message.type === 'incoming' ? 'markdown-body w-full' : ''}`}>
                        {message.type === 'incoming' ? (
                          <ReactMarkdown>{message.text}</ReactMarkdown>
                        ) : (
                          message.text
                        )}
                      </div>
                    </div>
                    {index === 0 && message.type === 'incoming' && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-500 mb-2">Suggested queries:</p>
                        <div className="flex flex-wrap">
                          {suggestedQueries.map((query, i) => (
                            <SuggestedQuery
                              key={i}
                              query={query}
                              onClick={() => {
                                setInputMessage(query);
                                handleSendMessage(query);
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                {message.type === 'incoming' && (
                  <>
                    <div className="mt-2 flex opacity-15 hover:opacity-100 transition-opacity duration-200">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="hover:bg-white hover:text-black transition-colors duration-200"
                              onClick={() => handleCopy(message.text, index)}
                            >
                              {copiedMessageId === index ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{copiedMessageId === index ? 'Copied!' : 'Copy'}</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="hover:bg-white hover:text-black transition-colors duration-200"
                              onClick={() => handleLike(index)}
                            >
                              <ThumbsUp className={`h-4 w-4 ${likedMessageId === index ? 'text-green-500' : ''}`} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{likedMessageId === index ? 'Liked!' : 'Like'}</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="hover:bg-white hover:text-black transition-colors duration-200"
                              onClick={() => handleDislike(index)}
                            >
                              <ThumbsDown className={`h-4 w-4 ${dislikedMessageId === index ? 'text-red-500' : ''}`} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{dislikedMessageId === index ? 'Disliked!' : 'Dislike'}</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="hover:bg-white hover:text-black transition-colors duration-200"
                              onClick={handleFileNote}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>File note</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    {message.references && message.references.length > 0 && (
                      <Accordion type="single" collapsible className="w-full mt-2" defaultValue="references">
                        <AccordionItem value="references" className="border-none">
                          <AccordionTrigger className="py-1 text-sm text-muted-foreground hover:no-underline">
                            References
                          </AccordionTrigger>
                          <AccordionContent className="text-sm text-muted-foreground">
                            <ul>
                              {message.references.map(([text, url], index) => (
                                <li key={index}>
                                  <a 
                                    href={url}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-cyan-500 hover:text-cyan-700 underline"
                                  >
                                    {text}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    )}
                  </>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex items-start">
                <Card className="bg-secondary max-w-[80%] inline-block">
                  <CardContent className="p-3 flex flex-col">
                    <div className="flex items-start">
                      <Bot className="mr-2 h-6 w-6 flex-shrink-0" />
                      <TypingIndicator />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-center items-center p-4 border-t bg-background">
        <div className="w-full max-w-4xl px-4 pb-6 relative">
          <div className="flex items-center">
            <div className="absolute left-0">
              <Select onValueChange={setSearchType} defaultValue="Deep Search">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Search Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Quick Search">Quick Search</SelectItem>
                  <SelectItem value="Deep Search">Deep Search</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-grow flex justify-center ml-[200px] mr-[60px]">
              <Input
                placeholder="What's at hand?"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full max-w-2xl"
                // ... other props
              />
            </div>
            <div className="absolute right-0">
              <Button onClick={handleSendMessage}>
                <SendIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      {showReasoningBoard && (
        <ReasoningBoard onClose={() => setShowReasoningBoard(false)} steps={reasoningSteps} />
      )}
    </div>
  );
}
