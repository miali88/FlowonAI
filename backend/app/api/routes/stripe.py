# backend/app/routes/stripe.py
import os 
from dotenv import load_dotenv

from fastapi import APIRouter, HTTPException, Request
import stripe

load_dotenv()

router = APIRouter()
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

@router.post("/create-subscription")
async def create_subscription(
    customer_id: str,
    price_amount: float,
    currency: str = 'usd',
    interval: str = 'month'
):
    try:
        subscription = stripe.Subscription.create(
            customer=customer_id,
            items=[{
                'price_data': {
                    'currency': currency,
                    'product': 'prod_RcfvpRgzSUvVXj',
                    'recurring': {
                        'interval': interval,
                    },
                    'unit_amount': int(price_amount * 100),
                },
            }],
            payment_behavior='default_incomplete',
            payment_settings={
                'payment_method_types': ['card'],
                'save_default_payment_method': 'on_subscription',
            },
            expand=['latest_invoice.payment_intent'],
        )

        return {
            "subscriptionId": subscription.id,
            "clientSecret": subscription.latest_invoice.payment_intent.client_secret
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

