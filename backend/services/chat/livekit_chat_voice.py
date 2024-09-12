import asyncio
from typing import Annotated

from livekit import agents, rtc
from livekit.agents import JobContext, WorkerOptions, cli, tokenize, tts
from livekit.agents.llm import (
    ChatContext,
    ChatImage,
    ChatMessage,
)
from livekit.agents.voice_assistant import VoiceAssistant
from livekit.plugins import deepgram, openai, silero
import os 
from dotenv import load_dotenv

load_dotenv()

class AssistantFunction(agents.llm.FunctionContext):
    """This class is used to define functions that will be called by the assistant."""

async def entrypoint(ctx: JobContext):
    import os
    print("Environment variables:")
    print(os.environ)
    
    await ctx.connect()
    print(f"Room name: {ctx.room.name}")

    chat_context = ChatContext(
        messages=[
            ChatMessage(
                role="system",
                content=(
                        """
                        You are a helpful assistant designed to be attentive to the user's queries, this may include conversing, and searching the knowledge base.

                        Note that all user_prompts will be structured as:

                        ```markdown
                            # User Query:
                            <user_message>
                            # Retrieved Docs:
                            <retrieved_docs>
                        ```

                        Your main priority will be to respond to <user_message>. Only consider retrieved docs when the user query appears to ask a question regarding the knowledge base.

                        Where the <user_message> appears to be best answered by information from <retrieved_docs>, you will use <user_message> to augment your response to the user.

                        Be conversational and friendly, while maintaining a professional persona at all times.
                        """
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
        stt=deepgram.STT(),  # We'll use Deepgram's Speech To Text (STT)
        llm=gpt,
        tts=openai_tts,  # We'll use OpenAI's Text To Speech (TTS)
        fnc_ctx=AssistantFunction(),
        chat_ctx=chat_context,
    )

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

    # @chat.on("message_received")
    # def on_message_received(msg: rtc.ChatMessage):
    #     """This event triggers whenever we get a new message from the user."""

    #     if msg.message:
    #         print("\n\n\n MESSAGE RECIEVED...:", msg)

    #         for_msg = f""" 
    #         # User Query:
    #         {msg.message}
    #         # Retrieved Docs:
    #         {"michael has one pet cat"} """

    #         print("\n\n\n FOR MSG:...", for_msg)

    #         asyncio.create_task(_answer(for_msg, use_image=False))

    @assistant.on("user_speech_committed")
    def on_transcription(transcript: rtc.ChatMessage):
        """This event triggers when voice input is transcribed."""
        print("\n\n\n VOICE INPUT TRANSCRIBED:", transcript)
        if transcript.content:
            for_msg = f""" 
            # User Query:
            {transcript.content}
            # Retrieved Docs:
            {"michael has one pet cat"} """

            print("\n\n\n VOICE MSG:...", for_msg)

            asyncio.create_task(_answer(for_msg, use_image=False))

    # @assistant.on("function_calls_finished")
    # def on_function_calls_finished(called_functions: list[agents.llm.CalledFunction]):
    #     """This event triggers when an assistant's function call completes."""

    #     if len(called_functions) == 0:
    #         return

    #     user_msg = called_functions[0].call_info.arguments.get("user_msg")
    #     if user_msg:
    #         asyncio.create_task(_answer(user_msg, use_image=True))

    assistant.start(ctx.room)

    await asyncio.sleep(0.2)
    await assistant.say("Merp, the petrol is spicy", allow_interruptions=True)

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
