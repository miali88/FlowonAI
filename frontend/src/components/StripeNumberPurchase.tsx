import { useUser, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

const api_base_url = process.env.NEXT_PUBLIC_API_BASE_URL || "";

interface StripeNumberPurchaseProps {
  amount: number;
  disabled?: boolean;
  twilioNumber?: string;
}

export default function StripeNumberPurchase({
  amount,
  disabled,
  twilioNumber,
}: StripeNumberPurchaseProps) {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const getStripeCustomerId = async () => {
    if (!user) return null;

    const token = await getToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await fetch(
      `${api_base_url}/clerk/get-customer-id`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to get customer ID: ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();
    return data.customer_id;
  };

  const handlePurchase = async () => {
    if (!user) {
      console.error("User not logged in");
      return;
    }

    setIsLoading(true);
    try {
      const customerId = await getStripeCustomerId();

      console.log("CUSTOMER ID", customerId);
      if (!customerId) {
        throw new Error("Failed to get customer ID");
      }

      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${api_base_url}/stripe/create-payment-link`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          credentials: "include",
          body: JSON.stringify({
            customer_id: customerId,
            unit_amount: Math.round(amount * 100), // Round to ensure we send an integer
            twilio_number: twilioNumber || "",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to create payment link: ${JSON.stringify(errorData)}`
        );
      }

      const { payment_link } = await response.json();
      window.location.href = payment_link; // Redirect to Stripe payment page
    } catch (error) {
      console.error("Purchase error:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePurchase}
      disabled={disabled || amount <= 0 || isLoading}
      className="w-[200px] mx-2"
    >
      {isLoading ? "Processing..." : `Purchase for $${amount}`}
    </Button>
  );
}
