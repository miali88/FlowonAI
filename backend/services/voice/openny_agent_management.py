from dotenv import load_dotenv
import os, asyncio, sys

from livekit import agents
from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli, tokenize, tts
from livekit.agents.llm import ChatContext, ChatMessage
from livekit.agents.voice_assistant import VoiceAssistant
from livekit.plugins import deepgram, openai, silero, cartesia
from livekit import rtc
from livekit import api

load_dotenv()

INSTRUCTIONS = os.getenv('AGENT_INSTRUCTIONS')
VOICE_ID = os.getenv('AGENT_VOICE_ID')
TEMPERATURE = float(os.getenv('AGENT_TEMPERATURE', "0.6"))
OPENING_LINE = os.getenv('AGENT_OPENING_LINE', "Hello there. How can I help you today?")
DOMAIN = os.getenv('BACKEND_DOMAIN', "http://localhost:8000/api/v1")
USER_ID = os.getenv('USER_ID')
AGENT_ID = os.getenv('AGENT_ID')
ROOM_NAME = os.getenv('ROOM_NAME')

async def entrypoint(ctx: JobContext):
    room_name = ctx.room.name
    room = ctx.room
    shutdown_event = asyncio.Event()

    try:
        print(f"Entrypoint called with job_id: {ctx.job.id}, connecting to room: {room_name}")
        await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
        print(f"Room name: {room_name}")

        chat_context = ChatContext(
            messages=[
                ChatMessage(
                    role="system",
                    content=INSTRUCTIONS)])

        gpt = openai.LLM(model="gpt-4o", temperature=TEMPERATURE)

        cartesia_tts = tts.StreamAdapter(
            tts=cartesia.TTS(voice=VOICE_ID),
            sentence_tokenizer=tokenize.basic.SentenceTokenizer()
        )

        # Use CustomVoiceAssistant instead of VoiceAssistant
        assistant = VoiceAssistant(
            vad=silero.VAD.load(),  # This line is causing an issue
            stt=deepgram.STT(),     # We'll use Deepgram's Speech To Text (STT)
            llm=gpt,
            tts=cartesia_tts,         # We'll use OpenAI's Text To Speech (TTS)
            chat_ctx=chat_context,
        )
        assistant.job_id = ctx.job.id  # Add this line to set the job_id

        assistant.start(ctx.room)

        #await asyncio.sleep(0.5)
        await assistant.say(OPENING_LINE, allow_interruptions=False)

        print("iterating through room.remote_participants")
        for rp in room.remote_participants.values():
            print("rp.identity", rp.identity)


        def begin_shutdown():
            print("\n\nbeginning shutdown")
            asyncio.create_task(shutdown_tasks(ctx))

        async def shutdown_tasks(ctx):
            await ctx.room.disconnect()
            ctx.shutdown(reason="Session ended")
            client = api.LiveKitAPI(
                os.getenv("LIVEKIT_URL"),
                os.getenv("LIVEKIT_API_KEY"),
                os.getenv("LIVEKIT_API_SECRET"),
            )
            await client.room.delete_room(room_name=ctx.job.room.name)
            shutdown_event.set()

        #room.on('participant_disconnected', lambda p: print(f"Participant {p.identity} disconnected"))
        @ctx.room.on('participant_disconnected')
        def on_participant_disconnected(participant: rtc.RemoteParticipant):
            print(f"Participant {participant.identity} disconnected")
            begin_shutdown()

        """ Optional: Add a condition to trigger shutdown if needed """
        # Example: Monitor for specific events or timeouts
        # asyncio.create_task(monitor_room(room, shutdown_tasks))

        # Wait until shutdown is triggered
        await shutdown_event.wait()

    except Exception as e:
        print(f"Error in entrypoint: {str(e)}")
        await shutdown_tasks()


def request_fnc(req: agents.JobRequest):
    # Implement any job filtering logic if necessary
    # For now, accept all jobs
    return req.accept(
        name="agent",
        identity=f"agent-{req.job.id}"
    )

if __name__ == "__main__":
    opts = WorkerOptions(
        entrypoint_fnc=entrypoint,
        request_fnc=request_fnc,  # Optional: Implement if you need to filter jobs
        # prewarm_fnc=None,          # Implement if necessary
        # load_fnc=None,             # Implement if necessary
        # load_threshold=None,       # Set as per your requirements
        # permissions=None,          # Define permissions if needed
        worker_type=agents.WorkerType.ROOM,  # Assuming ROOM type,
        shutdown_process_timeout=1
    )
    cli.run_app(opts)
