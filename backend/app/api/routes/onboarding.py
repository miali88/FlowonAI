from fastapi import APIRouter, HTTPException, Request, Depends
from app.api.deps import get_current_user

router = APIRouter()

onboarding_steps = [
    {"step": "CREATE_AGENT", "isCompleted": False},
    {"step": "KNOWLEDGE_BASE_ADD", "isCompleted": True},
    {"step": "FIRST_AGENT_INTERACTION", "isCompleted": True},
    {"step": "INTEGRATE_FIRST_APP", "isCompleted": False},
]

@router.get("/")
async def onboarding(current_user: str = Depends(get_current_user)):
    return onboarding_steps

@router.post("/form")
async def onboarding_form(request: Request):
    pass