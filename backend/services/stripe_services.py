from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import stripe
from typing import Optional
import os 
from dotenv import load_dotenv

load_dotenv()

# Initialize Stripe
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

class PaymentLinkRequest(BaseModel):
    product_id: str = "prod_RcfvpRgzSUvVXj"
    quantity: int = 1
    unit_amount: int 
    currency: Optional[str] = "usd"
    customer_id: str

async def create_payment_link(request: PaymentLinkRequest):
    try:
        # Create a Price object with the dynamic amount
        price = stripe.Price.create(
            unit_amount=request.unit_amount,
            currency=request.currency,
            product=request.product_id,
        )

        # Create a Payment Link with metadata
        payment_link = stripe.PaymentLink.create(
            line_items=[{
                'price': price.id,
                'quantity': request.quantity,
            }],
            after_completion={'type': 'redirect', 'redirect': {'url': os.getenv('FRONTEND_BASE_URL') + '/dashboard/agenthub'}},
            metadata={
                'customer_id': request.customer_id
            } if request.customer_id else {}
        )

        return payment_link.url
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))    