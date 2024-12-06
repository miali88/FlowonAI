import asyncio
from dotenv import load_dotenv
import os

load_dotenv()

from livekit import api 
from livekit.protocol.sip import (
    CreateSIPParticipantRequest, 
    SIPParticipantInfo,
    ListSIPOutboundTrunkRequest
)
from livekit.agents import JobContext
from services.voice.tool_use import AgentFunctions
from services.voice.livekit_services import create_voice_assistant

async def check_participants_with_retry(livekit_api, room_name, agent_id, max_retries=3):
    for attempt in range(max_retries):
        try:
            participants = await livekit_api.room.list_participants(
                api.ListParticipantsRequest(room=room_name)
            )
            print("\nParticipants in room:")
            for p in participants.participants:
                print(f"- {p.identity} (State: {p.state})")
                if p.identity == "sip-test" and p.state == 2:
                    print("\nSIP participant connected, starting agent...")
                    try:
                        job_ctx = JobContext()
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

async def main():
    try:
        livekit_api = api.LiveKitAPI(
            url=os.getenv("LIVEKIT_URL"),
            api_key=os.getenv("LIVEKIT_API_KEY"),
            api_secret=os.getenv("LIVEKIT_API_SECRET")
        )

        # Verify SIP trunk exists first
        try:
            list_request = ListSIPOutboundTrunkRequest()
            trunks_response = await livekit_api.sip.list_sip_outbound_trunk(list_request)
            trunk_found = False
            for trunk in trunks_response.items:
                print(f"\nFound trunk: {trunk.sip_trunk_id}")
                print(f"Trunk name: {trunk.name}")
                print(f"Trunk address: {trunk.address}")
                print(f"Trunk numbers: {trunk.numbers}")
                if trunk.sip_trunk_id == "ST_q8fzfH63TurF":
                    trunk_found = True
                    break
            
            if not trunk_found:
                print("\nERROR: Specified trunk ID not found!")
                return
            
        except Exception as e:
            print(f"\nError listing SIP trunks: {str(e)}")
            raise

        # Create room with longer timeout
        room_request = api.CreateRoomRequest(
            name="test-room",
            empty_timeout=30 * 60,  # 30 minutes
            max_participants=2
        )

        try:
            room = await livekit_api.room.create_room(room_request)
            print(f"\nRoom created successfully: {room.name}")
            print(f"Room SID: {room.sid}")
            
            # Add delay to allow room creation to propagate
            await asyncio.sleep(5)
            
            # Create SIP participant
            request = CreateSIPParticipantRequest(
                sip_trunk_id="ST_q8fzfH63TurF",
                sip_call_to="+447745187688",
                room_name="test-room",
                participant_identity="sip-test",
                participant_name="Test Caller",
            )
            
            print("\nAttempting to create SIP participant with:")
            print(f"SIP Trunk ID: {request.sip_trunk_id}")
            print(f"Call To: {request.sip_call_to}")
            print(f"Room Name: {request.room_name}")
            
            participant = await livekit_api.sip.create_sip_participant(request)
            print(f"\nSuccessfully created SIP participant: {participant}")
            
            # Add agent_id parameter
            agent_id = "a14205e6-4b73-43d0-90f8-ea0a38da0112"  # Replace with your actual agent ID

            # Monitor participants for 2 minutes
            print("\nMonitoring room participants for 2 minutes...")
            for _ in range(24):  # Check every 5 seconds for 2 minutes
                await check_participants_with_retry(livekit_api, room.name, agent_id)
                await asyncio.sleep(5)
                
        except api.TwirpError as e:
            print(f"\nTwirp Error: code={e.code}, message={e.message}")
            if e.code == "not_found":
                print("\nPossible reasons for not_found error:")
                print("1. SIP trunk ID doesn't exist or is incorrect")
                print("2. Room name doesn't match exactly")
                print("3. SIP service configuration issue")
            raise
        except Exception as e:
            print(f"\nError: {str(e)}")
            raise

    finally:
        await livekit_api.aclose()

if __name__ == "__main__":
    asyncio.run(main())