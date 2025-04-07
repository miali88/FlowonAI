"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, PhoneOutgoing } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { CampaignResponse } from "@/types/campaigns";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LoadingWithText } from "@/components/ui/loading";

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<CampaignResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch('/api/campaigns');
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to fetch campaigns');
        }
        const data = await response.json();
        setCampaigns(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        toast.error(err instanceof Error ? err.message : 'Failed to fetch campaigns');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const handleCreateCampaign = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: "New Campaign",
          status: "created"
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create campaign');
      }

      const newCampaign = await response.json();
      toast.success("Campaign created successfully");
      router.push(`/dashboard/campaigns/${newCampaign.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign');
      toast.error(err instanceof Error ? err.message : 'Failed to create campaign');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCampaignClick = (id: string) => {
    router.push(`/dashboard/campaigns/${id}`);
  };

  const handleDeleteCampaign = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    try {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete campaign');
      }

      setCampaigns(campaigns.filter(c => c.id !== id));
      toast.success("Campaign deleted successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete campaign');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "started":
        return "bg-green-50 text-green-700 after:ml-2 after:w-2 after:h-2 after:rounded-full after:bg-green-500 after:animate-[pulse_2s_ease-in-out_infinite] hover:bg-green-100/80";
      case "created":
        return "bg-yellow-50 text-yellow-700 hover:bg-yellow-100/80";
      case "paused":
        return "bg-red-50 text-red-700 hover:bg-red-100/80";
      case "finished":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "started":
        return "Live";
      case "created":
        return "queued";
      case "paused":
        return "Paused";
      case "finished":
        return "Finished";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingWithText text="Loading campaigns..." />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button 
          onClick={handleCreateCampaign} 
          className="bg-black text-white hover:bg-black/90 ml-auto"
          disabled={isCreating}
        >
          <Plus className="mr-2 h-4 w-4" />
          {isCreating ? "Creating..." : "Create new"}
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <PhoneOutgoing className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            Create your first campaign to start making outbound calls
          </p>
          <Button 
            onClick={handleCreateCampaign}
            className="bg-black text-white hover:bg-black/90"
            disabled={isCreating}
          >
            <Plus className="mr-2 h-4 w-4" />
            {isCreating ? "Creating..." : "Create your first campaign"}
          </Button>
        </div>
      ) : (
        <Card className="shadow-none border rounded-lg">
          <CardHeader>
            <CardTitle>All Campaigns</CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/2 text-base font-semibold text-muted-foreground">
                    Campaign Name
                  </TableHead>
                  <TableHead className="w-1/4 text-base font-semibold text-muted-foreground">
                    Start Date
                  </TableHead>
                  <TableHead className="w-1/4 text-base font-semibold text-muted-foreground">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow
                    key={campaign.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleCampaignClick(campaign.id)}
                  >
                    <TableCell className="w-1/2 py-4 font-medium">{campaign.name}</TableCell>
                    <TableCell className="w-1/4 py-4">
                      {campaign.created_at ? format(new Date(campaign.created_at), 'MMM d, yyyy') : '-'}
                    </TableCell>
                    <TableCell className="w-1/4 py-4">
                      <div className="flex items-center justify-between">
                        <Badge
                          className={cn(
                            "inline-flex justify-center items-center px-4 py-1",
                            getStatusBadgeClass(campaign.status)
                          )}
                        >
                          {getStatusDisplay(campaign.status)}
                        </Badge>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="ml-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the campaign
                                and all its associated data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={(e) => handleDeleteCampaign(campaign.id, e)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 