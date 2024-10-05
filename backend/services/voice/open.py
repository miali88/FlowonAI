from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, WorkerType, cli, multimodal
from livekit.plugins import openai
from dotenv import load_dotenv
import os

load_dotenv()

# Use environment variables with defaults
INSTRUCTIONS = os.getenv('AGENT_INSTRUCTIONS', "Your name is Jody, and you are a librarian.")
VOICE = os.getenv('AGENT_VOICE', "alloy")
TEMPERATURE = float(os.getenv('AGENT_TEMPERATURE', "0.8"))

async def entrypoint(ctx: JobContext):
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    agent = multimodal.MultimodalAgent(
        model=openai.realtime.RealtimeModel(
            instructions=INSTRUCTIONS,
            voice=VOICE,
            temperature=TEMPERATURE,
            max_response_output_tokens="inf",
            modalities=["text", "audio"],
            turn_detection=openai.realtime.ServerVadOptions(
                threshold=0.5,
                silence_duration_ms=200,
                prefix_padding_ms=300,
            )
        )
    )
    agent.start(ctx.room)

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, worker_type=WorkerType.ROOM))
