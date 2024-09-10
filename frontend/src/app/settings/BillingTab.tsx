import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function BillingTab() {
  // Remove the useStripe hook as we won't be using it directly

  const redirectToCustomerPortal = async () => {
    try {
      const response = await fetch('/api/create-customer-portal-session', {
        method: 'POST',
      });
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error redirecting to customer portal:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing Settings</CardTitle>
        <CardDescription>Manage your pay-as-you-use billing</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Current Usage</h3>
            <p>Your current usage: $X.XX</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Payment Method</h3>
            <Button onClick={redirectToCustomerPortal}>
              Manage Billing
            </Button>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Billing History</h3>
            {/* Add a table or list of recent transactions */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}