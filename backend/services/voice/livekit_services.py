import os
import uuid
import asyncio
import logging
import re
from asyncio import Lock
from dotenv import load_dotenv
from typing import Union, AsyncIterable, AsyncGenerator, Optional, Dict, Any, Tuple

from fastapi import HTTPException, BackgroundTasks
from livekit import api
from livekit.agents.voice_assistant import VoiceAssistant
from livekit.agents import llm, JobContext
from livekit.api import (
    LiveKitAPI,
    CreateRoomRequest,
    ListRoomsRequest,
    ListParticipantsRequest
)
from livekit.plugins import cartesia, deepgram, openai, silero, elevenlabs
from supabase import create_client, Client

from app.core.config import settings
from services.voice.tool_use import AgentFunctions

load_dotenv()

supabase: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_SERVICE_ROLE_KEY
)

room_locks = {}
logger = logging.getLogger(__name__)


async def create_livekit_api() -> LiveKitAPI:
    return LiveKitAPI(
        url=os.getenv("LIVEKIT_URL"),
        api_key=os.getenv("LIVEKIT_API_KEY"),
        api_secret=os.getenv("LIVEKIT_API_SECRET")
    )


""" ROOM FUNCTIONS """


async def token_gen(
    agent_id: str,
    user_id: str,
    background_tasks: BackgroundTasks,
    medium: str = "voice"
) -> Tuple[str, str, str]:
    logger.info(
        f"Token generation requested for agent_id={agent_id}, user_id={user_id}"
    )

    if not agent_id or not user_id:
        logger.error("Missing required parameters: agent_id or user_id")
        raise HTTPException(status_code=400, detail="Missing agent_id or user_id")

    room_suffix = "_textbot" if medium == "textbot" else ""
    room_name = f"agent_{agent_id}_room_{user_id}_{uuid.uuid4()}{room_suffix}"
    logger.debug(f"Generated room name: {room_name}")

    if room_name not in room_locks:
        room_locks[room_name] = Lock()

    async with room_locks[room_name]:
        api_key = os.getenv("LIVEKIT_API_KEY")
        api_secret = os.getenv("LIVEKIT_API_SECRET")
        livekit_server_url = os.getenv("LIVEKIT_URL")

        if not api_key or not api_secret or not livekit_server_url:
            raise HTTPException(
                status_code=500,
                detail="LiveKit credentials not configured"
            )

        token = (
            api.AccessToken(api_key, api_secret)
            .with_identity(f"visitorId_{uuid.uuid4()}")
            .with_name(user_id)
            .with_grants(api.VideoGrants(
                room_join=True,
                room=room_name
            ))
        )

        await asyncio.sleep(1)
        await check_and_create_room(room_name, token.to_jwt(), agent_id)

        return token.to_jwt(), livekit_server_url, room_name


async def check_and_create_room(room_name: str, token: str, agent_id: str) -> None:
    logger.info(f"Checking room existence: {room_name}")
    try:
        livekit_api = await create_livekit_api()
        room_exists = await check_room_exists(livekit_api, room_name)

        if room_exists:
            logger.info(f"Room {room_name} already exists")
            await print_room_details(livekit_api, room_name, agent_id)
        else:
            logger.info(
                f"Room {room_name} doesn't exist, creating it and starting the agent"
            )
            await create_room(room_name, token, agent_id)

    except Exception as e:
        logger.error(
            f"Error checking/creating room {room_name}: {str(e)}",
            exc_info=True
        )
        raise HTTPException(status_code=500, detail="Error checking room existence")
    finally:
        await livekit_api.aclose()


async def check_room_exists(livekit_api: LiveKitAPI, room_name: str) -> bool:
    list_request = ListRoomsRequest()
    rooms_response = await livekit_api.room.list_rooms(list_request)
    return any(room.name == room_name for room in rooms_response.rooms)


async def print_room_details(livekit_api: LiveKitAPI, room_name: str, agent_id: str) -> None:
    list_request = ListRoomsRequest()
    rooms_response = await livekit_api.room.list_rooms(list_request)
    logger.info("Room exists. All rooms:")
    for room in rooms_response.rooms:
        logger.info(f"Room name: {room.name}, SID: {room.sid}")

    try:
        list_participants_request = ListParticipantsRequest(room=room_name)
        participants_response = await livekit_api.room.list_participants(
            list_participants_request
        )
        logger.info(f"\nParticipants in room '{room_name}':")
        for participant in participants_response.participants:
            logger.info(
                f"Participant: {participant.identity}, SID: {participant.sid}"
            )
    except api.twirp_client.TwirpError as e:
        if e.code == 'not_found' and 'room does not exist' in e.message:
            logger.warning(f"Room {room_name} not found when listing participants")
            await create_room(room_name, None, agent_id)
        else:
            logger.error(f"Unexpected TwirpError: {e}")
            raise
    except Exception as e:
        logger.error(f"Error listing participants: {e}")
        raise


async def create_room(room_name: str, access_token: str, agent_id: str) -> None:
    try:
        logger.info(f"Starting create_agent_request for room: {room_name}")
        livekit_api = await create_livekit_api()

        create_request = CreateRoomRequest(
            name=room_name,
            empty_timeout=120,
            max_participants=2
        )
        room = await livekit_api.room.create_room(create_request)
        logger.info(f"Created room: {room.name} with SID: {room.sid}")

        logger.info("Room created, starting agent")
        await start_agent_request(access_token, agent_id, room_name)

    finally:
        await livekit_api.aclose()
        logger.info("livekit_api closed in create_room")


""" AGENT FUNCTIONS """


async def start_agent_request(access_token: str, agent_id: str, room_name: str) -> None:
    logger.info(f"Starting agent request for room: {room_name}")
    livekit_api = await create_livekit_api()
    try:
        room = await livekit_api.room.create_room(
            CreateRoomRequest(name=room_name)
        )
        logger.info(f"Room verified: {room.name} with SID: {room.sid}")

        logger.info("Initializing agent session")
        await maintain_agent_session(room_name, agent_id)

    except Exception as e:
        logger.error(f"Error in start_agent_request: {str(e)}", exc_info=True)
        raise
    finally:
        await livekit_api.aclose()
        logger.info("LiveKit API connection closed")


async def maintain_agent_session(room_name: str, agent_id: str) -> None:
    logger.info(f"Maintaining agent session for room: {room_name}")
    try:
        # Add session management logic here
        pass
    except Exception as e:
        logger.error(f"Session maintenance error: {str(e)}", exc_info=True)


lang_options = {
    "en-US": {
        "deepgram": "en-US",
        "cartesia": "en",
        "cartesia_model": "sonic-english"
    },
    "en-GB": {
        "deepgram": "en-GB",
        "cartesia": "en",
        "cartesia_model": "sonic-english"
    },
    "fr": {
        "deepgram": "fr",
        "cartesia": "fr",
        "cartesia_model": "sonic-multilingual"
    },
}


async def create_voice_assistant(
    agent_id: str,
    job_ctx: Optional[JobContext] = None,
    call_type: str = "web"
) -> Tuple[VoiceAssistant, str]:
    logger.info(f"Creating voice assistant for agent_id: {agent_id}")
    try:
        agent = await get_agent(agent_id)
        if not agent:
            logger.error(f"Agent not found: {agent_id}")
            raise ValueError(f"Agent {agent_id} not found")

        logger.debug(f"Full agent configuration: {agent}")

        required_fields = [
            'language',
            'voice',
            'instructions',
            'openingLine',
            'voiceProvider'
        ]
        missing_fields = [field for field in required_fields if not agent.get(field)]

        if missing_fields:
            error_msg = (
                f"Agent configuration missing required fields: "
                f"{', '.join(missing_fields)}"
            )
            logger.error(error_msg)
            logger.error(f"Current agent configuration: {agent}")
            raise ValueError(error_msg)

        logger.info("Creating voice assistant with configuration")
        fnc_ctx = None
        if not job_ctx:
            raise ValueError("Job context is required")
        if call_type != "textbot":
            fnc_ctx = AgentFunctions(job_ctx)
            await fnc_ctx.initialize_functions()

        llm_instance = openai.LLM(
            model="gpt-4o",
            temperature=0.4
        )

        logger.info(f"Voice ID: {agent['voice']}")
        if agent.get('voiceProvider') == 'elevenlabs':
            tts_instance = elevenlabs.TTS(
                voice=elevenlabs.Voice(
                    id=agent['voice'],
                    name="",
                    category=""
                )
            )
        else:
            tts_instance = cartesia.TTS(
                language=lang_options[agent['language']]['cartesia'],
                model=lang_options[agent['language']]['cartesia_model'], # type: ignore
                voice=agent['voice']
            )

        instructions = (
            agent['multi_state']
            if agent['instructions'] == "multi_state"
            else agent['instructions']
        )

        assistant = VoiceAssistant(
            vad=silero.VAD.load(),
            stt=deepgram.STT(
                model="nova-2-general",
                language=lang_options[agent['language']]['deepgram'] # type: ignore
            ),
            llm=llm_instance,
            tts=tts_instance,
            chat_ctx=llm.ChatContext().append(
                role="system",
                text=instructions
            ),
            fnc_ctx=fnc_ctx,
            allow_interruptions=True,
            interrupt_speech_duration=0.5,
            interrupt_min_words=2,
            min_endpointing_delay=0.7,
            before_tts_cb=remove_special_characters
        )

        logger.info("Voice assistant created successfully")
        return assistant, agent['openingLine']

    except Exception as e:
        logger.error(f"Error creating voice assistant: {str(e)}", exc_info=True)
        raise


def remove_special_characters(
    agent: VoiceAssistant,
    text: Union[str, AsyncIterable[str]]
) -> Union[str, AsyncIterable[str]]:
    url_pattern = re.compile(r'https?://\S+|www\.\S+')

    def clean_text(input_text: str) -> str:
        text_without_urls = url_pattern.sub('', input_text)
        return re.sub(
            r'[^A-Za-z0-9\s.,!?\'"-$€£¥:;]',
            '',
            text_without_urls
        )

    if isinstance(text, str):
        return clean_text(text)
    elif isinstance(text, AsyncIterable):
        async def clean_async_iterable() -> AsyncGenerator[str, None]:
            async for part in text:
                yield clean_text(part)
        return clean_async_iterable()
    else:
        raise ValueError("Unsupported text type")


async def get_agent(agent_id: str) -> Optional[Dict[str, Any]]:
    response = (
        supabase.table('agents')
        .select('*')
        .eq('id', agent_id)
        .execute()
    )

    return response.data[0] if response.data else None
