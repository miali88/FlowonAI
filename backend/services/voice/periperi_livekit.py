import asyncio
from typing import Annotated

from livekit import agents, rtc
from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli, tokenize, tts
from livekit.agents.llm import (
    ChatContext,
    ChatImage,
    ChatMessage,
    )

from livekit.agents.voice_assistant import VoiceAssistant
from livekit.plugins import deepgram, openai, silero
import os 
from dotenv import load_dotenv
import aiohttp
from peri_sys_prompt import sys_prompt

load_dotenv()

DOMAIN = "http://localhost:8000/api/v1"

class AssistantFunction(agents.llm.FunctionContext):
    """This class is used to define functions that will be called by the assistant."""

    @agents.llm.ai_callable(
        description=(
            "Called when asked to evaluate something that would require vision capabilities,"
            "for example, an image, video, or the webcam feed."
        )
    )
    async def text_box(
        self,
        user_msg: Annotated[
            str,
            agents.llm.TypeInfo(
                description="The user message that triggered this function"
            ),
        ],
    ):
        print(f"Message triggering vision capabilities: {user_msg}")
        return None

async def entrypoint(ctx: JobContext):
    print(f"Entrypoint called with job_id: {ctx.job.id}")
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    print(f"Room name: {ctx.room.name}")

    chat_context = ChatContext(
        messages=[
            ChatMessage(
                role="system",
                content=(
                    sys_prompt
                ),
            )
        ]
    )

    gpt = openai.LLM(model="gpt-4o")

    # Since OpenAI does not support streaming TTS, we'll use it with a StreamAdapter
    # to make it compatible with the VoiceAssistant
    openai_tts = tts.StreamAdapter(
        tts=openai.TTS(voice="alloy"),
        sentence_tokenizer=tokenize.basic.SentenceTokenizer(),
    )

    assistant = VoiceAssistant(
        vad=silero.VAD.load(),  # We'll use Silero's Voice Activity Detector (VAD)
        stt=deepgram.STT(),     # We'll use Deepgram's Speech To Text (STT)
        llm=gpt,
        tts=openai_tts,         # We'll use OpenAI's Text To Speech (TTS)
        fnc_ctx=AssistantFunction(),
        chat_ctx=chat_context,
    )

    # Set the job_id using the new set_job_id method
    assistant.set_job_id(ctx.job.id)

    #chat = rtc.ChatManager(ctx.room)

    async def _answer(text: str, use_image: bool = False):
        """
        Answer the user's message with the given text and optionally the latest
        image captured from the video track.
        """
        content: list[str | ChatImage] = [text]

        chat_context.messages.append(ChatMessage(role="user", content=content))

        stream = gpt.chat(chat_ctx=chat_context)
        await assistant.say(stream, allow_interruptions=True)

    async def send_transcript_to_backend(transcript: str, endpoint: str):
        """
        Send the transcript to a backend API endpoint.
        """
        backend_url = f"{DOMAIN}{endpoint}"
        print(f"\n\n\n Sending to {endpoint}:", transcript)
        async with aiohttp.ClientSession() as session:
            async with session.post(backend_url, json={"transcript": transcript}) as response:
                if response.status == 200:
                    print(f"Transcript sent to backend successfully: {transcript}")
                else:
                    print(f"Failed to send transcript to backend. Status: {response.status}")

    @assistant.on("user_speech_committed")
    async def on_transcription(transcript: rtc.ChatMessage):
        """This event triggers when voice input is transcribed."""
        print("\n\n\n VOICE INPUT TRANSCRIBED:", transcript)
        if transcript.content:
            # Send the transcript to the backend
            await send_transcript_to_backend(transcript.content, "/voice/transcript/commit")

            for_msg = f""" 
            # User Query:
            {transcript.content}
            """
            # # Retrieved Docs:
            # {"michael has one pet cat"} """

            print("\n\n\n VOICE MSG:...", for_msg)

            # Await the _answer function directly
            await _answer(for_msg, use_image=False)

    @assistant.on("user_speech_recognized")
    async def on_user_speech_recognized(transcript: rtc.ChatMessage):
        """This event triggers when speech is recognized in real-time."""
        if transcript and transcript.content:
            # print("\n\n\n REAL-TIME TRANSCRIPT:", transcript.content)
            # Send the real-time transcript to the backend
            asyncio.create_task(send_transcript_to_backend(transcript.content, "/voice/transcript/real_time"))

    user_biz_name = "PeriPeri"
    opening_line =  f"Hi, thanks for visiting {user_biz_name}, I'm here to answer any questions you may have, and to help you host a memorable event. The more information you can share, the better"

    assistant.start(ctx.room)

    await asyncio.sleep(0.2)
    # await assistant.say(opening_line, allow_interruptions=True)

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
