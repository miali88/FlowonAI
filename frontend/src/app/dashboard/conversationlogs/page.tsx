"use client";

import React, { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { CallLog } from './LibraryTable';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ChatUI } from './ChatUI';
import { CallCards } from './CallCards';
import axios from "axios";
import { useAuth } from "@clerk/nextjs";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const CallHistory: React.FC = () => {
  const { userId, getToken } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);
  const [callsData, setCallsData] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch call data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userId) {
          setError('User not authenticated');
          setLoading(false);
          return;   
        }

        setLoading(true);
        setError(null);

        const token = await getToken();
        if (!token) {
          throw new Error('Not authenticated');
        }

        console.log('Fetching call logs...');
        const response = await axios.get(`${API_BASE_URL}/vapi/calls`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Call logs response:', response.data);
        // Sort by created_at in descending order (newest first)
        const sortedData = [...response.data].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setCallsData(sortedData);
        setLoading(false);
      } catch (error: any) {
        console.error('Error fetching data:', error.response || error);
        setError(error.response?.data?.detail || error.message || 'Failed to fetch call logs');
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, getToken]);

  // Handle deleting a call
  const handleDeleteCall = async (id: string) => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      await axios.delete(`${API_BASE_URL}/vapi/calls/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Remove the deleted call from the state
      setCallsData(prevData => prevData.filter(call => call.id !== id));
      
      // Clear selectedCall if it was the one that was deleted
      if (selectedCall && selectedCall.id === id) {
        setSelectedCall(null);
      }
      
      console.log(`Call with id: ${id} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting call with id: ${id}`, error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left section (resizable) */}
        <ResizablePanel defaultSize={40} minSize={20}>
          <div className="p-4">
            <div className="mb-4">
              <Input 
                placeholder="Search call history..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <ScrollArea className="h-[calc(100vh-300px)]">
              <CallCards 
                setSelectedCall={setSelectedCall} 
                searchTerm={searchTerm} 
                callsData={callsData}
                loading={loading}
                error={error}
                handleDeleteCall={handleDeleteCall}
              />
            </ScrollArea>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right section (resizable) */}
        <ResizablePanel defaultSize={60} minSize={30} className="flex flex-col overflow-hidden min-w-0 transition-all duration-300 ease-in-out flex-1 mr-8">
          <ChatUI selectedCall={selectedCall} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default CallHistory;
