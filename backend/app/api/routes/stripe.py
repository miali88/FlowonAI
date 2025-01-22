from pydantic import BaseModel
from typing import Optional

from fastapi import APIRouter, HTTPException, Request

from services.stripe_services import create_payment_link

router = APIRouter()
class PaymentLinkRequest(BaseModel):
    product_id: str
    quantity: int
    unit_amount: int
    currency: Optional[str] = "usd"

@router.post("/create-payment-link")
async def create_payment_link_handler(request: PaymentLinkRequest):
    try:
        payment_link = await create_payment_link(request)
        return {"payment_link": payment_link}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
