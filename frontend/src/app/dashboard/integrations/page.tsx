"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { integrations } from "./integrationsList";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Integration {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  status: string;
}

interface ConnectionData {
  account: string;
  integratedDate: string;
  status: "active" | "pending" | "inactive";
}

export default function IntegrationsPage() {
  const [integrationsList, setIntegrationsList] = useState(integrations);
  const { userId } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] =
    useState<Integration | null>(null);
  const [connections, setConnections] = useState<ConnectionData[]>([
    {
      account: "example@email.com",
      integratedDate: "2024-03-20",
      status: "active",
    },
    {
      account: "example@email.com",
      integratedDate: "2024-03-20",
      status: "pending",
    },
    {
      account: "example@email.com",
      integratedDate: "2024-03-20",
      status: "inactive",
    },
    {
      account: "example@email.com",
      integratedDate: "2024-03-20",
      status: "active",
    },
  ]);

  useEffect(() => {
    const fetchConnections = async () => {
      if (!userId) return;

      try {
        const response = await fetch(
          `${API_BASE_URL}/composio/connections/${userId}`
        );
        const data = await response.json();

        // Update integrations status based on connections
        const updatedIntegrations = integrations.map((integration) => ({
          ...integration,
          status: data.connections.includes(integration.id.toLowerCase())
            ? "Connected"
            : integration.status === "Coming soon"
            ? "Coming soon"
            : "Not connected",
        }));
        setIntegrationsList(updatedIntegrations);
      } catch (error) {
        console.error("Failed to fetch connections:", error);
      }
    };

    fetchConnections();
  }, [userId]);

  const handleIntegrationClick = async (integration: Integration) => {
    if (integration.status === "Connected") return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/composio/new_connection/${userId}/${integration.id}`
      );
      const data = await response.json();

      if (data.redirectUrl) {
        window.open(data.redirectUrl, "_blank");
      }
    } catch (error) {
      console.error("Failed to initiate connection:", error);
    }
  };

  const handleDelete = (account: string) => {
    setConnections(connections.filter((conn) => conn.account !== account));
    // Add API call to delete connection
  };

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
          <div key={integration.name} className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-3 mb-2">
              <Image
                src={integration.icon}
                alt={integration.name}
                width={40}
                height={40}
                className="rounded-lg"
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
            <div className="flex gap-2 mt-2">
              <Button
                variant={
                  integration.status === "Connected" ? "secondary" : "default"
                }
                className="flex-1"
                disabled={integration.status === "Coming soon"}
                onClick={() => handleIntegrationClick(integration)}
              >
                {integration.status}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedIntegration(integration);
                  setIsModalOpen(true);
                }}
              >
                View
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedIntegration?.name} Connections</DialogTitle>
            <div className="flex justify-end">
              <Button
                onClick={() =>
                  selectedIntegration &&
                  handleIntegrationClick(selectedIntegration)
                }
              >
                Add New Connection
              </Button>
            </div>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Integrated Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {connections.map((connection) => (
                <TableRow key={connection.account}>
                  <TableCell>{connection.account}</TableCell>
                  <TableCell>{connection.integratedDate}</TableCell>
                  <TableCell>{connection.status}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(connection.account)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  );
}
