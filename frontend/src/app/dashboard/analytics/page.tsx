'use client';

import React from "react";
import { US, ES, FR, DE, IT } from 'country-flag-icons/react/3x2'
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"; // Assuming you're using shadcn/ui or similar
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'; // For charts

interface AnalyticsMetric {
  label: string;
  value: string | number;
  change?: string;
  languages?: { code: string; count: number }[];
}

const FLAGS_COMPONENTS: Record<string, React.ComponentType> = {
  'US': US,
  'ES': ES,
  'FR': FR,
  'DE': DE,
  'IT': IT,
};

export default function AnalyticsPage() {
  // Example data - replace with actual API calls
  const metrics: AnalyticsMetric[] = [
    { label: "Total Talk Time", value: "328h 45m", change: "+12.3%" },
    { label: "Number of Calls", value: 1247, change: "+5.8%" },
    { label: "Average Call Duration", value: "15m 47s", change: "-2.1%" },
    { label: "Unique Callers", value: 856, change: "+8.4%" },
    { label: "Repeat Callers", value: 391, change: "+15.2%" },
    { 
      label: "Languages Used", 
      value: 5, 
      change: "+25%",
      languages: [
        { code: "US", count: 523 }, // English
        { code: "ES", count: 231 }, // Spanish
        { code: "FR", count: 156 }, // French
        { code: "DE", count: 89 },  // German
        { code: "IT", count: 45 },  // Italian
      ]
    },
  ];

  const popularAgents = [
    { name: "Sales Assistant", calls: 450 },
    { name: "Support Agent", calls: 380 },
    { name: "Lead Qualifier", calls: 290 },
    { name: "Appointment Setter", calls: 270 },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="pb-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </h3>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              {metric.change && (
                <p className={`text-sm ${
                  metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change} from last month
                </p>
              )}
              {metric.languages && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {metric.languages.map((lang) => {
                    const FlagIcon = FLAGS_COMPONENTS[lang.code.toUpperCase()];
                    return (
                      <div key={lang.code} className="flex items-center gap-1 text-sm">
                        {FlagIcon && <div className="w-4 h-4"><FlagIcon /></div>}
                        <span>{lang.count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Popular Agents Chart */}
      <Card className="mt-6">
        <CardHeader>
          <h3 className="text-lg font-semibold">Most Popular Agents</h3>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularAgents}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="calls" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
