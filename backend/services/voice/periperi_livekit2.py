import asyncio
from typing import Optional, Annotated
from dotenv import load_dotenv
import aiohttp
import json

from livekit import agents, rtc
from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli, tokenize, tts
from livekit.agents.llm import ChatContext, ChatImage, ChatMessage
from livekit.agents.voice_assistant import VoiceAssistant
from livekit.agents.voice_assistant.speech_handle import SpeechHandle  # Correct import
from livekit.plugins import deepgram, openai, silero, elevenlabs

from services.voice.prompt import sys_prompt

load_dotenv()

DOMAIN = "http://localhost:8000/api/v1"

class AssistantFunction(agents.llm.FunctionContext):
    """This class is used to define functions that will be called by the assistant."""

    # @agents.llm.ai_callable(
    #     description=(
    #         "Called when asked to transfer the call to a human, or when the client is qualified and wants to speak to a human."
    #     )
    # )
    # async def transfer_call(
    #     self,
    #     user_msg: Annotated[
    #         str,
    #         agents.llm.TypeInfo(
    #             description="The user message that triggered this function"
    #         ),
    #     ],
    # ):
    #     print(f"Message triggering transfer call: {user_msg}")
    #     return None

    @agents.llm.ai_callable(
        description=(
            "Called when the conversation has concluded, and the assistant has said goodbye."))
    async def end_call(
        self,
        user_msg: Annotated[
            str,
            agents.llm.TypeInfo(
                description="The user message that triggered this function"
            ),
        ],
    ):
        print(f"Message triggering transfer call: {user_msg}")
        return None

class CustomVoiceAssistant(VoiceAssistant):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.DOMAIN = "http://localhost:8000/api/v1"  # Or set this from environment variables

    async def _synthesize_answer_task(
        self, old_task: Optional[asyncio.Task[None]], handle: SpeechHandle
    ) -> None:

        copied_ctx = self._chat_ctx.copy()
        print("\n\nCopied Chat Context:", copied_ctx)
        await super()._synthesize_answer_task(old_task, handle)
        extra_data = {
            "user_transcript": handle.user_question,
            "speech_id": handle.id,
            "elapsed": -1.0,  # You might want to calculate this
            "job_id": self._job_id,
            "call_state": self._call_state.value if hasattr(self, '_call_state') else None
        }

        async with aiohttp.ClientSession() as session:
            try:
                print(f"\n\nAbout to send POST request to {self.DOMAIN}/voice/transcript/real_time")
                print(f"Request data: {extra_data}")
                async with session.post(f'{self.DOMAIN}/voice/transcript/real_time', json=extra_data) as response:
                    print(f"\n\nResponse status: {response.status}")
                    print(f"Response headers: {response.headers}")
                    response_text = await response.text()
                    print(f"Raw response text: {response_text}")
                    
                    print("\n\nabout to parse JSON!!!:", response_text)
                    response_data = json.loads(response_text)

                    print("\n\nParsed JSON response from /voice/transcript/real_time:", response_data)
                    
                    # Add the RAG results to the chat context
                    rag_results = response_data.get('rag_results', [])
                    if rag_results:
                        rag_content = "\n".join([f"- {result}" for result in rag_results])
                        print("\n\n adding RAG results to context:", rag_content)
                        # self._chat_ctx.messages.append(ChatMessage(
                        #     role="user",
                        #     content=f"Here are some relevant pieces of information:\n{rag_content}"
                        # ))
                        # print("\n\nAdded RAG results to chat context")
                    else:
                        print("\n\nNo RAG results to add to chat context")



            except Exception as e:
                self.logger.error(f"Error sending transcript data to backend: {str(e)}", extra={"job_id": self._job_id})
                print(f"\n\nError sending transcript data to backend: {str(e)}")

        print("\n\nFinished _synthesize_answer_task method")

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
    ELEVENLABS_VOICE_ID = "aTbnroHRGIomiKpqAQR8"
    eleven_tts = tts.StreamAdapter(
        tts=elevenlabs.TTS(voice=elevenlabs.Voice(
            id=ELEVENLABS_VOICE_ID,
            name="Custom Voice",  # You can set a name for the voice
            category="custom"  # You can set a category if needed
        )),
        sentence_tokenizer=tokenize.basic.SentenceTokenizer(),
    )

    # Use CustomVoiceAssistant instead of VoiceAssistant
    assistant = CustomVoiceAssistant(
        vad=silero.VAD.load(),  # We'll use Silero's Voice Activity Detector (VAD)
        stt=deepgram.STT(),     # We'll use Deepgram's Speech To Text (STT)
        llm=gpt,
        tts=eleven_tts,         # We'll use OpenAI's Text To Speech (TTS)
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

    async def send_transcript_to_backend(transcript: str, endpoint: str, chat_context: ChatContext):
        """
        Send the transcript and chat context to a backend API endpoint asynchronously.
        """
        backend_url = f"{DOMAIN}{endpoint}"
        print(f"\n\n\n Sending to {endpoint}:", transcript)
        
        # Prepare the data to be sent
        data = {"": ""}

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(backend_url, json=data) as response:
                    if response.status == 200:
                        print(f"Transcript and chat context sent to backend successfully")
                        return await response.json()  # Return the response data if needed
                    else:
                        print(f"Failed to send data to backend. Status: {response.status}")
                        return None
        except aiohttp.ClientError as e:
            print(f"Error sending data to backend: {str(e)}")
            return None
        
    @assistant.on("user_speech_committed")
    def on_transcription(transcript: rtc.ChatMessage):
        """This event triggers when voice input is transcribed."""
        print("\n\n\n VOICE INPUT TRANSCRIBED:", transcript)

        if transcript.content:
            # Send the transcript and chat context to the backend
            asyncio.create_task(send_transcript_to_backend(transcript.content, "/voice/transcript/commit", chat_context))

            for_msg = f""" 
            # User Query:
            {transcript.content}
            """
            # # Retrieved Docs:
            # {"michael has one pet cat"} """

            print("\n\n\n VOICE MSG:...", for_msg)

            # Await the _answer function directly
            #await _answer(for_msg, use_image=False)


    user_biz_name = "PeriPeri"
    opening_line =  f"Howdy, the petrol tastes fantastic today, anyway. What's on your mind"

    assistant.start(ctx.room)

    await asyncio.sleep(0.2)
    await assistant.say(opening_line, allow_interruptions=True)

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
