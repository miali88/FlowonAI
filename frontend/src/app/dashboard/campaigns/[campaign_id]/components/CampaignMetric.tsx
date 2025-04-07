"use client";

import { Line, LineChart as RechartsLineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Users, CheckCircle2, RefreshCcw, Clock, TrendingUp, LucideIcon } from "lucide-react";
import { CampaignResponse } from "@/types/campaigns";
import { useMemo } from "react";

interface CampaignMetricProps {
  campaign: CampaignResponse;
}

interface MonthlyData {
  month: string;
  calls: number;
  answered: number;
  retries: number;
}

const MetricCard = ({ title, value, icon: Icon, description }: { 
  title: string; 
  value: string | number; 
  icon: LucideIcon;
  description?: string;
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between space-y-0">
        <h3 className="text-sm font-medium tracking-tight text-muted-foreground">{title}</h3>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2.5">
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    </CardContent>
  </Card>
);

export function CampaignMetric({ campaign }: CampaignMetricProps) {
  const metrics = useMemo(() => {
    const totalCalls = campaign.clients?.reduce((sum, client) => sum + client.status.number_of_calls, 0) || 0;
    const answeredCalls = campaign.clients?.filter(client => client.status.status === "Completed").length || 0;
    const remainingClients = campaign.clients?.filter(client => client.status.status === "Pending").length || 0;
    const avgRetries = totalCalls / (campaign.clients?.length || 1);
    const avgDuration = 0; // This will need to come from the backend
    const successRate = (answeredCalls / (campaign.clients?.length || 1)) * 100;

    return {
      totalCalls,
      answeredCalls,
      remainingClients,
      avgRetries,
      avgDuration,
      successRate,
    };
  }, [campaign]);

  const monthlyData = useMemo(() => {
    // This will need to come from the backend
    const data: MonthlyData[] = [];
    return data;
  }, []);

  return (
    <div className="space-y-8">
      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Total Calls"
          value={metrics.totalCalls}
          icon={Phone}
          description="All attempted calls"
        />
        <MetricCard
          title="Remaining Clients"
          value={metrics.remainingClients}
          icon={Users}
          description="Clients yet to be called"
        />
        <MetricCard
          title="Calls Answered"
          value={metrics.answeredCalls}
          icon={CheckCircle2}
          description={`${((metrics.answeredCalls / metrics.totalCalls) * 100).toFixed(0)}% answer rate`}
        />
        <MetricCard
          title="Avg. Retries per Client"
          value={metrics.avgRetries.toFixed(1)}
          icon={RefreshCcw}
          description="Attempts before success"
        />
        <MetricCard
          title="Avg. Call Duration"
          value={`${metrics.avgDuration.toFixed(1)} min`}
          icon={Clock}
          description="Time spent per call"
        />
        <MetricCard
          title="Success Rate"
          value={`${metrics.successRate.toFixed(1)}%`}
          icon={TrendingUp}
          description="Overall campaign performance"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Monthly Calls Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Call Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    className="text-xs fill-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    className="text-xs fill-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid gap-2">
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  Total Calls
                                </span>
                                <span className="font-bold text-muted-foreground">
                                  {payload[0].value}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  Answered
                                </span>
                                <span className="font-bold text-muted-foreground">
                                  {payload[1].value}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="calls" fill="hsl(var(--primary))" name="Total Calls" />
                  <Bar dataKey="answered" fill="#939392" name="Answered" />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Retries Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Average Retries Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    className="text-xs fill-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    className="text-xs fill-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Average Retries
                              </span>
                              <span className="font-bold text-muted-foreground">
                                {payload[0].value}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="retries"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                    name="Avg. Retries"
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 