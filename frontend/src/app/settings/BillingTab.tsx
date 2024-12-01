import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Pricing } from "@/components/pricing";

interface BillingTabProps {
  userPlan?: string;
}

export default function BillingTab({ userPlan }: BillingTabProps) {
  return (
    <Card>
      <CardContent>
        <div className="space-y-4">
          <div className="pt-8">
            <Pricing currentPlan={userPlan} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
