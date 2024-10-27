'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import BillingTab from './BillingTab';
import NotificationsTab from './NotificationsTab';
import { useAuth } from "@clerk/nextjs";
import AccountTab from './AccountTab';

// Load your Stripe publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface NotificationSettings {
  formNotifications: boolean;
  conversationNotifications: boolean;
  emailTranscripts: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function SettingsPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    formNotifications: false,
    conversationNotifications: false,
    emailTranscripts: false
  });

  const handleSettingChange = async (setting: keyof NotificationSettings) => {
    const newSettings = {
      ...notificationSettings,
      [setting]: !notificationSettings[setting]
    };
    
    try {
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getToken()}`
        },
        body: JSON.stringify({
          userId: user?.id,
          notifications: newSettings
        })
      });

      if (response.ok) {
        setNotificationSettings(newSettings);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setNotificationSettings(notificationSettings);
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user?.id) return;  // Early return if no user ID

      try {
        const response = await fetch(`${API_BASE_URL}/settings?userId=${user.id}`, {
          headers: {
            'Authorization': `Bearer ${await getToken()}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setNotificationSettings(data);
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
          <AccountTab user={user} />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsTab 
            notificationSettings={notificationSettings}
            onSettingChange={handleSettingChange}
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
          <Elements stripe={stripePromise}>
            <BillingTab />
          </Elements>
        </TabsContent>
      </Tabs>
    </div>
  );
}
