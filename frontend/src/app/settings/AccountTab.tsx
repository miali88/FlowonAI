import React from 'react';
import { UserResource } from '@clerk/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AccountTabProps {
  user: UserResource;
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

export default function AccountTab({ user }: AccountTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>Manage your account details</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" defaultValue={user.firstName || ''} />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" defaultValue={user.lastName || ''} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input id="businessName" defaultValue={''} />
            </div>
            <div>
              <Label htmlFor="businessDomain">Business Domain</Label>
              <Select>
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
            <Input id="email" type="email" defaultValue={user.primaryEmailAddress?.emailAddress || ''} />
          </div>
          <div>
            <Label htmlFor="phone">Contact Number</Label>
            <Input id="phone" type="tel" defaultValue={''} />
          </div>
          <Button type="submit">Save Changes</Button>
        </form>
      </CardContent>
    </Card>
  );
}
