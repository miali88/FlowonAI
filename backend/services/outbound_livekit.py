from dotenv import load_dotenv
import os
import asyncio
from livekit import api 
from livekit.protocol.sip import (
    CreateSIPParticipantRequest, 
    SIPParticipantInfo,
    ListSIPOutboundTrunkRequest
)
from livekit.agents import JobContext
from services.voice.livekit_services import create_voice_assistant
import logging

load_dotenv()

logger = logging.getLogger(__name__)

async def check_participants_with_retry(
        job_ctx: JobContext,
        livekit_api, 
        room_name, 
        agent_id, 
        participant_identity, 
        max_retries=3
    ):
    for attempt in range(max_retries):
        try:
            participants = await livekit_api.room.list_participants(
                api.ListParticipantsRequest(room=room_name)
            )
            print("\nParticipants in room:")
            for p in participants.participants:
                print(f"- {p.identity} (State: {p.state})")
                if p.identity == participant_identity and p.state == 2:
                    print("\nSIP participant connected, starting agent...")
                    try:
                        print(f"Creating voice assistant with agent_id: {agent_id}")
                        assistant, opening_line = await create_voice_assistant(agent_id, job_ctx)
                        print(f"Voice assistant created successfully: {assistant}")
                        
                        print(f"Starting assistant in room: {room_name}")
                        await assistant.start(room_name)
                        print(f"Assistant successfully started in room")
                        print(f"Opening line prepared: {opening_line}")
                        return participants
                    except Exception as agent_error:
                        print(f"Failed to create or start voice assistant: {str(agent_error)}")
                        raise
            return participants
        except Exception as e:
            print(f"Error in check_participants_with_retry: {str(e)}")
            if attempt < max_retries - 1:
                print(f"Attempt {attempt + 1} failed, retrying in 5 seconds...")
                await asyncio.sleep(5)
            else:
                print(f"Final attempt failed: {str(e)}")
                raise


async def initiate_outbound_call(
    job_ctx: JobContext,
    room_name: str,
    participant_identity: str,
    participant_name: str,
    sip_call_to: str,
    agent_id: str,
    monitoring_duration: int = 120
) -> None:
    """
    Initiates an outbound call through LiveKit SIP integration.

    """
    if not sip_call_to or not sip_call_to.strip():
        logger.error("Missing or invalid sip_call_to number")
        raise ValueError("Valid sip_call_to (transfer number) is required")
        
    if not agent_id or not agent_id.strip():
        logger.error("Missing or invalid agent_id")
        raise ValueError("Valid agent_id is required")
        
    logger.info(f"Initiating outbound call to: {sip_call_to} for agent: {agent_id}")
    livekit_api = api.LiveKitAPI(
        url=os.getenv("LIVEKIT_URL"),
        api_key=os.getenv("LIVEKIT_API_KEY"),
        api_secret=os.getenv("LIVEKIT_API_SECRET")
    )

    try:
        # Verify SIP trunk exists first
        list_request = ListSIPOutboundTrunkRequest()
        trunks_response = await livekit_api.sip.list_sip_outbound_trunk(list_request)
        trunk_found = False
        for trunk in trunks_response.items:
            if trunk.sip_trunk_id == "ST_q8fzfH63TurF":  # Consider making this configurable too
                trunk_found = True
                break
        
        if not trunk_found:
            raise ValueError("Specified trunk ID not found!")

        # Create room with longer timeout
        room_request = api.CreateRoomRequest(
            name=room_name,
            empty_timeout=30 * 60,  # 30 minutes
            max_participants=2
        )

        room = await livekit_api.room.create_room(room_request)
        print(f"\nRoom created successfully: {room.name}")
        
        # Add delay to allow room creation to propagate
        await asyncio.sleep(1)
        
        # Create SIP participant
        request = CreateSIPParticipantRequest(
            sip_trunk_id="ST_q8fzfH63TurF",  # Consider making this configurable
            sip_call_to=sip_call_to,
            room_name=room_name,
            participant_identity=participant_identity,
            participant_name=participant_name,
        )
        
        participant = await livekit_api.sip.create_sip_participant(request)
        print(f"\nSuccessfully created SIP participant: {participant}")

        # Monitor participants
        check_interval = 5  # seconds
        iterations = monitoring_duration // check_interval
        for _ in range(iterations):
            await check_participants_with_retry(
                job_ctx,
                livekit_api, 
                room.name, 
                agent_id, 
                participant_identity
            )
            await asyncio.sleep(check_interval)

    finally:
        await livekit_api.aclose()