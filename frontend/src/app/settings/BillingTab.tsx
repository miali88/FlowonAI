import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { Pricing } from "@/components/pricing";

interface BillingTabProps {
  userPlan?: string;
}

export default function BillingTab({ userPlan }: BillingTabProps) {
  const [isLoading, setIsLoading] = useState(false);

  const redirectToCustomerPortal = async () => {
    setIsLoading(true);
    try {
      // Add error handling for the response
      const response = await fetch('/api/create-customer-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: 'current-user-id' }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create customer portal session');
      }

      const { url } = await response.json();
      // Open in new tab instead of redirecting current page
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error redirecting to customer portal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <div className="space-y-4">
          
          {/* Add separator before pricing section */}
          <div className="pt-8">
            <Pricing currentPlan={userPlan} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
