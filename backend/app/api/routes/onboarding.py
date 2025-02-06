from fastapi import APIRouter, HTTPException, Request, Depends
import logging

from app.api.deps import get_current_user
from services.db.supabase_services import get_supabase

router = APIRouter()

logger = logging.getLogger(__name__)

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
    logger.info(f"Getting onboarding status for user {current_user}")
    # Initialize supabase directly
    supabase = await get_supabase()
    
    onboarding_checklist = await supabase.table("onboarding_steps").select("*").eq("user_id", current_user).execute()
    onboarding_checklist = onboarding_checklist.data[0]
    onboarding_checklist.pop("user_id")
    
    logger.debug(f"Onboarding checklist for user {current_user}: {onboarding_checklist}")
    return onboarding_checklist


@router.post("/")
async def onboarding_form(request: Request):
    data = await request.json()
    logger.info("Processing onboarding form update")
    logger.debug(f"Received data: {data}")
    
    # Initialize supabase directly
    supabase = await get_supabase()
    
    # Get current onboarding status
    if data.get("table") == "agents":
        user_id = data.get("record").get("userId")
    else:
        user_id = data.get("record").get("user_id")
    
    logger.debug(f"Processing for user_id: {user_id}")
    
    onboarding_completed = await supabase.table("users").select("onboarding_completed").eq("id", user_id).execute()
    onboarding_completed = onboarding_completed.data[0]["onboarding_completed"]

    if not onboarding_completed:
        logger.debug("User onboarding not completed, processing step update")
        # Get user's onboarding checklist
        onboarding_checklist = await supabase.table("onboarding_steps").select("*").eq("user_id", user_id).execute()
        onboarding_checklist = onboarding_checklist.data[0]

        # Find corresponding step for the table
        table_name = data.get('table')
        if table_name in onboarding_table_to_steps:
            step_name = onboarding_table_to_steps[table_name]
            step_column = step_name.lower()
            
            logger.debug(f"Processing step: {step_name} for table: {table_name}")
            
            # Only update if step is not already completed
            if not onboarding_checklist[step_column]:
                # Update the step in database
                updates = {step_column: True}
                  
                # Update onboarding steps
                await supabase.table("onboarding_steps").update(
                    updates
                ).eq("user_id", user_id).execute()
                
                logger.info(f"Successfully updated onboarding step {step_name} for user {user_id}")
                return {"success": True, "message": f"Updated {step_name} status"}
            
            logger.debug(f"Step {step_name} already completed for user {user_id}")
        else:
            logger.warning(f"No matching onboarding step found for table: {table_name}")
            return {"success": False, "message": "No matching onboarding step for this table"}

    logger.debug(f"No update required for user {user_id}")
    return {"success": False, "message": "No update required"}

@router.post("/form")
async def onboarding_form(request: Request):
    logger.info("Received form submission")
    data = await request.json()
    logger.debug(f"Form data: {data}")
    pass
