import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon, PlayIcon } from "@radix-ui/react-icons";
import "@/components/loading.css";
import { CallLog } from "./LibraryTable";

// Format date in DD MM YY format
const formatShortDate = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
};

// Format time in HH:MM format
const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// Format duration to minutes and seconds
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
};

interface CallCardsProps {
  setSelectedCall: (call: CallLog | null) => void;
  searchTerm: string;
  callsData: CallLog[];
  loading: boolean;
  error: string | null;
  handleDeleteCall: (id: string) => Promise<void>;
}

export function CallCards({ 
  setSelectedCall, 
  searchTerm, 
  callsData, 
  loading, 
  error, 
  handleDeleteCall 
}: CallCardsProps) {
  
  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return callsData;
    
    return callsData.filter(call => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (call.customer_number && call.customer_number.toLowerCase().includes(searchLower)) ||
        new Date(call.created_at).toLocaleString().toLowerCase().includes(searchLower)
      );
    });
  }, [callsData, searchTerm]);

  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-200px)] flex items-center justify-center bg-background">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-2">
      {filteredData.length === 0 ? (
        <p className="text-center py-4 text-muted-foreground">No call records found</p>
      ) : (
        filteredData.map((call) => (
          <Card 
            key={call.id} 
            className={`cursor-pointer hover:bg-accent transition-colors`}
            onClick={() => setSelectedCall(call)}
          >
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {formatShortDate(call.created_at)} • {formatTime(call.created_at)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDuration(call.duration_seconds)}
                  </span>
                </div>
                
                <div className="text-sm">
                  {call.customer_number || "Unknown"}
                </div>
              </div>
              
              <div className="flex items-center">
                {(call.recording_url || call.stereo_recording_url) && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0 mr-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(call.recording_url || call.stereo_recording_url, '_blank');
                    }}
                  >
                    <PlayIcon className="h-4 w-4" />
                    <span className="sr-only">Play Recording</span>
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <DotsHorizontalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    {(call.recording_url || call.stereo_recording_url) && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(call.recording_url || call.stereo_recording_url, '_blank');
                        }}
                      >
                        Play Recording
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCall(call.id);
                      }}
                      className="text-red-600 focus:text-red-600"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
} 