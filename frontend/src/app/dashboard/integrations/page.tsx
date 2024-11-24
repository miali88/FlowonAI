"use client";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { integrations } from "./integrationsList"
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function IntegrationsPage() {
  const [integrationsList, setIntegrationsList] = useState(integrations);
  const [userConnections, setUserConnections] = useState<string[]>([]);
  const { userId } = useAuth();

  useEffect(() => {
    const fetchConnections = async () => {
      if (!userId) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/composio/connections/${userId}`);
        const data = await response.json();
        setUserConnections(data.connections);
        
        // Update integrations status based on connections
        const updatedIntegrations = integrations.map(integration => ({
          ...integration,
          status: data.connections.includes(integration.name.toLowerCase()) 
            ? "Connected" 
            : integration.status === "Coming soon" 
              ? "Coming soon" 
              : "Not connected"
        }));
        setIntegrationsList(updatedIntegrations);
      } catch (error) {
        console.error("Failed to fetch connections:", error);
      }
    };

    fetchConnections();
  }, [userId]);

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-2">Integrations</h1>
      <p className="text-gray-500 mb-6">
        Connect your favorite apps and services to enhance your workflow.
      </p>

      <div className="relative mb-6">
        <Input
          type="search"
          placeholder="Search integrations..."
          className="w-full bg-background"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {integrationsList.map((integration) => (
          <div
            key={integration.name}
            className="p-4 rounded-lg border bg-card"
          >
            <div className="flex items-center gap-3 mb-2">
              <img
                src={integration.icon}
                alt={integration.name}
                className="w-10 h-10 rounded-lg"
              />
              <div>
                <h3 className="font-semibold">{integration.name}</h3>
                <span className="text-sm px-2 py-1 rounded-full bg-background">
                  {integration.status}
                </span>
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-3">
              {integration.description}
            </p>
            <span className="text-xs px-2 py-1 rounded-full bg-background mb-4 inline-block">
              {integration.category}
            </span>
            <Button
              variant={integration.status === "Connected" ? "secondary" : "default"}
              className="w-full"
              disabled={integration.status === "Coming soon"}
              onClick={() => {
                if (integration.name === "Calendar") {
                  window.location.href = `${API_BASE_URL}/nylas/auth`
                }
              }}
            >
              {integration.status}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
