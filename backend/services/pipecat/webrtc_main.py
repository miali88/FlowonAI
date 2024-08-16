# """
# bot_runner.py

# HTTP service that listens for incoming calls from either Daily or Twilio,
# provisioning a room and starting a Pipecat bot in response.

# Refer to README for more information.
# """
# import aiohttp
# import os
# import argparse
# import subprocess
# import logging

# from contextlib import asynccontextmanager

# from fastapi import FastAPI, Request, HTTPException, Form
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.responses import JSONResponse, PlainTextResponse
# from twilio.twiml.voice_response import VoiceResponse

# from pipecat.transports.services.helpers.daily_rest import (
#     DailyRESTHelper,
#     DailyRoomObject,
#     DailyRoomProperties,
#     DailyRoomParams,
#     DailyRoomSipParams)

# from dotenv import load_dotenv
# load_dotenv(override=True)

# # Add this near the top of the file, after imports
# logger = logging.getLogger(__name__)

# # Suppress debug logs from multipart and urllib3
# logging.getLogger('multipart').setLevel(logging.WARNING)
# logging.getLogger('urllib3').setLevel(logging.WARNING)

# # ------------ Configuration ------------ #

# MAX_SESSION_TIME = 5 * 60  # 5 minutes
# REQUIRED_ENV_VARS = ['OPENAI_API_KEY', 'DAILY_API_KEY',
#                      'ELEVENLABS_API_KEY', 'ELEVENLABS_VOICE_ID']

# # for env_var in REQUIRED_ENV_VARS:
# #     print(f"env_var: {env_var}")
# #     print(f"os.getenv(env_var): {os.getenv(env_var)}")
# #     #if env_var not in os.environ:
# #         #raise Exception(f"Missing environment variable: {env_var}.")
    

# daily_helpers = {}

# # ----------------- API ----------------- #


# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     aiohttp_session = aiohttp.ClientSession()
#     daily_api_key = os.getenv("DAILY_API_KEY", "")
#     if not daily_api_key:
#         logger.error("DAILY_API_KEY is not set in environment variables")
#         raise ValueError("DAILY_API_KEY is not set")
    
#     daily_helpers["rest"] = DailyRESTHelper(
#         daily_api_key=daily_api_key,
#         daily_api_url=os.getenv("DAILY_API_URL", 'https://api.daily.co/v1'),
#     )
#     yield
#     await aiohttp_session.close()

# app = FastAPI(lifespan=lifespan)

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"]
# )

# """ç
# Create Daily room, tell the bot if the room is created for Twilio's SIP or Daily's SIP (vendor).
# When the vendor is Daily, the bot handles the call forwarding automatically,
# i.e, forwards the call from the "hold music state" to the Daily Room's SIP URI.

# Alternatively, when the vendor is Twilio (not Daily), the bot is responsible for
# updating the state on Twilio. So when `dialin-ready` fires, it takes appropriate
# action using the Twilio Client library.
# """


# async def _create_daily_room(room_url, callId, callDomain=None, vendor="daily"):
#     print('\n\n\nrunning create_daily_room()')
#     logger.debug(f"Entering _create_daily_room: room_url={room_url}, callId={callId}, callDomain={callDomain}, vendor={vendor}")
#     # if not room_url:
#     params = DailyRoomParams(
#         properties=DailyRoomProperties(
#             sip=DailyRoomSipParams(
#                 display_name="SIP Participant",
#                 sip_mode="dial-in",
#                 video=False,
#                 num_endpoints=1
#             )
#         )
#     )

#     print(f"Creating new room...")
#     room: DailyRoomObject = daily_helpers["rest"].create_room(params=params)

#     # else:
#     #     # Check passed room URL exist (we assume that it already has a sip set up!)
#     #     try:
#     #         print(f"Joining existing room: {room_url}")
#     #         room: DailyRoomObject = daily_helpers["rest"].get_room_from_url(room_url)
#     #         print(f"\n\n\nRoom: {room}")
#     #     except Exception:
#     #         raise HTTPException(
#     #             status_code=500, detail=f"Room not found: {room_url}")

#     print(f"Daily room: {room.url} SIP URI: {room.config.sip_uri}")

#     if vendor != "daily" and not room.config.sip_endpoint:
#         raise HTTPException(status_code=500, detail="SIP endpoint is missing for Twilio call")

#     # Give the agent a token to join the session
#     token = daily_helpers["rest"].get_token(room.url, MAX_SESSION_TIME)

#     if not room or not token:
#         raise HTTPException(
#             status_code=500, detail=f"Failed to get room or token token")

#     # Spawn a new agent, and join the user session
#     # Note: this is mostly for demonstration purposes (refer to 'deployment' in docs)
#     if vendor == "daily":
#         bot_proc = f"python3 bot_daily.py -u '{room.url}' -t '{token}' -i '{callId}' -d '{callDomain or ''}'"
#     else:
#         print("RUNNING CMD..")
#         print(f"\n\npython3 bot_twilio.py -u {room.url} -t {token} -i {callId} -s {room.config.sip_endpoint}\n\n")
#         if not room.config.sip_endpoint:
#             logger.error(f"SIP endpoint is missing for room: {room.url}")
#             raise HTTPException(status_code=500, detail=f"SIP endpoint is missing for room: {room.url}")
#         sip_endpoint = room.config.sip_endpoint
#         bot_proc = f"python3 bot_twilio.py -u '{room.url}' -t '{token}' -i '{callId}' -s '{sip_endpoint}'"


#     print(f"Executing command: {bot_proc}")  # Add this line for debugging


#     try:
#         subprocess.Popen(
#             bot_proc,
#             shell=True,
#             bufsize=1,
#             cwd=os.path.dirname(os.path.abspath(__file__))
#         )
#     except Exception as e:
#         raise HTTPException(
#             status_code=500, detail=f"Failed to start subprocess: {e}")

#     return room


# @app.post("/twilio_start_bot", response_class=PlainTextResponse)
# async def twilio_start_bot(request: Request):
#     logger.debug("Entering twilio_start_bot")
#     print(f"POST /twilio_voice_bot")

#     data = {}
#     try:
#         form_data = await request.form()
#         data = dict(form_data)
#         logger.debug(f"Received form data: {data}")
#     except Exception as e:
#         logger.error(f"Error parsing form data: {str(e)}")

#     room_url = os.getenv("DAILY_SAMPLE_ROOM_URL", None)
#     callId = data.get('CallSid')

#     if not callId:
#         logger.error("Missing 'CallSid' in request")
#         raise HTTPException(status_code=500, detail="Missing 'CallSid' in request")

#     print("CallId: %s" % callId)

#     try:
#         room: DailyRoomObject = await _create_daily_room(room_url, callId, None, "twilio")
#         logger.debug(f"Room created/joined: {room.url}, SIP endpoint: {room.config.sip_endpoint}")
#     except Exception as e:
#         logger.error(f"Error in _create_daily_room: {str(e)}")
#         raise HTTPException(status_code=500, detail=str(e))

#     print(f"Put Twilio on hold...")
#     # We have the room and the SIP URI,
#     # but we do not know if the Daily SIP Worker and the Bot have joined the call
#     # put the call on hold until the 'on_dialin_ready' fires.
#     # Then, the bot will update the called sid with the sip uri.
#     # http://com.twilio.music.classical.s3.amazonaws.com/BusyStrings.mp3
#     resp = VoiceResponse()
#     resp.play(
#         url="http://com.twilio.sounds.music.s3.amazonaws.com/MARKOVICHAMP-Borghestral.mp3", loop=10)
#     return str(resp)


# @app.post("/daily_start_bot")
# async def daily_start_bot(request: Request) -> JSONResponse:
#     logger.debug("Entering daily_start_bot")
#     # The /daily_start_bot is invoked when a call is received on Daily's SIP URI
#     # daily_start_bot will create the room, put the call on hold until
#     # the bot and sip worker are ready. Daily will automatically
#     # forward the call to the SIP URi when dialin_ready fires.

#     # Use specified room URL, or create a new one if not specified
#     room_url = os.getenv("DAILY_SAMPLE_ROOM_URL", None)
#     print(f"room_url: {room_url}")
#     # Get the dial-in properties from the request
#     try:
#         data = await request.json()
#         print(f"data: {data}")
#         if "test" in data:
#             # Pass through any webhook checks
#             return JSONResponse({"test": True})
#         callId = data.get("callId", None)
#         callDomain = data.get("callDomain", None)
#     except Exception:
#         raise HTTPException(
#             status_code=500,
#             detail="Missing properties 'callId' or 'callDomain'")

#     print(f"CallId: {callId}, CallDomain: {callDomain}")
#     room: DailyRoomObject = await _create_daily_room(room_url, callId, callDomain, "daily")

#     # Grab a token for the user to join with
#     return JSONResponse({
#         "room_url": room.url,
#         "sipUri": room.config.sip_uri
#     })

# # ----------------- Main ----------------- #


# if __name__ == "__main__":
#     logger.debug("Starting bot_runner main")
#     # Check environment variables
#     # for env_var in REQUIRED_ENV_VARS:
#     #     if env_var not in os.environ:
#     #         raise Exception(f"Missing environment variable: {env_var}.")

#     parser = argparse.ArgumentParser(description="Pipecat Bot Runner")
#     parser.add_argument("--host", type=str,
#                         default=os.getenv("HOST", "0.0.0.0"), help="Host address")
#     parser.add_argument("--port", type=int,
#                         default=os.getenv("PORT", 7860), help="Port number")
#     parser.add_argument("--reload", action="store_true",
#                         default=True, help="Reload code on change")

#     config = parser.parse_args()

#     try:
#         import uvicorn

#         uvicorn.run(
#             "bot_runner:app",
#             host=config.host,
#             port=config.port,
#             reload=config.reload
#         )

#     except KeyboardInterrupt:
#         print("Pipecat runner shutting down...")