from fastapi import Request, HTTPException, APIRouter, Depends
from fastapi.responses import JSONResponse
from supabase import create_client, Client
from typing import Annotated
import os

router = APIRouter()

# Initialize Supabase client
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

async def get_user_id(request: Request) -> str:
    user_id = request.headers.get("X-User-ID")
    if not user_id:
        raise HTTPException(status_code=400, detail="X-User-ID header is missing")
    return user_id

@router.post("/chat_message")
async def post_chat_message(request: Request):
    try:
        # response = supabase.table("chat_logs").select("*").eq("user_id", user_id).execute()
        # if response.data:
        #     return JSONResponse(content=response.data)
        # else:
        #     return JSONResponse(content=[], status_code=200)
        print("\n\n endpoint: post_chat_message")
        print(await request.json())

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/history")
async def get_conversation_history(user_id: Annotated[str, Depends(get_user_id)]):
    try:
        response = supabase.table("conversation_logs").select("*").eq("user_id", user_id).execute()
        if response.data:
            return JSONResponse(content=response.data)
        else:
            return JSONResponse(content=[], status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.delete("/{conversation_id}")
async def delete_conversation_history(conversation_id: str, user_id: Annotated[str, Depends(get_user_id)]):
    try:
        supabase.table("conversation_logs").delete().eq("id", conversation_id).eq("user_id", user_id).execute()
        return JSONResponse(content={}, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")