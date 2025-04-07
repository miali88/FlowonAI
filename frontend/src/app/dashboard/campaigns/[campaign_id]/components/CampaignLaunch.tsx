import { CampaignMetric } from "@/app/dashboard/campaigns/[campaign_id]/components/CampaignMetric";
import { CampaignClients } from "@/app/dashboard/campaigns/[campaign_id]/components/CampaignClients";
import { CampaignResponse } from "@/types/campaigns";
import { Dispatch, SetStateAction } from "react";

interface CampaignLaunchProps {
  campaignId: string;
  campaign: CampaignResponse;
  onUpdate: Dispatch<SetStateAction<CampaignResponse | null>>;
}

export function CampaignLaunch({ campaignId, campaign, onUpdate }: CampaignLaunchProps) {
  return (
    <div className="space-y-6">
      <CampaignMetric campaign={campaign} />
      <CampaignClients campaign={campaign} />
    </div>
  );
} 