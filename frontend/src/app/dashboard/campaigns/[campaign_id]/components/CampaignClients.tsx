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
import { clients } from "../data/clients";
import { StatusBadge } from "./StatusBadge";

export function CampaignClients() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Status</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Number</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.number}</TableCell>
                <TableCell>{client.language}</TableCell>
                <TableCell>
                  {JSON.stringify(client.personalDetails)}
                </TableCell>
                <TableCell className="flex">
                  <StatusBadge status={client.status || "Pending"} />
                </TableCell>
                <TableCell>
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