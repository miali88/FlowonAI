from livekit import agents, rtc
from livekit.agents import AutoSubscribe, JobContext, JobProcess, JobRequest, WorkerOptions, WorkerType, cli

from services.voice.livekit_services import create_voice_assistant
import asyncio
from dotenv import load_dotenv

load_dotenv()

async def entrypoint(ctx: JobContext):
    try:
        room_name = ctx.room.name
        room = ctx.room
        
        print(f"Entrypoint called with job_id: {ctx.job.id}, connecting to room: {room_name}")
        await ctx.connect(auto_subscribe=AutoSubscribe.SUBSCRIBE_NONE)
        print(f"Room name: {room_name}")

        print("iterating through room.remote_participants")
        for rp in room.remote_participants.values():
            print("rp.identity", rp.identity)

        # Find an available participant that is not subscribed to any track
        available_participant = None
        for rp in room.remote_participants.values():
            print("remote participant:",rp)
            if not any(pub.subscribed for pub in rp.track_publications.values()):
                print("available participant found:",rp)
                available_participant = rp
                break

        if available_participant:
            print(f"Found available participant: {available_participant.identity}")            
            for publication in available_participant.track_publications.values():
                print("publication", publication)
                if publication.kind == rtc.TrackKind.KIND_AUDIO and publication.source == rtc.TrackSource.SOURCE_MICROPHONE:
                    publication.set_subscribed(True)
                    print(f"Subscribed to audio track: {publication.sid}")
                    break
            
            # Create and start the agent here, within the job context
            agent_id = room_name.split('_')[1]  # Extract agent_id from room name
            agent = await create_voice_assistant(agent_id)
            agent.start(room, available_participant)
            await agent.say("Hello, I'm ready to assist you.", allow_interruptions=False)

        else:
            print("No available participants found.")
            await ctx.shutdown(reason="No available participants")

        """ EVENT HANDLERS FOR AGENT """            
        @ctx.room.on('participant_disconnected')
        def on_participant_disconnected(participant: rtc.RemoteParticipant):
            print(f"Participant {participant.identity} disconnected")
            print(f"Agent {ctx.job.id} connected to:", available_participant)
            print("if match, then shut down worker")
            if participant.identity == available_participant.identity:
                print("participant disconnected, shutting down worker")
                ctx.shutdown(reason="Subscribed participant disconnected")

        @ctx.room.on("track_subscribed")
        def on_track_subscribed(
            track: rtc.Track,
            publication: rtc.TrackPublication,
            participant: rtc.RemoteParticipant,
        ):
            if track.kind == rtc.TrackKind.KIND_AUDIO:
                audio_stream = rtc.AudioStream(track)
                for event in audio_stream:
                    print(event.frame)

        @ctx.room.on('disconnected')
        def on_disconnected(exception: Exception):
            print(f"Room {room_name} disconnected. Reason: {str(exception)}")

        @ctx.room.on('connected')
        def on_connected():
            print(f"Room {room_name} connected")

        while True:
            await asyncio.sleep(0.2)


    except Exception as e:
        print(f"Error in entrypoint: {str(e)}")
    finally:
         # Ensure proper cleanup
        ctx.shutdown(reason="finally, session ended")


# async def request_fnc(ctx: JobRequest):
#     print("request_fnc called")
#     return True

# def prewarm_fnc(ctx: JobProcess):
#     print("prewarm_fnc called")
#     return True

# async def load_fnc(proc: JobProcess):
#     print("load_fnc called")
#     return True


if __name__ == "__main__":
    opts = WorkerOptions(
        # entrypoint function is called when a job is assigned to this worker
        entrypoint_fnc=entrypoint,
        # the type of worker to create, either JT_ROOM or JT_PUBLISHER
        worker_type=WorkerType.PUBLISHER,
        # # inspect the request and decide if the current worker should handle it.
        # request_fnc=request_fnc,
        # # a function to perform any necessary initialization in a new process.
        # prewarm_fnc=prewarm_fnc,
    )

    cli.run_app(opts)
