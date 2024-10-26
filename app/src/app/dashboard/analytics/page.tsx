import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Analytics() {
  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-4">Analytics</h3>
      <p className="text-muted-foreground mb-6">
        View and analyze your data here.
      </p>
      <Card className="w-full mb-6">
        <CardHeader>
          <CardTitle>Logs</CardTitle>
          <CardDescription>Recent system logs and activities</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <p className="mb-2">2023-06-15 10:30:22 - User login: admin@example.com</p>
            <p className="mb-2">2023-06-15 10:35:15 - New project created: Project X</p>
            <p className="mb-2">2023-06-15 11:02:47 - Feature update: Analytics module v2.1</p>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
