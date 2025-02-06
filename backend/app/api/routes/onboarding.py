from fastapi import APIRouter, HTTPException, Request


router = APIRouter()

onboarding_steps = [
    {"step": "CREATE_AGENT", "isCompleted": False},
    {"step": "MAKE_CALL", "isCompleted": False},
]

@router.post("/")
async def onboarding(request: Request):
    pass

@router.post("/form")
async def onboarding_form(request: Request):
    pass