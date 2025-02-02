from fastapi import APIRouter

from app.api.routes import (twilio, knowledge_base, whatsapp,
                            chat, voice, livekit, agents,
                            conversation, settings, nylas_service, 
                            clerk, composio, feedback, stripe)

api_router = APIRouter()

api_router.include_router(clerk.router, prefix="/clerk", tags=["clerk"])
api_router.include_router(twilio.router, prefix="/twilio", tags=["twilio"])
api_router.include_router(knowledge_base.router, prefix="/knowledge_base", tags=["knowledge_base"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(voice.router, prefix="/voice", tags=["voice"])
api_router.include_router(livekit.router, prefix="/livekit", tags=["livekit"])
api_router.include_router(conversation.router, prefix="/conversation", tags=["conversation"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
api_router.include_router(nylas_service.router, prefix="/nylas", tags=["nylas"])
api_router.include_router(composio.router, prefix="/composio", tags=["composio"])
api_router.include_router(feedback.router, prefix="/feedback", tags=["feedback"])
api_router.include_router(stripe.router, prefix="/stripe", tags=["stripe"]) 
api_router.include_router(agents.router, prefix="/agents", tags=["agents"])
api_router.include_router(whatsapp.router, prefix="/whatsapp", tags=["whatsapp"])