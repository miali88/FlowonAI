import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');
const api_base_url = process.env.NEXT_PUBLIC_API_BASE_URL || '';

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

async function createCheckoutSession(
  priceAmount: number,
  currency: string = 'usd',
  mode: 'payment' | 'subscription' = 'subscription'
) {
  try {
    const response = await fetch(`${api_base_url}/stripe/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceAmount,
        currency,
        mode,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const { url } = await response.json();
    if (url) {
      window.location.href = url;
    } else {
      throw new Error('No checkout URL received');
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

// Example usage
async function example() {
  try {
    const result = await createSubscriptionWithInlinePricing(
      'cus_customer_id', // Replace with actual customer ID
      29.99, // Price amount (will be converted to cents)
      'usd',
      'month'
    );

    console.log('Subscription created:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example usage component
export default function StripeNumberPurchase({ amount }: { amount: number }) {
  const handlePurchase = async () => {
    try {
      await createCheckoutSession(amount);
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




