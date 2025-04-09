import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
import pytest
from httpx import AsyncClient
from unittest.mock import patch, AsyncMock, MagicMock
from fastapi import status
from app.main import app
from app.api.routes.stripe import PaymentLinkRequest
from app.services.stripe.services import SubscriptionLinkRequest

@pytest.fixture(autouse=True)
def override_get_current_user():
    from app.api.routes import stripe
    async def mock_user():
        return "mock_user_id"

    app.dependency_overrides[stripe.get_current_user] = mock_user
    yield
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_create_payment_link_success():
    request_data = PaymentLinkRequest(
        unit_amount=1000,
        customer_id="cus_test123",
        twilio_number="+1234567890"
    )

    mock_result = {
        "payment_link": "https://checkout.stripe.com/test_link"
    }

    with patch("app.api.routes.stripe.create_payment_link", new_callable=AsyncMock) as mock_create:
        mock_create.return_value = mock_result["payment_link"]
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.post("/api/v1/stripe/create-payment-link", json=request_data.model_dump())

        assert response.status_code == status.HTTP_200_OK
        assert response.json() == mock_result

@pytest.mark.asyncio
async def test_handle_subscription_completed_success():
    stripe_event_mock = MagicMock()
    stripe_event_mock.type = "checkout.session.completed"
    stripe_event_mock.data.object = MagicMock(mode="subscription", metadata={})

    with patch("stripe.Webhook.construct_event", return_value=stripe_event_mock), \
         patch("app.api.routes.stripe.handle_subscription_completed", new_callable=AsyncMock) as mock_handler:
        mock_handler.return_value = None

        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.post(
                "/api/v1/stripe/webhook",
                json={"type": "checkout.session.completed", "data": {"object": {"mode": "subscription"}}},
                headers={"Stripe-Signature": "test_signature"}
            )

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {"status": "success"}

@pytest.mark.asyncio
async def test_payment_result_success():
    checkout_session_id = "cs_test123"

    mock_result = {
        "status": "succeeded",
        "amount": 1000
    }

    with patch("app.api.routes.stripe.payment_result", new_callable=AsyncMock) as mock_payment:
        mock_payment.return_value = mock_result
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.post(f"/api/v1/stripe/payment-result?checkout_session_id={checkout_session_id}")

        assert response.status_code == status.HTTP_200_OK
        assert response.json() == mock_result

# @pytest.mark.asyncio
# async def test_create_subscription_link_success():
#     request_data = SubscriptionLinkRequest(
#         customer_id="cus_test123",
#         price_id="price_test123"
#     )

#     mock_result = {
#         "payment_link": "https://checkout.stripe.com/test_subscription_link"
#     }

#     with patch("app.api.routes.stripe.create_subscription_link", new_callable=AsyncMock) as mock_create:
#         mock_create.return_value = mock_result["payment_link"]
#         async with AsyncClient(app=app, base_url="http://test") as ac:
#             response = await ac.post("/api/v1/stripe/create-subscription-link", json=request_data.model_dump())

#         assert response.status_code == status.HTTP_200_OK
#         assert response.json() == mock_result
