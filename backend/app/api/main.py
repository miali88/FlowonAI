from fastapi import APIRouter

# from app.api.routes import (twilio, knowledge_base, whatsapp,
#                             chat, voice, livekit, agents, clerk,
#                             conversation, settings, nylas_service, 
#                             composio, feedback, stripe, onboarding,
#                             guided_setup, outbound)

from app.api.routes import (guided_setup, clerk, twilio, stripe, vapi, knowledge_base, conversation, user)

api_router = APIRouter()

api_router.include_router(guided_setup.router, prefix="/guided_setup", tags=["guided_setup"])

api_router.include_router(clerk.router, prefix="/clerk", tags=["clerk"])
api_router.include_router(twilio.router, prefix="/twilio", tags=["twilio"])
api_router.include_router(knowledge_base.router, prefix="/knowledge_base", tags=["knowledge_base"])
api_router.include_router(stripe.router, prefix="/stripe", tags=["stripe"]) 
api_router.include_router(vapi.router, prefix="/vapi", tags=["vapi"])
api_router.include_router(conversation.router, prefix="/conversation", tags=["conversation"])
api_router.include_router(user.router, prefix="/user", tags=["user"])

# api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
# api_router.include_router(voice.router, prefix="/voice", tags=["voice"])
# api_router.include_router(livekit.router, prefix="/livekit", tags=["livekit"])
# api_router.include_router(agents.router, prefix="/agents", tags=["agents"])
# api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
# api_router.include_router(nylas_service.router, prefix="/nylas", tags=["nylas"])
# api_router.include_router(composio.router, prefix="/composio", tags=["composio"])
# api_router.include_router(feedback.router, prefix="/feedback", tags=["feedback"])
# api_router.include_router(whatsapp.router, prefix="/whatsapp", tags=["whatsapp"])
# api_router.include_router(onboarding.router, prefix="/onboarding", tags=["onboarding"])
# api_router.include_router(outbound.router, prefix="/outbound", tags=["outbound"])