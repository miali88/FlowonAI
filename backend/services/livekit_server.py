from livekit import agents
from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli

from livekit import rtc

from dotenv import load_dotenv

load_dotenv()

async def entrypoint(ctx: JobContext):
    try:
        room_name = ctx.room.name
        room = ctx.room
        
        print(f"Entrypoint called with job_id: {ctx.job.id}, connecting to room: {room_name}")
        await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
        print(f"Room name: {room_name}")

        print("iterating through room.remote_participants")
        for rp in room.remote_participants.values():
            print("rp.identity", rp.identity)

        # Add event handlers to monitor connection status
        @ctx.room.on('participant_disconnected')
        def on_participant_disconnected(participant: rtc.RemoteParticipant):
            print(f"Participant {participant.identity} disconnected")

        @ctx.room.on('disconnected')
        def on_disconnected(reason: rtc.DisconnectReason):
            print(f"Room {room_name} disconnected. Reason: {reason}")

        @ctx.room.on('connected')
        def on_connected():
            print(f"Room {room_name} connected")

        # Keep the agent running
        await ctx.room.wait_until_disconnected()

    except Exception as e:
        print(f"Error in entrypoint: {str(e)}")
    finally:
        # Ensure proper cleanup
        await ctx.disconnect()

if __name__ == "__main__":
    opts = WorkerOptions(
        entrypoint_fnc=entrypoint,
    )
    cli.run_app(opts)
