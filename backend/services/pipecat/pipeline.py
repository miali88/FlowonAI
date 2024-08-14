import aiohttp
import os
import sys
import atexit
import asyncio
from contextlib import asynccontextmanager

import sys
print(sys.path)
from pipecat.frames.frames import EndFrame, LLMMessagesFrame
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineParams, PipelineTask
from pipecat.processors.aggregators.llm_response import (
    LLMAssistantResponseAggregator,
    LLMUserResponseAggregator
)
from pipecat.services.openai import OpenAILLMService
from pipecat.services.deepgram import DeepgramSTTService
from pipecat.services.elevenlabs import ElevenLabsTTSService
from pipecat.transports.network.fastapi_websocket import FastAPIWebsocketTransport, FastAPIWebsocketParams
from pipecat.vad.silero import SileroVADAnalyzer
from pipecat.serializers.twilio import TwilioFrameSerializer
# from raw_audio_encoder import RawFrameSerializer ## web audio encoder

from app.core.config import settings

from loguru import logger

logger.remove()
logger.add(sys.stdout, level="DEBUG")


import sys
print("Python path:", sys.path)
import pipecat
print("pipecat location:", pipecat.__file__)
from pipecat.frames.frames import EndFrame, LLMMessagesFrame

# Add this import if not already present
from pipecat.transports.network.fastapi_websocket import FastAPIWebsocketTransport

# Subclass FastAPIWebsocketTransport to add logging
class LoggingFastAPIWebsocketTransport(FastAPIWebsocketTransport):
    async def _on_client_connected(self, client):
        logger.debug("_on_client_connected called")
        await super()._on_client_connected(client)

    async def _on_client_disconnected(self, client):
        logger.debug("_on_client_disconnected called")
        await super()._on_client_disconnected(client)

# Global variables to store resources that need cleanup
aiohttp_session = None
runner = None

@asynccontextmanager
async def lifespan(app):
    # Startup
    global aiohttp_session
    if aiohttp_session is None:
        aiohttp_session = aiohttp.ClientSession()
    yield
    # Shutdown
    await cleanup()

async def cleanup():
    global aiohttp_session, runner
    logger.info("Cleaning up resources...")
    
    if aiohttp_session:
        await aiohttp_session.close()
        logger.debug("Closed aiohttp ClientSession")
    
    if runner:
        await runner.cancel()
        logger.debug("Cancelled PipelineRunner")
    
    logger.info("Cleanup completed")

# Register the cleanup function to be called on exit
atexit.register(lambda: asyncio.run(cleanup()))


async def run_bot(websocket_client, stream_sid):
    global runner, aiohttp_session
    logger.info("run_bot called with stream_sid: {}", stream_sid)
    
    messages = [
        {
            "role": "system",
            "content": "You are a helpful LLM in an audio call. Your goal is to demonstrate your capabilities in a succinct way. Your output will be converted to audio so don't include special characters in your answers. Respond to what the user said in a creative and helpful way.",
        },
    ]
    logger.debug(f"Initial messages in run_bot: {messages}")

    try:
        # Ensure aiohttp_session is created if it doesn't exist
        if aiohttp_session is None:
            aiohttp_session = aiohttp.ClientSession()
        logger.debug("Using aiohttp ClientSession")
        
        is_web_client = stream_sid.startswith("simulated_")
        logger.debug("is_web_client: {}", is_web_client)

        transport = LoggingFastAPIWebsocketTransport(
            websocket=websocket_client,
            params=FastAPIWebsocketParams(
                audio_out_enabled=True,
                add_wav_header=is_web_client,
                vad_enabled=True,
                vad_analyzer=SileroVADAnalyzer(),
                vad_audio_passthrough=True,
                serializer=TwilioFrameSerializer(stream_sid=stream_sid) # RawFrameSerializer(stream_id=stream_sid) if is_web_client else 
            )
        )
        logger.debug("LoggingFastAPIWebsocketTransport created")

        """ services """
        llm = OpenAILLMService(
            api_key=settings.OPENAI_API_KEY,
            model="gpt-4o")
        
        logger.debug("OpenAILLMService created")
        stt = DeepgramSTTService(api_key=settings.DEEPGRAM_API_KEY)
        logger.debug("DeepgramSTTService created")
        tts = ElevenLabsTTSService(
            aiohttp_session=aiohttp_session,  # Pass the session here
            api_key=settings.ELEVENLABS_API_KEY,
            voice_id=settings.ELEVENLABS_VOICE_ID,
        )
        logger.debug("ElevenLabsTTSService created")

        tma_in = LLMUserResponseAggregator(messages)
        logger.debug("LLMUserResponseAggregator created:", tma_in)
        tma_out = LLMAssistantResponseAggregator(messages)
        logger.debug("LLMAssistantResponseAggregator created:", tma_out)

        """ not sure we need on connect system prompt? 
            let state machine handle all LLM logic 
        """
        @transport.event_handler("on_client_connected")
        async def on_client_connected(transport, client):
            logger.info("on_client_connected called for stream_sid: {}", stream_sid)
            messages.append({"role": "system", "content": "Tell a hilarious knock knock joke."})
            logger.debug(f"Messages after appending in on_client_connected: {messages}")
            await task.queue_frames([LLMMessagesFrame(messages)])
            logger.debug("Initial message queued")

        @transport.event_handler("on_client_disconnected")
        async def on_client_disconnected(transport, client):
            await task.queue_frames([EndFrame()])

        logger.debug("Event handlers registered for stream_sid: {}", stream_sid)

        pipeline = Pipeline([
            transport.input(),
            stt,
            tma_in,
            llm,
            tts,
            transport.output(),
            tma_out
        ])
        logger.debug("Pipeline created")

        task = PipelineTask(pipeline, params=PipelineParams(allow_interruptions=True))
        logger.debug("PipelineTask created")

        runner = PipelineRunner(handle_sigint=False)
        logger.debug("PipelineRunner created")

        logger.debug(f"Final messages in run_bot before starting runner: {messages}")
        await runner.run(task)
        logger.debug(f"Final messages in run_bot after runner completion: {messages}")

    except Exception as e:
        logger.exception(f"An error occurred in run_bot: {e}")

    logger.info("run_bot finished for stream_sid: {}", stream_sid)