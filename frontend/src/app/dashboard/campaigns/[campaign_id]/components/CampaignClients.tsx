import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "./StatusBadge";
import { CampaignResponse, Client } from "@/types/campaigns";

interface CampaignClientsProps {
  campaign: CampaignResponse;
}

export function CampaignClients({ campaign }: CampaignClientsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Status</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[20%]">Name</TableHead>
              <TableHead className="w-[15%]">Number</TableHead>
              <TableHead className="w-[10%]">Language</TableHead>
              <TableHead className="w-[30%]">Details</TableHead>
              <TableHead className="w-[15%]">Status</TableHead>
              <TableHead className="w-[10%] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaign.clients?.map((client: Client, index: number) => (
              <TableRow key={index}>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.phone_number}</TableCell>
                <TableCell>{client.language}</TableCell>
                <TableCell>
                  {Object.entries(client.personal_details || {}).map(([key, value]) => (
                    `${key}: ${value}`
                  )).join(', ')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-start">
                    <StatusBadge status={client.status.status} />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm">
                    Summary
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 