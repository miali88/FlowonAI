from fastapi import Request, APIRouter, Header, HTTPException, Query
from fastapi.responses import JSONResponse
from composio import Composio
from composio import ComposioToolSet, App

from urllib.parse import urlparse, parse_qs

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


@router.get("/connections/{user_id}/{app_name}")
async def composio_handler(user_id: str, app_name: str):
    """
    Initiates a connection to the specified app for the given user.
    Returns the client_id and connected_account_id for the connection.
    """
    print(f"\n\ncomposio endpoint for user {user_id} and app {app_name}\n\n")

    toolset = ComposioToolSet(entity_id=user_id)
    entity = toolset.get_entity()
    request = entity.initiate_connection(app_name)

    parsed_url = urlparse(request.redirectUrl)
    query_params = parse_qs(parsed_url.query)
    client_id = query_params.get('client_id', [None])[0]
    connected_account_id = request.connectedAccountId

    return JSONResponse(content={"client_id": client_id, "connected_account_id": connected_account_id}, status_code=200)
