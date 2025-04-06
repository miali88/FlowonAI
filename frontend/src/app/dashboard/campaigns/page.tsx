"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
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
import { campaigns, addNewCampaign } from "@/app/dashboard/campaigns/[campaign_id]/data/campaigns";
import { cn } from "@/lib/utils";

export default function CampaignsPage() {
  const router = useRouter();

  const handleCreateCampaign = () => {
    const newCampaign = addNewCampaign();
    router.push(`/dashboard/campaigns/${newCampaign.id}`);
  };

  const handleCampaignClick = (id: number) => {
    router.push(`/dashboard/campaigns/${id}`);
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button onClick={handleCreateCampaign} className="bg-black text-white hover:bg-black/90 ml-auto">
          <Plus className="mr-2 h-4 w-4" />
          Create new
        </Button>
      </div>

      <Card className="shadow-none border rounded-lg">
        <CardHeader className="pb-4">
          <CardTitle>All Campaigns</CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/2 text-base font-semibold text-muted-foreground">
                  Campaign Name
                </TableHead>
                <TableHead className="w-1/4 text-base font-semibold text-muted-foreground">
                  Start Date
                </TableHead>
                <TableHead className="w-1/4 text-base font-semibold text-muted-foreground text-center">
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
                  <TableCell className="w-1/4 py-4">{campaign.startDate}</TableCell>
                  <TableCell className="w-1/4 py-4 text-center">
                    <Badge
                      className={cn(
                        "inline-flex justify-center items-center px-4 py-1",
                        campaign.status === "Live"
                          ? "bg-green-50 text-green-700 after:ml-2 after:w-2 after:h-2 after:rounded-full after:bg-green-500 after:animate-[pulse_2s_ease-in-out_infinite] hover:bg-green-100/80"
                          : campaign.status === "Pending"
                          ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100/80"
                          : campaign.status === "Paused"
                          ? "bg-red-50 text-red-700 hover:bg-red-100/80"
                          : "bg-gray-100 text-gray-800"
                      )}
                    >
                      {campaign.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 