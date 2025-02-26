import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from "@clerk/nextjs";
import axios from 'axios';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ChatSession {
  id: string;
  session_id: string;
  answer: {
    response: {
      answer: string;
    };
  };
  created_at: string;
  user_id: string;
  user_query: string;
}

const ChatHistory: React.FC = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);

  useEffect(() => {
    if (user) {
      fetchChatHistory();
    }
  }, [user]);

  const fetchChatHistory = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const token = await getToken();
      const response = await axios.get(`${API_BASE_URL}/chat/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Log the entire response to the console
      console.log("Raw API Response:", response);

      // Log just the data part of the response
      console.log("Raw Chat History Data:", response.data);

      // Set the raw data to state without any processing
      setChatSessions(response.data);

    } catch (error) {
      console.error("Error fetching chat history:", error);
      setChatSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSessions = chatSessions.filter(session =>
    session.user_query.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex h-full">
        {/* Left section (1/3 width) */}
        <div className="w-1/3 p-4 border-r">
          <div className="mb-4">
            <Input 
              placeholder="Search chat history..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ScrollArea className="h-[calc(100vh-300px)]">
            {filteredSessions.map((session) => (
              <Card 
                key={session.id} 
                className={cn(
                  "mb-2 cursor-pointer",
                  selectedSession?.id === session.id && "bg-secondary"
                )}
                onClick={() => setSelectedSession(session)}
              >
                <CardHeader className="p-3">
                  <CardTitle className="text-sm">{session.user_query}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </ScrollArea>
        </div>

        {/* Right section (2/3 width) */}
        <div className="w-2/3 p-4">
          {selectedSession ? (
            <div>
              <h3 className="text-xl font-semibold mb-4">{selectedSession.user_query}</h3>
              <ScrollArea className="h-[calc(100vh-250px)]">
                <p className="whitespace-pre-wrap">{selectedSession.answer.response.answer}</p>
              </ScrollArea>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Select a chat session to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;
