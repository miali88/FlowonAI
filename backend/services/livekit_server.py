from livekit import agents, rtc
from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli

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
        def on_disconnected(exception: Exception):
            print(f"Room {room_name} disconnected. Reason: {str(exception)}")

        @ctx.room.on('connected')
        def on_connected():
            print(f"Room {room_name} connected")

    except Exception as e:
        print(f"Error in entrypoint: {str(e)}")
    finally:
        # Ensure proper cleanup
        if hasattr(ctx.room, 'disconnect'):
            await ctx.room.disconnect()
        elif hasattr(ctx, 'disconnect'):
            await ctx.disconnect()
        else:
            print("No disconnect method found. Please check LiveKit SDK documentation for proper cleanup.")

if __name__ == "__main__":
    opts = WorkerOptions(
        entrypoint_fnc=entrypoint,
    )
    cli.run_app(opts)
