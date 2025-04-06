import { CampaignMetric } from "@/app/dashboard/campaigns/[campaign_id]/components/CampaignMetric";
import { CampaignClients } from "@/app/dashboard/campaigns/[campaign_id]/components/CampaignClients";

export function CampaignLaunch() {
  return (
    <div className="space-y-6">
      <CampaignMetric />
      <CampaignClients />
    </div>
  );
} 