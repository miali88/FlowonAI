from fastapi import APIRouter, HTTPException, Request, Depends

from app.api.deps import get_current_user
from services.supabase.client import get_supabase

router = APIRouter()

onboarding_steps = [
    {"step": "CREATE_AGENT", "isCompleted": False},
    {"step": "KNOWLEDGE_BASE_ADD", "isCompleted": True},
    {"step": "FIRST_AGENT_INTERACTION", "isCompleted": True},
    {"step": "INTEGRATE_FIRST_APP", "isCompleted": False},
]

onboarding_table_to_steps = {
    "agents": "CREATE_AGENT",
    "user_web_data": "KNOWLEDGE_BASE_ADD",
    "user_text_files": "KNOWLEDGE_BASE_ADD",
    "conversation_logs": "FIRST_AGENT_INTERACTION",
    "user_integrations": "INTEGRATE_FIRST_APP",
}

@router.get("/")
async def onboarding(current_user: str = Depends(get_current_user)):
    # Initialize supabase directly
    supabase = await get_supabase()
    
    onboarding_checklist = await supabase.table("onboarding_steps").select("*").eq("user_id", current_user.id).execute()
    onboarding_checklist = onboarding_checklist.data[0]
    onboarding_checklist.pop("user_id")
    
    return onboarding_checklist


@router.post("/")
async def onboarding_form(request: Request):
    print("POST onboarding/")
    data = await request.json()
    print(f"Fields: {list(data.keys())}")
    print(f"Data: {data}")
    # Initialize supabase directly
    supabase = await get_supabase()
    
    # Get current onboarding status
    if data.get("table") == "agents":
        user_id = data.get("record")
        user_id = user_id.get("userId")
    else:
        user_id = data.get("record")
        user_id = user_id.get("user_id")
    
    onboarding_completed = await supabase.table("users").select("onboarding_completed").eq("id", user_id).execute()
    onboarding_completed = onboarding_completed.data[0]["onboarding_completed"]

    if not onboarding_completed:
        # Get user's onboarding checklist
        onboarding_checklist = await supabase.table("onboarding_steps").select("*").eq("user_id", user_id).execute()
        onboarding_checklist = onboarding_checklist.data[0]

        # Find corresponding step for the table
        table_name = data.get('table')
        if table_name in onboarding_table_to_steps:
            step_name = onboarding_table_to_steps[table_name]
            step_column = step_name.lower()  # Convert to lowercase to match DB columns
            
            # Only update if step is not already completed
            if not onboarding_checklist[step_column]:
                # Update the step in database
                updates = {step_column: True}
                  
                # Update onboarding steps
                await supabase.table("onboarding_steps").update(
                    updates
                ).eq("user_id", user_id).execute()
                
                return {"success": True, "message": f"Updated {step_name} status"}
        else:
            return {"success": False, "message": "No matching onboarding step for this table"}

    return {"success": False, "message": "No update required"}

@router.post("/form")
async def onboarding_form(request: Request):
    print("POST onboarding/form")
    data = await request.json()
    print(data)
    pass
