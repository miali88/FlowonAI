"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Clock, PlayCircle, ChevronLeft, Play, Pause, Trash2, Loader2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { AddClients } from "./components/AddClients";
import { CampaignDetails } from "./components/CampaignDetails";
import { CampaignLaunch } from "./components/CampaignLaunch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CampaignResponse } from "@/types/campaigns";
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

export default function CampaignPage() {
  const [activeTab, setActiveTab] = useState("add-clients");
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [campaignData, setCampaignData] = useState<CampaignResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const params = useParams();
  const campaignId = params?.campaign_id as string;

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await fetch(`/api/campaigns/${campaignId}`);
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to fetch campaign');
        }
        const campaign = await response.json();
        setCampaignData(campaign);
        setEditedName(campaign.name);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch campaign');
        toast.error(err instanceof Error ? err.message : 'Failed to fetch campaign');
      } finally {
        setIsLoading(false);
      }
    };

    if (campaignId) {
      fetchCampaign();
    }
  }, [campaignId]);

  const handleBack = () => {
    router.push("/dashboard/campaigns");
  };

  const handleNameEdit = async () => {
    if (isEditing && editedName.trim() !== "" && campaignData) {
      setIsUpdating(true);
      try {
        const response = await fetch(`/api/campaigns/${campaignId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...campaignData,
            name: editedName.trim()
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update campaign name');
        }

        const updatedCampaign = await response.json();
        setCampaignData(updatedCampaign);
        toast.success("Campaign name updated successfully");
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update campaign name');
        toast.error(err instanceof Error ? err.message : 'Failed to update campaign name');
      } finally {
        setIsUpdating(false);
      }
    }
    setIsEditing(!isEditing);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameEdit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditedName(campaignData?.name || "Untitled Campaign");
    }
  };

  const handleStatusChange = async () => {
    if (!campaignData) return;
    
    setIsUpdating(true);
    try {
      const newStatus = campaignData.status === "started" ? "paused" : "started";
      const response = await fetch(`/api/campaigns/${campaignId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update campaign status');
      }

      const updatedCampaign = await response.json();
      setCampaignData(updatedCampaign);
      toast.success(`Campaign ${newStatus === "started" ? "started" : "paused"} successfully`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update campaign status');
      toast.error(err instanceof Error ? err.message : 'Failed to update campaign status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCampaign = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete campaign');
      }

      toast.success("Campaign deleted successfully");
      router.push("/dashboard/campaigns");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete campaign');
      toast.error(err instanceof Error ? err.message : 'Failed to delete campaign');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingWithText text="Loading campaign..." />
      </div>
    );
  }

  if (error) {
    return <div className="container mx-auto p-6 text-red-500">Error: {error}</div>;
  }

  if (!campaignData) return null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-6">
        <Button
          variant="ghost"
          className="w-fit flex items-center text-muted-foreground hover:text-foreground"
          onClick={handleBack}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Campaigns
        </Button>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {isEditing ? (
              <Input
                className="text-3xl font-bold h-12"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={handleNameEdit}
                onKeyDown={handleKeyPress}
                autoFocus
                disabled={isUpdating}
              />
            ) : (
              <div className="flex items-center gap-3">
                <h1 
                  className="text-3xl font-bold cursor-pointer hover:bg-muted/50 px-2 py-1 rounded"
                  onClick={() => {
                    setIsEditing(true);
                    setEditedName(campaignData.name || "Untitled Campaign");
                  }}
                >
                  {campaignData.name || "Untitled Campaign"}
                </h1>
                {campaignData.status === "started" && (
                  <Badge 
                    className={cn(
                      "inline-flex justify-center items-center px-4 py-1 bg-green-50 text-green-700",
                      "after:ml-2 after:w-2 after:h-2 after:rounded-full after:bg-green-500 after:animate-[pulse_2s_ease-in-out_infinite]"
                    )}
                  >
                    Live
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Campaign
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
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteCampaign}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Button
              variant={campaignData.status === "started" ? "destructive" : "default"}
              onClick={handleStatusChange}
              className="min-w-[140px]"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : campaignData.status === "started" ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause Campaign
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Campaign
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1 gap-1">
          <TabsTrigger value="add-clients" className="py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Users className="mr-2 h-5 w-5" />
            1: Add Clients
          </TabsTrigger>
          <TabsTrigger value="campaign-details" className="py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Clock className="mr-2 h-5 w-5" />
            2: Campaign Details
          </TabsTrigger>
          <TabsTrigger value="launch" className="py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <PlayCircle className="mr-2 h-5 w-5" />
            3: Launch
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add-clients">
          <AddClients campaignId={campaignId} campaign={campaignData} onUpdate={setCampaignData} />
        </TabsContent>

        <TabsContent value="campaign-details">
          <CampaignDetails campaignId={campaignId} campaign={campaignData} onUpdate={setCampaignData} />
        </TabsContent>

        <TabsContent value="launch">
          <CampaignLaunch campaignId={campaignId} campaign={campaignData} onUpdate={setCampaignData} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 