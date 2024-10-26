"use client";

import React, { useState, useCallback } from 'react';
import { AgentCards, Agent } from './AgentCards';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAuth } from "@clerk/nextjs";
import { NewAgent } from './NewAgent';
import Workspace from './Workspace';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const Lab = () => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [alertDialogMessage, setAlertDialogMessage] = useState('');
  const { userId } = useAuth();
  const [isLiveKitActive, setIsLiveKitActive] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
  };

  const handleSaveChanges = async () => {
    if (!selectedAgent || !userId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/livekit/agents/${selectedAgent.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          agentName: selectedAgent.agentName,
          agentPurpose: selectedAgent.agentPurpose,
          dataSource: selectedAgent.dataSource,
          tag: selectedAgent.tag,
          openingLine: selectedAgent.openingLine,
          language: selectedAgent.language,
          voice: selectedAgent.voice,
          instructions: selectedAgent.instructions,
          uiConfig: selectedAgent.uiConfig,
          features: {
            callTransfer: selectedAgent.features?.callTransfer,
            appointmentBooking: selectedAgent.features?.appointmentBooking,
            form: selectedAgent.features?.form,
            prospects: selectedAgent.features?.prospects,
          },
        }),
      });

      if (response.ok) {
        setAlertDialogMessage('Agent updated successfully.');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update agent');
      }
    } catch (error) {
      console.error('Error updating agent:', error);
      setAlertDialogMessage(error instanceof Error ? error.message : "Failed to update the agent. Please try again.");
    } finally {
      setAlertDialogOpen(true);
    }
  };

  const handleDeleteAgent = async () => {
    if (!selectedAgent || !userId) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/livekit/agents/${selectedAgent.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
      });

      if (response.ok) {
        setAlertDialogMessage(`${selectedAgent.agentName} has been successfully deleted. Refresh the page to see the change.`);
        setSelectedAgent(null);
        // Optionally, refresh the agent list here
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete agent');
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
      setAlertDialogMessage(error instanceof Error ? error.message : "Failed to delete the agent. Please try again.");
    } finally {
      setAlertDialogOpen(true);
    }
  };

  const handleStreamEnd = useCallback(() => {
    setIsStreaming(false);
    setIsConnecting(false);
  }, []);

  const handleStreamStart = useCallback(() => {
    setIsConnecting(false);
  }, []);

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex flex-col space-y-6">
        <div className="w-full flex flex-col items-start space-y-4">
          <NewAgent />
          <AgentCards setSelectedAgent={handleAgentSelect} />
        </div>
        {selectedAgent ? (
          <Workspace
            selectedAgent={selectedAgent}
            setSelectedAgent={setSelectedAgent}
            handleSaveChanges={handleSaveChanges}
            handleDeleteAgent={handleDeleteAgent}
            isStreaming={isStreaming}
            setIsStreaming={setIsStreaming}
            isLiveKitActive={isLiveKitActive}
            setIsLiveKitActive={setIsLiveKitActive}
            token={token}
            setToken={setToken}
            url={url}
            setUrl={setUrl}
            isConnecting={isConnecting}
            setIsConnecting={setIsConnecting}
            handleStreamEnd={handleStreamEnd}
            handleStreamStart={handleStreamStart}
          />
        ) : (
          <p>Select or create an agent to get started.</p>
        )}
      </div>
      <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Notification</AlertDialogTitle>
            <AlertDialogDescription>
              {alertDialogMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setAlertDialogOpen(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Lab;
