"use client";

import { Line, LineChart as RechartsLineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Users, CheckCircle2, RefreshCcw, Clock, TrendingUp, LucideIcon } from "lucide-react";

// Sample data - replace with real data from your API
const monthlyData = [
  { month: 'Jan', calls: 120, answered: 80, retries: 2.5 },
  { month: 'Feb', calls: 150, answered: 95, retries: 2.1 },
  { month: 'Mar', calls: 180, answered: 120, retries: 1.8 },
  { month: 'Apr', calls: 200, answered: 150, retries: 1.5 },
  { month: 'May', calls: 220, answered: 180, retries: 1.2 },
];

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

export function CampaignMetric() {
  return (
    <div className="space-y-8">
      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Total Calls"
          value="1,469"
          icon={Phone}
          description="All attempted calls"
        />
        <MetricCard
          title="Remaining Clients"
          value="237"
          icon={Users}
          description="Clients yet to be called"
        />
        <MetricCard
          title="Calls Answered"
          value="881"
          icon={CheckCircle2}
          description="60% answer rate"
        />
        <MetricCard
          title="Avg. Retries per Client"
          value="2.5"
          icon={RefreshCcw}
          description="Attempts before success"
        />
        <MetricCard
          title="Avg. Call Duration"
          value="4.2 min"
          icon={Clock}
          description="Time spent per call"
        />
        <MetricCard
          title="Success Rate"
          value="73.5%"
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