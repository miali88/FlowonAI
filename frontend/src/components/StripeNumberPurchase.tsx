import { useUser } from '@clerk/nextjs';

const api_base_url = process.env.NEXT_PUBLIC_API_BASE_URL || '';

async function getStripeCustomerId() {
  const { user } = useUser();

  const response = await fetch(`${api_base_url}/clerk/get-customer-id`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-User-ID': user?.id || '',
    },
    credentials: 'include', // This ensures the auth cookie is sent
  });

  if (!response.ok) {
    throw new Error('Failed to get customer ID');
  }

  const data = await response.json();
  return data.customerId;
}

async function createSubscriptionWithInlinePricing(
  customerId: string,
  priceAmount: number,
  currency: string = 'usd',
  interval: 'day' | 'week' | 'month' | 'year' = 'month'
) {
  try {
    // Make API call to your FastAPI backend
    const response = await fetch(`${api_base_url}/stripe/create-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
        priceAmount,
        currency,
        interval,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create subscription');
    }

    const data = await response.json();
    return {
      subscriptionId: data.subscriptionId,
      clientSecret: data.clientSecret,
    };
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

// Example usage component
export default function StripeNumberPurchase({ amount }: { amount: number }) {
  const { user } = useUser();

  const handlePurchase = async () => {
    if (!user) {
      console.error('User not logged in');
      return;
    }

    try {
      // Get customer ID from backend
      const customerId = await getStripeCustomerId();
      
      if (!customerId) {
        throw new Error('Failed to get customer ID');
      }

      // Create subscription with inline pricing
      const { subscriptionId, clientSecret } = await createSubscriptionWithInlinePricing(
        customerId,
        amount
      );
      
      // You might want to do something with subscriptionId and clientSecret here
      console.log('Subscription created:', subscriptionId);
      
    } catch (error) {
      console.error('Purchase error:', error);
    }
  };

  return (
    <button onClick={handlePurchase}>
      Purchase ${amount}
    </button>
  );
}