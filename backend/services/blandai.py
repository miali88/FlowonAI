import requests
import json

from fastapi import FastAPI, Request, HTTPException, APIRouter
from fastapi.responses import Response, JSONResponse

from app.core.config import settings

async def handle_blandai_webhook(request: Request):
    pass

# url = 'https://api.bland.ai/v1/calls'
# authorization = '<authorization>' # Replace with your actual authorization token
# data = {
#     'phone_number': '+12223334455',
#     'task': 'A prompt up to 24k characters that instructs your phone agent what to do',
#     'tools': ['A set of external APIs your phone agent can interact with during calls'],
#     'transfer_phone_number': '+16667778899',
#     'voice_id': 123
# }

# headers = {
#     'Content-Type': 'application/json',
#     'Authorization': authorization
# }

# response = requests.post(url, headers=headers, data=json.dumps(data))

# print(response.text)