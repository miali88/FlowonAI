from fastapi import APIRouter

from app.api.routes import items, login, users, utils, \
    retellai, twilio, vapi, onboarding, pipeline, dashboard, chat

api_router = APIRouter()

api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(utils.router, prefix="/utils", tags=["utils"])
api_router.include_router(items.router, prefix="/items", tags=["items"])
api_router.include_router(retellai.router, prefix="/retellai", tags=["retellai"])
api_router.include_router(twilio.router, prefix="/twilio", tags=["twilio"])
api_router.include_router(vapi.router, prefix="/vapi", tags=["vapi"])
api_router.include_router(onboarding.router, prefix="/new", tags=["new"])
api_router.include_router(pipeline.router, prefix="/pipeline", tags=["pipeline"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])

#api_router.include_router(blandai.router, prefix="/blandai", tags=["blandai"])
