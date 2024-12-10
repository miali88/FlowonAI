from __future__ import annotations

import os, sys
from typing import Dict, List, Optional, Any
import asyncio
from dotenv import load_dotenv
import logging
import time
from datetime import datetime, timedelta

# Add both the project root and backend directory to Python path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
backend_dir = os.path.dirname(__file__)

for path in [project_root, backend_dir]:
    if path not in sys.path:
        sys.path.insert(0, path)

from livekit import agents, rtc, api
from livekit.agents import AutoSubscribe, JobContext, JobProcess, JobRequest, WorkerOptions, WorkerType, cli
from livekit.plugins import silero
from livekit.agents.voice_assistant import VoiceAssistant

from services.voice.livekit_services import create_voice_assistant
from services.voice.tool_use import trigger_show_chat_input, transfer_call
from services.nylas_service import send_email
from services.cache import get_all_agents, call_data, get_agent_metadata, initialize_calendar_cache
from services.voice.livekit_helper import detect_call_type_and_get_agent_id
from backend.mute_track import CallTransferHandler

# Add logging configuration
logging.getLogger('livekit').setLevel(logging.WARNING)
logging.getLogger('openai').setLevel(logging.WARNING)  # Add this line
logging.getLogger('hpack').setLevel(logging.WARNING)  # Add this line
logging.getLogger('httpx').setLevel(logging.WARNING)  # Add this
logging.getLogger('httpcore').setLevel(logging.WARNING)  # Add this

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

class CallDuration:
    def __init__(self, duration: timedelta):
        self.duration = duration
        self.total_seconds = int(duration.total_seconds())
        self.minutes = self.total_seconds // 60
        self.seconds = self.total_seconds % 60

    @classmethod
    def from_timestamps(cls, start: datetime, end: datetime):
        return cls(end - start)

    def __str__(self):
        return f"{self.minutes}m {self.seconds}s"

    def to_dict(self):
        return {
            "total_seconds": self.total_seconds,
            "minutes": self.minutes,
            "seconds": self.seconds,
            "formatted": str(self)
        }

async def entrypoint(ctx: JobContext):
    print("\n\n\n\n___+_+_+_+_+livekit_server entrypoint called")
    room_name = ctx.room.name
    room = ctx.room
    print("room_name:", room_name)

    print(f"Entrypoint called with job_id: {ctx.job.id}, connecting to room: {room_name}")
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY) 

    # Add call start time tracking
    call_start_time = datetime.now()
    
    # Add participant tracking dictionary and last_audio_time
    participant_prospects = {}
    last_audio_time = time.time()  # Track when we last received any audio
    last_participant_audio = time.time()  # Track participant's last audio
    last_agent_audio = time.time()  # Track agent's last audio
    SILENCE_TIMEOUT = 90  # Timeout in seconds

    try:

        """ call types: inbound tel, outbound tel, web """
        agent_id = await detect_call_type_and_get_agent_id(room_name)

        agent, opening_line = await create_voice_assistant(agent_id, ctx)
        agent.start(room)
        await agent.say(opening_line, allow_interruptions=False)

        agent_metadata: Dict = await get_agent_metadata(agent_id)
        user_id: str = agent_metadata['userId']

        await asyncio.sleep(3)

        #print("iterating through room.remote_participants to find first participant")
        first_participant = None
        # Sort participants by join time and get the first one
        sorted_participants = sorted(
            room.remote_participants.values(),
            key=lambda p: p.joined_at if hasattr(p, 'joined_at') else 0
        )
        if sorted_participants:
            first_participant = sorted_participants[0]

        if first_participant:
            # Add the participant to tracking dictionary with empty prospect status
            participant_prospects[first_participant.sid] = ""
            print(f"Added participant {first_participant.sid} to tracking with empty prospect status")
            print(f"Found available participant: {first_participant.identity}")            
        else:
            print("No available participants found.")
            ctx.shutdown(reason="No available participants")


        print("about to call handle_transfer, sleeping for 10 seconds")
        await asyncio.sleep(10)
        # print("calling transfer_call")
        # await transfer_call(transfer_reason="new enquiry", caller_name="Jake", business_name="Flowon AI")
        # print("transfer_call called")


        async def handle_transfer():
            async with CallTransferHandler(room) as transfer_handler:
                await transfer_handler.place_participant_on_hold(first_participant.identity)

                # print("creating second agent")
                # # Create a second agent
                # second_agent_id = "1bf662cf-4d01-4c82-b919-8534ad071380"  # Replace with actual agent ID
                # second_agent, second_opening_line = await create_voice_assistant(second_agent_id, ctx)
                # second_agent.start(room)
                # await second_agent.say("Hello, I'm the second agent. How can I help you today?", allow_interruptions=False)


                local_participant = room.local_participant.identity
                print("re-subscribing agent to its own tracks")
                print("local_participant:", local_participant)
                await transfer_handler.re_subscribe_agent(local_participant)


                await asyncio.sleep(10)

                print("re-subscribing participant to its own tracks")
                print("first_participant:", first_participant.identity)
                await transfer_handler.re_subscribe_participant(first_participant.identity)


                await transfer_handler.get_participant(local_participant)
                await transfer_handler.get_participant(first_participant.identity)


        asyncio.create_task(handle_transfer())
     






        @agent.on("function_calls_finished")
        def on_function_calls_finished(called_functions: list[agents.llm.CalledFunction]):
            """This event triggers when an assistant's function call completes."""
            print("\n\n\n on_function_calls_finished method called")
            print("called_functions:", called_functions)

            for called_function in called_functions:
                function_name = called_function.call_info.function_info.name
                print(f"Function called: {function_name}")

                if function_name == "request_personal_data":
                    print("Triggering show_chat_input")
                    # Update prospect status for the participant
                    participant_prospects[first_participant.sid] = "yes"
                    print(f"Updated {first_participant.sid} to prospect status")
                    # Create task for handling the chat input response
                    asyncio.create_task(handle_chat_input_response(agent, 
                                                                    ctx.room.name, 
                                                                    ctx.job.id, 
                                                                    first_participant.identity,
                                                                    participant_prospects[first_participant.sid])  # Pass the prospect_status
                                                                    )

                elif function_name == "search_products_and_services":
                    print("search_products_and_services called")
                    #print("\n\nagent.chat_ctx:", agent.chat_ctx)

                elif function_name == "transfer_call":
                    print("transfer_call called")
                    

                    async def handle_transfer():
                        async with CallTransferHandler(room) as transfer_handler:
                            await transfer_handler.place_participant_on_hold(first_participant.identity)

                            print("creating second agent")
                            # Create a second agent
                            second_agent_id = "1bf662cf-4d01-4c82-b919-8534ad071380"  # Replace with actual agent ID
                            second_agent, second_opening_line = await create_voice_assistant(second_agent_id, ctx)
                            second_agent.start(room)
                            await second_agent.say("Hello, I'm the second agent. How can I help you today?", allow_interruptions=False)


                            local_participant = room.local_participant.identity
                            print("re-subscribing agent to its own tracks")
                            print("local_participant:", local_participant)
                            await transfer_handler.re_subscribe_agent(local_participant.identity)


                            # Find the second participant
                            # second_participant = None
                            # for participant in room.remote_participants.values():
                            #     if participant.sid != first_participant.sid:
                            #         second_participant = participant
                            #         break
                            
                            # if second_participant:
                            #     print(f"Found second participant: {second_participant.identity}")
                            #     await asyncio.sleep(15)
                            #     local_participant = room.local_participant.identity
                            #     await transfer_handler.restore_participant_from_hold(
                            #         local_participant, 
                            #         second_participant_identity=second_participant.identity
                            #     )
                            # else:
                            #     print("No second participant found in the room")

                    # Create the task for the async operation
                    asyncio.create_task(handle_transfer())
                    """
                    TODO:
                    - check to see if first_participant is in the outbound room, if not, add them
                    - transfer_participant should be invoked by the 2nd agent based on result of outbound call. i.e if staff wants to speak or not. 
                        - for now, we'll just assume they do want, and transfer the initial caller to the staff. 
                    """


        # """ EVENT HANDLERS FOR AGENT """            
        # @ctx.room.on('participant_disconnected')
        def on_participant_disconnected(participant: rtc.RemoteParticipant):
            # Check if first_participant exists before comparing identities
            if first_participant and participant.identity == first_participant.identity:
                call_duration = CallDuration.from_timestamps(call_start_time, datetime.now())
                print(f"Call duration: {call_duration}")
                ctx.add_shutdown_callback(
                    lambda: store_conversation_history(agent, 
                                                   room_name, 
                                                   ctx.job.id, 
                                                   first_participant.identity, 
                                                   participant_prospects[first_participant.sid],
                                                   call_duration)
                )
                ctx.shutdown(reason=f"Subscribed participant disconnected after {call_duration}")
            else:
                print(f"Participant disconnected but was not the available participant: {participant.identity}")

            print("User stopped speaking")


        @ctx.room.on('disconnected')
        def on_disconnected(exception: Exception):
            print(f"Room {room_name} disconnected. Reason: {str(exception)}")

        @ctx.room.on('connected')
        def on_connected():
            print(f"Room {room_name} connected")
            """ doesn't work :(, doesn't callback on room connect"""




        async def handle_chat_input_response(agent, 
                                             room_name: str, 
                                             job_id: str, 
                                             participant_identity: str,
                                             prospect_status: str):
            try:
                print("triggering show_chat_input from livekit_server.py")
                chat_message = await trigger_show_chat_input(room_name, job_id, participant_identity)
                print("chat_message retrieved from trigger_show_chat_input:", chat_message)
                if chat_message:
                    user_message = f"user input data: \n\n{chat_message}\n"
                    print("Debug - Attempting to append message:", user_message)
                    try:
                        agent.chat_ctx.append(text=user_message, role="user")
                        print(f"Added user message from {participant_identity} to chat context: {user_message}")
                        #print("Debug - Updated chat_ctx:", agent.chat_ctx)
                    except Exception as append_error:
                        print(f"Error appending to chat_ctx: {str(append_error)}")
                        #print(f"Type of agent.chat_ctx: {type(agent.chat_ctx)}")
            except Exception as e:
                print(f"Error in handle_chat_input_response: {str(e)}")
  
        async def store_conversation_history(agent, 
                                             room_name: str, 
                                             job_id: str, 
                                             participant_identity: str, 
                                             prospect_status: str,
                                             call_duration: CallDuration):  # Update type hint
            print("store_conversation_history method called")

            # Parse chat context into simplified format
            conversation_history = []
            for message in agent.chat_ctx.messages:
                message_dict = {}
                if message.role == 'assistant':
                    message_dict['assistant_message'] = message.content
                elif message.role == 'user':
                    message_dict['user_message'] = message.content
                elif message.role == 'tool':
                    message_dict['tool'] = {
                        'name': message.name,
                        'content': message.content
                    }
                
                if message_dict:
                    conversation_history.append(message_dict)
            print("\n\nconversation_history:", conversation_history)
            try:
                import os
                import aiohttp
                
                API_BASE_URL = os.getenv('API_BASE_URL')
                url = f"{API_BASE_URL}/conversation/store_history"
                
                payload = {
                    "transcript": conversation_history,  # Using the parsed history
                    "job_id": job_id,
                    "participant_identity": participant_identity,
                    "room_name": room_name,
                    "user_id": user_id,
                    "agent_id": agent_id,
                    "prospect_status": prospect_status,
                    "call_duration": call_duration.to_dict(),  # Send structured duration data
                    "call_type": "tel" if room_name.startswith("call-") else "web"
                }
                
                async with aiohttp.ClientSession() as session:
                    async with session.post(url, json=payload) as response:
                        if response.status == 200:
                            print("Successfully stored conversation history")
                        else:
                            print(f"Failed to store conversation history. Status: {response.status}")
            
            except Exception as e:
                print(f"Error storing conversation history: {str(e)}")
            if prospect_status == "yes":
                print("prospect_status is yes, sending email")
                await send_email(participant_identity, conversation_history, agent_id)

        def format_duration(start_time):
            duration = datetime.now() - start_time
            total_seconds = duration.total_seconds()
            minutes = int(total_seconds // 60)
            seconds = int(total_seconds % 60)
            return f"{minutes}m {seconds}s"

        async def check_silence_timeout():
            while True:
                await asyncio.sleep(1)  # Check every second
                current_time = time.time()
                time_since_last_audio = current_time - last_audio_time
                time_since_participant = current_time - last_participant_audio
                time_since_agent = current_time - last_agent_audio

                # Log the silence durations for debugging
                if time_since_last_audio > SILENCE_TIMEOUT / 2:  # Only log if silence is getting significant
                    print(f"Time since last audio: {time_since_last_audio:.1f}s")
                    print(f"Time since participant audio: {time_since_participant:.1f}s")
                    print(f"Time since agent audio: {time_since_agent:.1f}s")

                if time_since_last_audio > SILENCE_TIMEOUT:
                    print(f"Call duration before timeout: {format_duration(call_start_time)}")
                    await store_conversation_history(agent, 
                                                  room_name, 
                                                  ctx.job.id, 
                                                  first_participant.identity, 
                                                  participant_prospects[first_participant.sid],
                                                  format_duration(call_start_time))  # Add duration
                    await ctx.shutdown(reason=f"Silence timeout reached after {format_duration(call_start_time)}")
                    break

        # Create and store the silence checker task
        silence_checker_task = asyncio.create_task(check_silence_timeout())

        # Track state management
        track_subscriptions = {}  # Keep track of subscribed tracks by participant
        participant_states = {}   # Track participant connection states

        @ctx.room.on("participant_connected")
        def on_participant_connected(participant: rtc.RemoteParticipant):
            logger.info(f"Participant connected: {participant.identity}")
            participant_states[participant.sid] = {
                "connected_at": datetime.now(),
                "connection_quality": None,
                "is_muted": False
            }

        @ctx.room.on("track_subscribed")
        def on_track_subscribed(track, publication, participant):
            logger.info(f"Track subscribed: {track.kind} from {participant.identity}")
            if participant.sid not in track_subscriptions:
                track_subscriptions[participant.sid] = []
            track_subscriptions[participant.sid].append({
                "track_sid": publication.sid,
                "kind": track.kind,
                "subscribed_at": datetime.now()
            })

        @ctx.room.on("track_unsubscribed")
        def on_track_unsubscribed(track, publication, participant):
            logger.info(f"Track unsubscribed: {track.kind} from {participant.identity}")
            if participant.sid in track_subscriptions:
                track_subscriptions[participant.sid] = [
                    t for t in track_subscriptions[participant.sid] 
                    if t["track_sid"] != publication.sid
                ]

        @ctx.room.on("connection_quality_changed")
        def on_connection_quality_changed(participant, quality):
            logger.info(f"Connection quality changed for {participant.identity}: {quality}")
            if participant.sid in participant_states:
                participant_states[participant.sid]["connection_quality"] = quality

        @ctx.room.on("track_muted")
        def on_track_muted(participant, publication):
            logger.info(f"Track muted by {participant.identity}")
            if participant.sid in participant_states:
                participant_states[participant.sid]["is_muted"] = True

        @ctx.room.on("track_unmuted")
        def on_track_unmuted(participant, publication):
            logger.info(f"Track unmuted by {participant.identity}")
            if participant.sid in participant_states:
                participant_states[participant.sid]["is_muted"] = False

        # Update existing on_participant_disconnected to include cleanup
        @ctx.room.on("participant_disconnected")
        def on_participant_disconnected(participant: rtc.RemoteParticipant):
            logger.info(f"Participant disconnected: {participant.identity}")
            # Clean up tracking dictionaries
            if participant.sid in track_subscriptions:
                del track_subscriptions[participant.sid]
            if participant.sid in participant_states:
                del participant_states[participant.sid]
            
            # Existing disconnect logic
            if first_participant and participant.identity == first_participant.identity:
                call_duration = CallDuration.from_timestamps(call_start_time, datetime.now())
                print(f"Call duration: {call_duration}")
                ctx.add_shutdown_callback(
                    lambda: store_conversation_history(agent, 
                                                   room_name, 
                                                   ctx.job.id, 
                                                   first_participant.identity, 
                                                   participant_prospects[first_participant.sid],
                                                   call_duration)
                )
                ctx.shutdown(reason=f"Subscribed participant disconnected after {call_duration}")
            else:
                print(f"Participant disconnected but was not the available participant: {participant.identity}")

            print("User stopped speaking")


        try:
            while True:
                await asyncio.sleep(0.2)
        except Exception as e:
            print(f"Error in main loop: {str(e)}")
        finally:
            # Cancel the silence checker task during cleanup
            if silence_checker_task and not silence_checker_task.done():
                silence_checker_task.cancel()
                try:
                    await silence_checker_task
                except asyncio.CancelledError:
                    pass

    except Exception as e:
        print(f"Error in entrypoint: {str(e)}")
    finally:
        # Ensure proper cleanup
        ctx.shutdown(reason="finally, session ended")


# async def request_fnc(ctx: JobRequest):
#     print("request_fnc called")
#     return True

def prewarm_fnc(proc: JobProcess):
    # load silero weights and store to process userdata
    proc.userdata["vad"] = silero.VAD.load()

# async def load_fnc(proc: JobProcess):
#     print("load_fnc called")
#     return True


if __name__ == "__main__":
    opts = WorkerOptions(
        # entrypoint function is called when a job is assigned to this worker
        entrypoint_fnc=entrypoint,
        # the type of worker to create, either JT_ROOM or JT_PUBLISHER
        worker_type=WorkerType.ROOM,
        # # inspect the request and decide if the current worker should handle it.
        # request_fnc=request_fnc,
        # a function to perform any necessary initialization in a new process.
        prewarm_fnc=prewarm_fnc,
    )

    cli.run_app(opts)