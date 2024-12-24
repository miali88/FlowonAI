import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from 'lucide-react';
import { useAuth } from "@clerk/nextjs";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ReasoningBoardProps {
  onClose: () => void;
}

interface LogEntry {
  timestamp: string;
  reasoning_steps: string[];
}

export function ReasoningBoard({ onClose }: ReasoningBoardProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [rawResponse, setRawResponse] = useState<string>('');
  const { getToken, sessionId } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const token = await getToken();
      
      try {
        const response = await fetch(`${API_BASE_URL}/chat/reasoning_board?session_id=${sessionId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: LogEntry = await response.json();
        console.log('Reasoning Board Response:', data);
        
        setLogs([data]);
        setRawResponse(JSON.stringify(data, null, 2));
      } catch (error) {
        console.error('Error fetching reasoning board data:', error);
      }
    };

    fetchData();
  }, [sessionId, getToken]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-3/4 h-3/4 overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Reasoning Process</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index} className="mb-6">
              <p className="text-xs text-muted-foreground mb-2">[{log.timestamp}]</p>
              {log.reasoning_steps.map((step, stepIndex) => (
                <p key={stepIndex} className="text-sm mb-2 whitespace-pre-wrap">
                  {step}
                </p>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
