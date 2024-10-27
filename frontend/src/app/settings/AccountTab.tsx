import React, { useState, useEffect } from 'react';
import { UserResource } from '@clerk/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@clerk/nextjs";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface AccountTabProps {
  user: UserResource;
  initialSettings?: {
    firstName: string;
    lastName: string;
    businessName: string;
    businessDomain: string;
    email: string;
    phone: string;
  };
}

const BUSINESS_DOMAINS = [
  "Recruitment",
  "Legal",
  "Finance",
  "Marketing",
  "Healthcare",
  "Technology",
  "Education",
  "Real Estate",
  "Retail",
  "Manufacturing",
  "Other"
] as const;

export default function AccountTab({ user, initialSettings }: AccountTabProps) {
  const [formData, setFormData] = useState({
    firstName: initialSettings?.firstName || user.firstName || '',
    lastName: initialSettings?.lastName || user.lastName || '',
    businessName: initialSettings?.businessName || '',
    businessDomain: initialSettings?.businessDomain || '',
    email: initialSettings?.email || user.primaryEmailAddress?.emailAddress || '',
    phone: initialSettings?.phone || ''
  });

  const [isSaving, setIsSaving] = useState(false);

  const { getToken } = useAuth();

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Update the handleSubmit function to match the backend's expected format
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getToken()}`
        },
        body: JSON.stringify({
          userId: user.id,
          account: formData  // Wrap the form data in 'account' key
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save settings');
      }

      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Add useEffect to properly initialize form data when initialSettings changes
  useEffect(() => {
    if (initialSettings) {
      setFormData({
        firstName: initialSettings.firstName || user.firstName || '',
        lastName: initialSettings.lastName || user.lastName || '',
        businessName: initialSettings.businessName || '',
        businessDomain: initialSettings.businessDomain || '',
        email: initialSettings.email || user.primaryEmailAddress?.emailAddress || '',
        phone: initialSettings.phone || ''
      });
    }
  }, [initialSettings, user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>Manage your account details</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName" 
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName" 
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input 
                id="businessName" 
                value={formData.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="businessDomain">Business Domain</Label>
              <Select onValueChange={(value) => handleChange('businessDomain', value)}>
                <SelectTrigger id="businessDomain">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_DOMAINS.map((domain) => (
                    <SelectItem key={domain} value={domain.toLowerCase()}>
                      {domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="phone">Contact Number</Label>
            <Input 
              id="phone" 
              type="tel" 
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
