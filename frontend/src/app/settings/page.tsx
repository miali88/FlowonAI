'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BillingTab from './BillingTab';
import NotificationsTab, { NotificationSettings } from './NotificationsTab';
import { useAuth } from "@clerk/nextjs";
import AccountTab from './AccountTab';

interface Settings {
  notification_settings: NotificationSettings;
  account_settings: {
    firstName: string;
    lastName: string;
    businessName: string;
    businessDomain: string;
    email: string;
    phone: string;
  };
  user_plan?: string; // You might want to remove this if it's only used for Stripe
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function SettingsPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`${API_BASE_URL}/settings?userId=${user.id}`, {
          headers: {
            'Authorization': `Bearer ${await getToken()}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setSettings(data.settings);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };

    fetchSettings();
  }, [user, getToken]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <Tabs defaultValue="account">
        <TabsList className="mb-4">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <AccountTab 
            user={user} 
            initialSettings={settings?.account_settings}
          />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsTab 
            settings={settings?.notification_settings}
          />
        </TabsContent>
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Add security settings here */}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="billing">
          <BillingTab userPlan={settings?.user_plan} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
