"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Clock, PlayCircle, ChevronLeft, Play, Pause } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { AddClients } from "./components/AddClients";
import { CampaignDetails } from "./components/CampaignDetails";
import { CampaignLaunch } from "./components/CampaignLaunch";
import { campaigns, updateCampaignName, updateCampaignStatus } from "@/app/dashboard/campaigns/[campaign_id]/data/campaigns";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function CampaignPage() {
  const [activeTab, setActiveTab] = useState("add-clients");
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [campaignData, setCampaignData] = useState<typeof campaign | undefined>(undefined);
  const router = useRouter();
  const params = useParams();
  const campaignId = parseInt(params?.campaign_id as string);
  const campaign = campaigns.find(c => c.id === campaignId);

  useEffect(() => {
    if (campaign) {
      setCampaignData(campaign);
      setEditedName(campaign.name);
    }
  }, [campaign]);

  const handleBack = () => {
    router.push("/dashboard/campaigns");
  };

  const handleNameEdit = () => {
    if (isEditing && editedName.trim() !== "") {
      updateCampaignName(campaignId, editedName.trim());
      setCampaignData(prev => prev ? { ...prev, name: editedName.trim() } : undefined);
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

  const handleStatusChange = () => {
    const newStatus = campaignData?.status === "Live" ? "Paused" : "Live";
    updateCampaignStatus(campaignId, newStatus);
    setCampaignData(prev => prev ? { ...prev, status: newStatus } : undefined);
  };

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
                {campaignData.status === "Live" && (
                  <Badge 
                    className={cn(
                      "inline-flex justify-center items-center px-4 py-1 bg-green-50 text-green-700 after:ml-2 after:w-2 after:h-2 after:rounded-full after:bg-green-500 after:animate-[pulse_2s_ease-in-out_infinite]"
                    )}
                  >
                    {campaignData.status}
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          <Button
            variant={campaignData.status === "Live" ? "destructive" : "default"}
            onClick={handleStatusChange}
            className="min-w-[140px]"
          >
            {campaignData.status === "Live" ? (
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
          <AddClients />
        </TabsContent>

        <TabsContent value="campaign-details">
          <CampaignDetails />
        </TabsContent>

        <TabsContent value="launch">
          <CampaignLaunch />
        </TabsContent>
      </Tabs>
    </div>
  );
} 