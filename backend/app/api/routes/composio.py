from fastapi import Request, APIRouter, Header, HTTPException, Query
from fastapi.responses import JSONResponse
from composio import Composio

import logging

logger = logging.getLogger(__name__)

router = APIRouter()

composio_client = Composio()

@router.get("/connections/{user_id}")
async def composio_handler(user_id: str):
    print(f"\n\ncomposio endpoint for user {user_id}\n\n")
    existing_entity = composio_client.get_entity(id=user_id)
    existing_connections = existing_entity.get_connections()
    connections_list = [connection.appName for connection in existing_connections]
    return JSONResponse(content={"connections": connections_list}, status_code=200)
