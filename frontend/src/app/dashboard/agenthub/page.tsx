"use client";

import React, { useState, useCallback, useEffect } from "react";
import { AgentCards, Agent } from "./AgentCards";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth, useUser } from "@clerk/nextjs";
import { NewAgent } from "./NewAgent";
import Workspace from "./workspace/Workspace";
import { LocalParticipant } from "livekit-client";
import axios from "axios";
import "@/components/loading.css";
import { Slash } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { VOICE_OPTIONS } from "./workspace/agentSettings";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function Loader() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="loader" />
    </div>
  );
}

const AgentHub = () => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [alertDialogMessage, setAlertDialogMessage] = useState("");
  const { userId, user, isLoaded } = useAuth();
  const [isLiveKitActive, setIsLiveKitActive] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [localParticipant, setLocalParticipant] =
    useState<LocalParticipant | null>(null);
  const [knowledgeBaseItems, setKnowledgeBaseItems] = useState<
    Array<{
      id: string | number;
      title: string;
      data_type: string;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(true);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [agentsError, setAgentsError] = useState<string | null>(null);

  const fetchUserInfo = async () => {
    if (!userId) return;

    setIsLoadingUserInfo(true);
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/users`, {
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched user info:", data);
        setUserInfo(data);
      } else {
        console.error("Failed to fetch user info");
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    } finally {
      setIsLoadingUserInfo(false);
    }
  };

  React.useEffect(() => {
    if (userId) {
      fetchUserInfo();
    }
  }, [userId]);
  const [isPageLoading, setIsPageLoading] = useState(true);

  React.useEffect(() => {
    if (!isLoaded) {
      console.log("Still loading user data...");
      return;
    }

    if (user) {
      console.log("User Name:", user.fullName);
      console.log("First Name:", user.firstName);
      console.log("Last Name:", user.lastName);
    } else {
      console.log("User is authenticated: false");
    }
  }, [user, isLoaded]);

  const handleAgentSelect = (agent: Agent) => {
    console.log("Selected Agent with features:", agent.features);
    console.log(agent, "kikkkk");
    setSelectedAgent(agent);
  };

  const handleSaveChanges = async () => {
    if (!selectedAgent || !userId) return;

    try {
      // Clean up features before sending to backend
      const cleanedFeatures = selectedAgent.features
        ? Object.entries(selectedAgent.features).reduce((acc, [key, value]) => {
            // Skip unwanted features
            if (
              key !== "prospects" &&
              key !== "prospecting" &&
              key !== "calendar" &&
              key !== "appointmentBooking" &&
              key !== "callTransfer"
            ) {
              acc[key] = value;
            }
            return acc;
          }, {} as Record<string, any>)
        : {};

      const response = await fetch(
        `${API_BASE_URL}/livekit/agents/${selectedAgent.id}`,
        {
          method: "PATCH",
          headers: {
            "x-user-id": userId,
          },
          body: JSON.stringify({
            agentName: selectedAgent.agentName,
            agentPurpose: selectedAgent.agentPurpose,
            dataSource: selectedAgent.dataSource,
            tag: selectedAgent.tag,
            openingLine: selectedAgent.openingLine,
            language: selectedAgent.language,
            voice: selectedAgent.voice,
            voiceProvider: selectedAgent.voiceProvider,
            instructions: selectedAgent.instructions,
            uiConfig: selectedAgent.uiConfig,
            features: cleanedFeatures, // Use cleaned features here
            showSourcesInChat: selectedAgent.showSourcesInChat,
          }),
        }
      );

      if (response.ok) {
        setAlertDialogMessage("Agent updated successfully.");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update agent");
      }
    } catch (error) {
      console.error("Error updating agent:", error);
      setAlertDialogMessage(
        error instanceof Error
          ? error.message
          : "Failed to update the agent. Please try again."
      );
    } finally {
      setAlertDialogOpen(true);
    }
  };

  const handleDeleteAgent = async () => {
    if (!selectedAgent || !userId) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/livekit/agents/${selectedAgent.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": userId,
          },
        }
      );

      if (response.ok) {
        setAlertDialogMessage(
          `${selectedAgent.agentName} has been successfully deleted.`
        );
        setSelectedAgent(null);
        // Optionally, refresh the agent list here
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete agent");
      }
    } catch (error) {
      console.error("Error deleting agent:", error);
      setAlertDialogMessage(
        error instanceof Error
          ? error.message
          : "Failed to delete the agent. Please try again."
      );
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

  const fetchKnowledgeBase = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/dashboard/knowledge_base_headers`,
        {
          headers: {
            "Content-Type": "application/json",
            "x-user-id": userId,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.items) {
          const formattedItems = data.items.map((item: any) => ({
            id: item.id,
            title: item.title,
            data_type: item.data_type,
          }));
          setKnowledgeBaseItems(formattedItems);
        }
      }
    } catch (error) {
      console.error("Error fetching knowledge base:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAgents = async () => {
    if (!userId) return;

    setAgentsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/livekit/agents`, {
        headers: {
          "x-user-id": userId,
        },
      });
      console.log("Fetched Agents Data:", response.data.data);
      const agents = response.data.data.map((agent: any) => ({
        ...agent,
        assigned_telephone: agent.assigned_telephone || null,
      }));
      setAgents(agents);
    } catch (err) {
      setAgentsError("Failed to fetch agents");
      console.error("Error fetching agents:", err);
    } finally {
      setAgentsLoading(false);
    }
  };

  React.useEffect(() => {
    const initializeData = async () => {
      if (!isLoaded) return;

      if (userId) {
        try {
          await Promise.all([fetchKnowledgeBase(), fetchAgents()]);
        } catch (error) {
          console.error("Error initializing data:", error);
        }
      }
      setIsPageLoading(false);
    };

    initializeData();
  }, [userId, isLoaded]);

  const handleNavigateToHub = useCallback(() => {
    setSelectedAgent(null);
    setIsStreaming(false);
    setIsLiveKitActive(false);
    setToken(null);
    setUrl(null);
    setIsConnecting(false);
    setLocalParticipant(null);
  }, []);

  useEffect(() => {
    if (selectedAgent) {
      console.log("Selected Agent:", selectedAgent);
      console.log("Selected Agent Features:", selectedAgent.features);
    }
  }, [selectedAgent]);

  const refreshAgents = useCallback(async () => {
    if (!userId) return;

    setAgentsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/livekit/agents`, {
        headers: {
          "x-user-id": userId,
        },
      });
      console.log("Refreshed Agents Data:", response.data.data);
      setAgents(response.data.data);
    } catch (err) {
      setAgentsError("Failed to fetch agents");
      console.error("Error fetching agents:", err);
    } finally {
      setAgentsLoading(false);
    }
  }, [userId]);

  return (
    <>
      <div className="flex flex-col h-full p-6">
        {(isPageLoading || !isLoaded || isLoading) && <Loader />}

        <div
          style={{
            visibility:
              isPageLoading || !isLoaded || isLoading ? "hidden" : "visible",
          }}
        >
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  onClick={handleNavigateToHub}
                  className="cursor-pointer"
                >
                  Hub
                </BreadcrumbLink>
              </BreadcrumbItem>
              {selectedAgent && (
                <>
                  <BreadcrumbSeparator>
                    <Slash className="h-4 w-4" />
                  </BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbLink>{selectedAgent.agentName}</BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex flex-col space-y-6">
            {!selectedAgent ? (
              // Show agent list when no agent is selected
              <div className="w-full flex flex-col items-start space-y-4">
                <NewAgent
                  knowledgeBaseItems={knowledgeBaseItems}
                  onAgentCreated={refreshAgents}
                  setSelectedAgent={handleAgentSelect}
                />
                <AgentCards
                  setSelectedAgent={handleAgentSelect}
                  agents={agents}
                  loading={agentsLoading}
                  error={agentsError}
                  refreshAgents={refreshAgents}
                />
              </div>
            ) : (
              // Show workspace when agent is selected
              <Workspace
                selectedAgent={selectedAgent}
                setSelectedAgent={setSelectedAgent}
                knowledgeBaseItems={knowledgeBaseItems}
                userInfo={userInfo}
                features={selectedAgent.features}
                userId={userId}
                handleSaveChanges={handleSaveChanges}
                handleDeleteAgent={handleDeleteAgent}
              />
            )}

            <AlertDialog
              open={alertDialogOpen}
              onOpenChange={setAlertDialogOpen}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Notification</AlertDialogTitle>
                  <AlertDialogDescription>
                    {alertDialogMessage}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction onClick={() => setAlertDialogOpen(false)}>
                    OK
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </>
  );
};

export default AgentHub;
