import asyncio
from typing import Optional, Annotated
from dotenv import load_dotenv
import aiohttp
import json
import time

from livekit import agents, rtc, api
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
            "Called when the conversation has concluded, and the assistant has said goodbye."
        )
    )
    async def end_call(
        self,
        user_msg: Annotated[
            str,
            agents.llm.TypeInfo(
                description="The user message that triggered this function"
            ),
        ],
    ):
        print(f"Message triggering end call: {user_msg}")
        return None

class CustomVoiceAssistant(VoiceAssistant):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.DOMAIN = DOMAIN  # Or set this from environment variables
        self.user_biz_name = None
        self.opening_line = None

    @classmethod
    async def create_agent(cls, system_prompt, opening_line, voice, functions, user_biz_name):
        print("Starting create_agent method")
        
        print(f"Creating ChatContext with system prompt: {system_prompt[:50]}...")
        chat_context = ChatContext(
            messages=[
                ChatMessage(
                    role="system",
                    content=system_prompt,
                ),
            ]
        )

        print("Initializing GPT-4 model")
        gpt = openai.LLM(model="gpt-4")

        print(f"Setting up ElevenLabs TTS with voice ID: {voice}")
        eleven_tts = tts.StreamAdapter(
            tts=elevenlabs.TTS(
                voice=elevenlabs.Voice(
                    id=voice,
                    name="Custom Voice",
                    category="custom"
                )
            ),
            sentence_tokenizer=tokenize.basic.SentenceTokenizer(),
        )

        print("Creating AssistantFunction and adding functions")
        function_context = AssistantFunction()
        for func in functions:
            print(f"Adding function: {func['name']}")
            setattr(function_context, func['name'], func['function'])

        print("Initializing CustomVoiceAssistant")
        assistant = cls(
            vad=silero.VAD.load(),
            stt=deepgram.STT(),
            llm=gpt,
            tts=eleven_tts,
            fnc_ctx=function_context,
            chat_ctx=chat_context,
        )

        print(f"Setting user_biz_name: {user_biz_name}")
        assistant.user_biz_name = user_biz_name
        print(f"Setting opening_line: {opening_line[:50]}...")
        assistant.opening_line = opening_line

        print("Starting assistant in background task")
        asyncio.create_task(cls.run_assistant_background(assistant))

        print("create_agent method completed")
        return assistant

    @staticmethod
    async def run_assistant_background(assistant: 'CustomVoiceAssistant'):
        job_context = await create_job_context_for_assistant(assistant)
        if job_context is None:
            print("Failed to create JobContext. Exiting run_assistant_background.")
            return

        try:
            await job_context.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
            print(f"Room name: {job_context.room.name}")

            assistant.set_job_id(job_context.job.id)
            assistant.start(job_context.room)

            await asyncio.sleep(0.2)
            await assistant.say(assistant.opening_line, allow_interruptions=True)
        except Exception as e:
            print(f"Error in run_assistant_background: {str(e)}")

    async def _synthesize_answer_task(
        self, old_task: Optional[asyncio.Task[None]], handle: SpeechHandle
    ) -> None:
        # Existing implementation...
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

async def create_job_context_for_assistant(assistant: 'CustomVoiceAssistant') -> JobContext:
    try:
        room_name = f"room_{assistant.user_biz_name}_{int(time.time())}"
        room = await rtc.Room.create(name=room_name)
        job = await rtc.Job.create(room=room)
        return JobContext(job=job, room=room)
    except Exception as e:
        print(f"Error creating JobContext: {str(e)}")
        return None