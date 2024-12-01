import React, { useState } from 'react';
import { useUser, useAuth } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export interface NotificationSettings {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  // ... add other notification settings as needed
}

interface NotificationsTabProps {
  settings?: NotificationSettings;
}

export default function NotificationsTab({ settings }: NotificationsTabProps) {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: settings?.emailNotifications ?? false,
    pushNotifications: settings?.pushNotifications ?? false
  });

  const handleSettingChange = async (setting: keyof NotificationSettings) => {
    const newSettings = {
      ...notificationSettings,
      [setting]: !notificationSettings[setting]
    };
    
    setNotificationSettings(newSettings);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications via email
            </p>
          </div>
          <Switch 
            id="email-notifications" 
            checked={notificationSettings.emailNotifications}
            onCheckedChange={() => handleSettingChange('emailNotifications')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="push-notifications">Push Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications via push notifications
            </p>
          </div>
          <Switch 
            id="push-notifications"
            checked={notificationSettings.pushNotifications}
            onCheckedChange={() => handleSettingChange('pushNotifications')}
          />
        </div>
      </CardContent>
    </Card>
  );
}
