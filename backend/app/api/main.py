from fastapi import APIRouter

from app.api.routes import retellai, twilio, dashboard, chat, voice, livekit, vapi, conversation

api_router = APIRouter()

api_router.include_router(retellai.router, prefix="/retellai", tags=["retellai"])
api_router.include_router(twilio.router, prefix="/twilio", tags=["twilio"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(voice.router, prefix="/voice", tags=["voice"])
api_router.include_router(livekit.router, prefix="/livekit", tags=["livekit"])
api_router.include_router(vapi.router, prefix="/vapi", tags=["vapi"])
api_router.include_router(conversation.router, prefix="/conversation", tags=["conversation"])