from __future__ import annotations

import asyncio
import logging
import os
import sys
import time
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List, Callable, Awaitable, Union

from dotenv import load_dotenv
from livekit import agents, rtc
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    JobProcess,
    WorkerOptions,
    WorkerType,
    cli
)
from livekit.plugins import silero
from livekit.rtc import RemoteParticipant
from livekit.agents.voice_assistant import VoiceAssistant


from mute_track import CallTransferHandler
from services.cache import get_agent_metadata
from services.nylas_service import send_email
from services.voice.livekit_helper import detect_call_type_and_get_agent_id
from services.voice.livekit_services import create_voice_assistant
from services.voice.tool_use import trigger_show_chat_input

# Add both the project root and backend directory to Python path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
backend_dir = os.path.dirname(__file__)

for path in [project_root, backend_dir]:
    if path not in sys.path:
        sys.path.insert(0, path)


# Configure logging
logging.getLogger('livekit').setLevel(logging.WARNING)
logging.getLogger('openai').setLevel(logging.WARNING)
logging.getLogger('hpack').setLevel(logging.WARNING)
logging.getLogger('httpx').setLevel(logging.WARNING)
logging.getLogger('httpcore').setLevel(logging.WARNING)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

class CallDuration:
    def __init__(self, duration: timedelta) -> None:
        self.duration = duration
        self.total_seconds = int(duration.total_seconds())
        self.minutes = self.total_seconds // 60
        self.seconds = self.total_seconds % 60

    @classmethod
    def from_timestamps(cls, start: datetime, end: datetime) -> 'CallDuration':
        return cls(end - start)

    def __str__(self) -> str:
        return f"{self.minutes}m {self.seconds}s"

    def to_dict(self) -> Dict[str, Union[int, str]]:
        return {
            "total_seconds": self.total_seconds,
            "minutes": self.minutes,
            "seconds": self.seconds,
            "formatted": str(self)
        }


async def entrypoint(ctx: JobContext) -> None:
    logger.info("\n\n\n\n___+_+_+_+_+livekit_server entrypoint called")
    room_name = ctx.room.name
    room = ctx.room
    logger.info(f"room_name: {room_name}")
    logger.info(
        f"Entrypoint called with job_id: {ctx.job.id}, "
        f"connecting to room: {room_name}"
    )

    # Connect to the room BEFORE creating the agent
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    
    call_start_time = datetime.now()
    participant_prospects: Dict[str, str] = {}
    last_audio_time = time.time()
    conversation_stored = False

    try:
        agent_id, call_type = await detect_call_type_and_get_agent_id(room_name)
        # Create agent after connection is established
        agent, opening_line = await create_voice_assistant(agent_id, ctx, call_type)
        agent.start(room)

        if call_type != "textbot":
            await agent.say(opening_line, allow_interruptions=False)

        agent_metadata: Dict[str, Any] = await get_agent_metadata(agent_id) or {}
        user_id: str = agent_metadata.get('userId', '')

        await asyncio.sleep(3)

        # Find first participant
        first_participant: Optional[RemoteParticipant] = None
        sorted_participants = sorted(
            room.remote_participants.values(),
            key=lambda p: p.joined_at if hasattr(p, 'joined_at') else 0
        )

        if sorted_participants:
            first_participant = sorted_participants[0]
            if first_participant is not None:  # Type guard
                participant_prospects[first_participant.sid] = ""
                logger.info(
                    f"Added participant {first_participant.sid} "
                    "to tracking with empty prospect status"
                )
                logger.info(f"Found available participant: {first_participant.identity}")
        else:
            logger.info("No available participants found.")
            ctx.shutdown(reason="No available participants")
            return

        @agent.on("function_calls_finished")
        def on_function_calls_finished(
            called_functions: List[agents.llm.CalledFunction]
        ) -> None:
            """Handle completion of assistant's function calls."""
            logger.info("\n\n\n[on_function_calls_finished] method called")

            for called_function in called_functions:
                function_name = called_function.call_info.function_info.name
                logger.info(f"Function called: {function_name}")

                if function_name == "request_personal_data" and first_participant:
                    logger.info("Triggering show_chat_input")
                    participant_prospects[first_participant.sid] = "yes"
                    asyncio.create_task(
                        handle_chat_input_response(
                            agent,
                            ctx.room.name,
                            ctx.job.id,
                            first_participant.identity,
                            participant_prospects[first_participant.sid]
                        )
                    )
                elif function_name == "transfer_call":
                    logger.info("[on_function_calls_finished] transfer_call called")
                    asyncio.create_task(handle_transfer())

        async def handle_transfer() -> None:

            async with CallTransferHandler(room) as transfer_handler:
                await agent.say(
                    "I'm going to put you on hold for a moment while "
                    "I check in with the staff member",
                    allow_interruptions=False
                )
                await asyncio.sleep(5)
                await transfer_handler.place_participant_on_hold(
                    first_participant.identity
                )

                local_participant = room.local_participant.identity
                await transfer_handler.re_subscribe_agent(local_participant)

                agent.chat_ctx.append(
                    text="## SYSTEM:You have successfully placed the caller on hold "
                         "and are now speaking with the staff member",
                    role="user"
                )

                # Find the second participant (staff member)
                second_participant = None
                for participant in room.remote_participants.values():
                    if participant.sid != first_participant.sid:
                        second_participant = participant
                        break

                if second_participant:
                    agent._link_participant(second_participant.identity)
                    logger.info(
                        f"Found second participant: {second_participant.identity}"
                    )
                    await transfer_handler.re_subscribe_participant(
                        second_participant.identity
                    )
                else:
                    logger.info("No second participant found in the room")

        @agent.on("agent_started_speaking")
        def on_agent_started_speaking(user_transcription: Optional[str] = None) -> None:
            logger.info("agent_started_speaking method called")
            if user_transcription:
                logger.info(f"Agent started speaking: {user_transcription}")
            else:
                logger.info("Agent started speaking (no transcription available)")

        @agent.on("agent_stopped_speaking")
        def on_agent_stopped_speaking() -> None:
            logger.info("Agent stopped speaking")

        @ctx.room.on("participant_connected")
        def on_participant_connected(participant: RemoteParticipant) -> None:
            logger.info(f"Participant connected: {participant.identity}")

        @ctx.room.on("participant_disconnected")
        def on_participant_disconnected(participant: RemoteParticipant) -> None:
            if first_participant and participant.identity == first_participant.identity:
                call_duration = CallDuration.from_timestamps(
                    call_start_time,
                    datetime.now()
                )
                logger.info(f"Call duration: {call_duration}")
                ctx.add_shutdown_callback(
                    lambda: store_conversation_history(
                        agent,
                        room_name,
                        ctx.job.id,
                        first_participant.identity,
                        participant_prospects[first_participant.sid],
                        call_duration
                    )
                )
                ctx.shutdown(
                    reason=f"Subscribed participant disconnected after {call_duration}"
                )

        @ctx.room.on("disconnected")
        def on_disconnected(exception: Exception) -> None:
            logger.info(f"Room {room_name} disconnected. Reason: {str(exception)}")

        @ctx.room.on("connected")
        def on_connected() -> None:
            logger.info(f"Room {room_name} connected")

        async def handle_chat_input_response(
            agent: VoiceAssistant,
            room_name: str,
            job_id: str,
            participant_identity: str,
            prospect_status: str
        ) -> None:
            try:
                chat_message = await trigger_show_chat_input(
                    room_name,
                    job_id,
                    participant_identity
                )
                if chat_message:
                    user_message = f"user input data: \n\n{chat_message}\n"
                    try:
                        agent.chat_ctx.append(text=user_message, role="user")
                        logger.info(
                            f"Added user message from {participant_identity} "
                            f"to chat context: {user_message}"
                        )
                    except Exception as append_error:
                        logger.error(
                            f"Error appending to chat_ctx: {str(append_error)}"
                        )
            except Exception as e:
                logger.error(f"Error in handle_chat_input_response: {str(e)}")

        async def store_conversation_history(
            agent: VoiceAssistant,
            room_name: str,
            job_id: str,
            participant_identity: str,
            prospect_status: str,
            call_duration: CallDuration
        ) -> None:
            nonlocal conversation_stored
            if conversation_stored:
                logger.info("Conversation already stored, skipping...")
                return

            has_user_messages = any(
                message.role == 'user' for message in agent.chat_ctx.messages
            )

            if not has_user_messages:
                logger.info(
                    "No user messages found in chat context, "
                    "skipping conversation storage"
                    )
                return

            conversation_history = []
            for message in agent.chat_ctx.messages:
                message_dict = {}
                if message.role == 'assistant':
                    message_dict['assistant_message'] = message.content
                elif message.role == 'user':
                    message_dict['user_message'] = message.content
                elif message.role == 'tool':
                    message_dict['tool_name'] = message.name
                    message_dict['tool_content'] = message.content

                if message_dict:
                    conversation_history.append(message_dict)

            try:
                import aiohttp

                API_BASE_URL = os.getenv('API_BASE_URL')
                url = f"{API_BASE_URL}/conversation/store_history"

                payload = {
                    "transcript": conversation_history,
                    "job_id": job_id,
                    "participant_identity": participant_identity,
                    "room_name": room_name,
                    "user_id": user_id,
                    "agent_id": agent_id,
                    "prospect_status": prospect_status,
                    "call_duration": call_duration.to_dict(),
                    "call_type": "tel" if room_name.startswith("call-") else "web"
                }

                async with aiohttp.ClientSession() as session:
                    async with session.post(url, json=payload) as response:
                        if response.status == 200:
                            logger.info("Successfully stored conversation history")
                        else:
                            logger.error(
                                f"Failed to store conversation history. "
                                f"Status: {response.status}"
                            )

            except Exception as e:
                logger.error(f"Error storing conversation history: {str(e)}")

            if prospect_status == "yes":
                logger.info("prospect_status is yes, sending email")
                await send_email(participant_identity, conversation_history, agent_id)

            conversation_stored = True

        async def check_silence_timeout() -> None:
            while True:
                await asyncio.sleep(1)
                current_time = time.time()
                time_since_last_audio = current_time - last_audio_time

                if time_since_last_audio > SILENCE_TIMEOUT:
                    call_duration = CallDuration.from_timestamps(
                        call_start_time,
                        datetime.now()
                    )
                    
                    if first_participant is None:
                        logger.error("First participant is None during silence timeout")
                        ctx.shutdown(reason="First participant not found during silence timeout")
                        break
                        
                    await store_conversation_history(
                        agent,
                        room_name,
                        ctx.job.id,
                        first_participant.identity,
                        participant_prospects[first_participant.sid],
                        call_duration
                    )
                    
                    ctx.shutdown(
                        reason=f"Silence timeout reached after {call_duration}"
                    )
                    break

        SILENCE_TIMEOUT = 90
        silence_checker_task = asyncio.create_task(check_silence_timeout())

        try:
            while True:
                await asyncio.sleep(0.2)
        except Exception as e:
            logger.error(f"Error in main loop: {str(e)}")
        finally:
            if silence_checker_task and not silence_checker_task.done():
                silence_checker_task.cancel()
                try:
                    await silence_checker_task
                except asyncio.CancelledError:
                    pass

    except Exception as e:
        logger.error(f"Error in entrypoint: {str(e)}")
    finally:
        ctx.shutdown(reason="Session ended")


def prewarm_fnc(proc: JobProcess) -> None:
    proc.userdata["vad"] = silero.VAD.load()


if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

    opts = WorkerOptions(
        entrypoint_fnc=entrypoint,
        worker_type=WorkerType.ROOM,
        prewarm_fnc=prewarm_fnc,
    )

    cli.run_app(opts)
