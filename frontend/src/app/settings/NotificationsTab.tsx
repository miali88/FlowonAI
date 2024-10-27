import React, { useState } from 'react';
import { useUser, useAuth } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface NotificationsTabProps {
  settings?: {
    formNotifications: boolean;
    conversationNotifications: boolean;
    emailTranscripts: boolean;
  };
}

export default function NotificationsTab({ settings }: NotificationsTabProps) {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [notificationSettings, setNotificationSettings] = useState({
    formNotifications: settings?.formNotifications ?? false,
    conversationNotifications: settings?.conversationNotifications ?? false,
    emailTranscripts: settings?.emailTranscripts ?? false
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="form-notifications">Form Completion Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications when someone completes a form
            </p>
          </div>
          <Switch 
            id="form-notifications" 
            checked={notificationSettings.formNotifications}
            onCheckedChange={() => handleSettingChange('formNotifications')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="conversation-notifications">Conversation Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications after every conversation
            </p>
          </div>
          <Switch 
            id="conversation-notifications"
            checked={notificationSettings.conversationNotifications}
            onCheckedChange={() => handleSettingChange('conversationNotifications')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="transcript-email">Email Transcripts</Label>
            <p className="text-sm text-muted-foreground">
              Receive conversation transcripts via email
            </p>
          </div>
          <Switch 
            id="transcript-email"
            checked={notificationSettings.emailTranscripts}
            onCheckedChange={() => handleSettingChange('emailTranscripts')}
          />
        </div>
      </CardContent>
    </Card>
  );
}
