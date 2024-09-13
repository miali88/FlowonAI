import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';

export default function BillingTab() {
  const [isLoading, setIsLoading] = useState(false);

  const redirectToCustomerPortal = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/create-customer-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Include any necessary user identification
        body: JSON.stringify({ userId: 'current-user-id' }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create customer portal session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error redirecting to customer portal:', error);
      // Handle error (e.g., show an error message to the user)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing Settings</CardTitle>
        <CardDescription>Manage your subscription and billing details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Current Plan</h3>
            <p>Your current plan: [Plan Name]</p>
            {/* Fetch and display current plan details */}
          </div>
          <div>
            <h3 className="text-lg font-semibold">Manage Subscription</h3>
            <Button onClick={redirectToCustomerPortal} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Manage Billing'
              )}
            </Button>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Next Payment</h3>
            <p>Your next payment: [Date] - [Amount]</p>
            {/* Fetch and display next payment details */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}