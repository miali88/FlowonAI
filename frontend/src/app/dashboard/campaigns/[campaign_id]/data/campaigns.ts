export interface Campaign {
  id: number;
  name: string;
  startDate: string;
  status: string;
}

let campaigns: Campaign[] = [
  {
    id: 1,
    name: "Leads from Ads",
    startDate: "2nd April 2025",
    status: "Live",
  },
  {
    id: 2,
    name: "Follow-up Campaign",
    startDate: "15th April 2025",
    status: "Pending",
  },
];

export const addNewCampaign = () => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { 
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const newCampaign: Campaign = {
    id: campaigns.length > 0 ? Math.max(...campaigns.map(c => c.id)) + 1 : 1,
    name: "Untitled Campaign",
    startDate: formattedDate,
    status: "Pending"
  };

  campaigns = [...campaigns, newCampaign];
  return newCampaign;
};

export const updateCampaignName = (id: number, newName: string) => {
  campaigns = campaigns.map(campaign => 
    campaign.id === id ? { ...campaign, name: newName } : campaign
  );
};

export const updateCampaignStatus = (id: number, newStatus: string) => {
  campaigns = campaigns.map(campaign => 
    campaign.id === id ? { ...campaign, status: newStatus } : campaign
  );
};

export { campaigns }; 