from fastapi import APIRouter, Request

router = APIRouter()

router.post("/")
async def vapi_status_update(request: Request):
    request = await request.json()
    print("\n\n vapi /wh", request)
    return 
