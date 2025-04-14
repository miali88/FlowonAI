import { CampaignCreate, CampaignResponse, CampaignUpdate } from '../../types/campaigns';

export async function getCampaigns(): Promise<CampaignResponse[]> {
  const response = await fetch('/api/campaigns', {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch campaigns');
  }
  return response.json();
}

export async function getCampaign(campaignId: string): Promise<CampaignResponse> {
  const response = await fetch(`/api/campaigns/${campaignId}`, {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch campaign');
  }
  return response.json();
}

export async function createCampaign(campaign: CampaignCreate): Promise<CampaignResponse> {
  const response = await fetch('/api/campaigns', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(campaign),
  });
  if (!response.ok) {
    throw new Error('Failed to create campaign');
  }
  return response.json();
}

export async function updateCampaign(campaignId: string, campaign: CampaignUpdate): Promise<CampaignResponse> {
  const response = await fetch(`/api/campaigns/${campaignId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(campaign),
  });
  if (!response.ok) {
    throw new Error('Failed to update campaign');
  }
  return response.json();
}

export async function deleteCampaign(campaignId: string): Promise<void> {
  const response = await fetch(`/api/campaigns/${campaignId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to delete campaign');
  }
}

export async function updateCampaignStatus(campaignId: string, status: string): Promise<CampaignResponse> {
  const response = await fetch(`/api/campaigns/${campaignId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    throw new Error('Failed to update campaign status');
  }
  return response.json();
}

export async function uploadClientsCSV(campaignId: string, file: File): Promise<CampaignResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`/api/campaigns/${campaignId}/upload-clients`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Failed to upload clients CSV');
  }
  return response.json();
}

export async function createOrUpdateCampaignAssistant(
  campaignId: string, 
  campaign: CampaignResponse
): Promise<{ 
  success: boolean; 
  message: string; 
  assistant_data: { 
    id: string;
    name: string;
    voice_id: string;
    first_message: string;
    metadata: Record<string, string>;
  } 
}> {
  const response = await fetch(`/api/campaigns/${campaignId}/assistant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(campaign),
  });
  if (!response.ok) {
    throw new Error('Failed to create/update campaign assistant');
  }
  return response.json();
} 