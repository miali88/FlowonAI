import aiohttp, json, os, sys, aiofiles, asyncio
from typing import Optional, Annotated
from dotenv import load_dotenv

from livekit import agents
from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli, tokenize, tts
from livekit.agents.llm import ChatContext, ChatMessage
from livekit.agents.voice_assistant import VoiceAssistant
from livekit.plugins import deepgram, openai, silero, cartesia
from livekit import rtc

load_dotenv()

INSTRUCTIONS = os.getenv('AGENT_INSTRUCTIONS')
VOICE_ID = os.getenv('AGENT_VOICE_ID')
TEMPERATURE = float(os.getenv('AGENT_TEMPERATURE', "0.6"))
OPENING_LINE = os.getenv('AGENT_OPENING_LINE', "Hello there. How can I help you today?")
DOMAIN = os.getenv('BACKEND_DOMAIN', "http://localhost:8000/api/v1")
USER_ID = os.getenv('USER_ID')
AGENT_ID = os.getenv('AGENT_ID')

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
            "Called when the agent requests personal data from the user (e.g. name, email address, phone number, etc.), or when the user expresses a need to speak to a human."))
    async def request_personal_data(
        self,
        message: str
    ):
        print(f"Triggering request personal data: {message}")
        return "Personal data requested"

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
        print(f"Triggering end call: {user_msg}")
        return None


class CustomVoiceAssistant(VoiceAssistant):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.DOMAIN = "http://localhost:8000/api/v1"
        self.agent_id = os.getenv('AGENT_ID')
        self.job_id = None  # Add this line to store the job_id

    async def _synthesize_answer_task(
        self,
        old_task: Optional[asyncio.Task[None]],
        handle
    ) -> None:
        copied_ctx = self._chat_ctx.copy()
        await super()._synthesize_answer_task(old_task, handle)
        
        print("\n\n\n _synthesize_answer_task method called")
        # extra_data = {
        #     "user_transcript": handle.user_question,
        #     "speech_id": handle.id,
        #     "elapsed": -1.0,  # You might want to calculate this
        #     "job_id": self._job_id,
        #     "call_state": self._call_state.value if hasattr(self, '_call_state') else None,
        #     "agent_id": self.agent_id
        # }
        print("\n\n\n extra_data:", )
        async with aiohttp.ClientSession() as session:
            try:
                print(f"\n\nAbout to send POST request to {self.DOMAIN}/voice/transcript/real_time")
                #print(f"Request data: {extra_data}")
            #     async with session.post(f'{self.DOMAIN}/voice/transcript/real_time', json=extra_data) as response:
            #         #print(f"\n\nResponse status: {response.status}")
            #         #print(f"Response headers: {response.headers}")
            #         response_text = await response.text()
            #         #print(f"Raw response text: {response_text}")
                    
            #         #print("\n\nabout to parse JSON!!!:", response_text)
            #         response_data = json.loads(response_text)

            #         #print("\n\nParsed JSON response from /voice/transcript/real_time:", response_data)
                    
            #         # Add the RAG results to the chat context
            #         rag_results = response_data.get('rag_results', [])
            #         if rag_results:
            #             rag_content = "\n".join([f"- {result}" for result in rag_results])
            #             #print("\n\n adding RAG results to context:", rag_content)
            #             # self._chat_ctx.messages.append(ChatMessage(
            #             #     role="user",
            #             #     content=f"Here are some relevant pieces of information:\n{rag_content}"
            #             # ))
            #             # print("\n\nAdded RAG results to chat context")
            #         else:
            #             pass
            #             #print("\n\nNo RAG results to add to chat context")

            except Exception as e:
                self.logger.error(f"Error sending transcript data to backend: {str(e)}", extra={"job_id": self._job_id})
                print(f"\n\nError sending transcript data to backend: {str(e)}")

        print("\n\nFinished _synthesize_answer_task method")

        # After processing the response, check if a function was called
        if handle.function_calls:
            for function_call in handle.function_calls:
                if function_call.name == "request_personal_data":
                    print("\n\n\n in _synthesize_answer_task: Triggering request personal data function call")
                    function_response = "I've noted your request for personal information. "
                    function_response += "Could you please provide your name, email, and phone number?"
                    
                    # Create a new speech handle for the function response
                    new_handle = await self._llm.chat(
                        self._chat_ctx,
                        function_response,
                        functions=self._functions,
                    )
                    
                    # Synthesize and play the new response
                    await self._tts.synthesize(new_handle.content, self._audio_stream)

    async def trigger_show_chat_input(self, room_name: str, job_id: str):
        print("\n\n\n trigger_show_chat_input method called", job_id)
        async with aiohttp.ClientSession() as session:
            try:
                await session.post(f'{self.DOMAIN}/conversation/trigger_show_chat_input', json={'room_name': room_name, 'job_id': job_id})
                print("\n\n\n post /conversation/trigger_show_chat_input", job_id)
                
                response = await session.get(f'{self.DOMAIN}/conversation/chat_message', json={'room_name': room_name, 'job_id': job_id})
                response_data = await response.json()
                
                if response_data and isinstance(response_data, list) and len(response_data) > 0:
                    chat_message = {
                        'full_name': response_data[0].get('full_name'),
                        'email': response_data[0].get('email'),
                        'contact_number': response_data[0].get('contact_number')
                    }
                    print("\n\n\n Processed chat_message:", chat_message)
                    
                    # Here you can add logic to handle the chat_message data
                    # For example, you might want to add it to the chat context or use it in some other way
                    #test
                else:
                    print("\n\n\n No valid chat message data received")
                
            except Exception as e:
                self.logger.error(f"Error triggering show_chat_input: {str(e)}", extra={'room_name': room_name, 'job_id': job_id})

# Global lock for room management
room_locks = {}

async def acquire_room_lock(room_name):
    if room_name not in room_locks:
        room_locks[room_name] = asyncio.Lock()
    
    async with room_locks[room_name]:
        lock_file = f"/tmp/room_lock_{room_name}"
        if os.path.exists(lock_file):
            # Room is already locked, exit
            print(f"Room {room_name} is already in use. Exiting.")
            sys.exit(0)
        
        # Create lock file
        async with aiofiles.open(lock_file, 'w') as f:
            await f.write(str(os.getpid()))

async def release_room_lock(room_name):
    lock_file = f"/tmp/room_lock_{room_name}"
    if os.path.exists(lock_file):
        os.remove(lock_file)

async def entrypoint(ctx: JobContext):
    room_name = ctx.room.name
    try:
        await acquire_room_lock(room_name)
        
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
        assistant = CustomVoiceAssistant(
            vad=silero.VAD.load(),  # This line is causing an issue
            stt=deepgram.STT(),     # We'll use Deepgram's Speech To Text (STT)
            llm=gpt,
            tts=cartesia_tts,         # We'll use OpenAI's Text To Speech (TTS)
            fnc_ctx=AssistantFunction(),
            chat_ctx=chat_context,
        )
        assistant.job_id = ctx.job.id  # Add this line to set the job_id

        async def send_transcript_to_backend(transcript: dict, endpoint: str, chat_context: ChatContext, room: rtc.Room):
            """
            Send the transcript and chat context to a backend API endpoint asynchronously.
            """
            backend_url = f"{DOMAIN}{endpoint}"
            print(f"\n\n\n Sending to {endpoint}:", transcript)

            transcript["user_id"] = USER_ID
            transcript["job_id"] = ctx.job.id
            transcript["room_name"] = room.name
            transcript["room_sid"] = await room.sid
            transcript['agent_id'] = AGENT_ID

            try:
                async with aiohttp.ClientSession() as session:
                    async with session.post(backend_url, json=transcript) as response:
                        if response.status == 200:
                            print(f"Transcript and chat context sent to backend successfully")
                            return await response.json()  # Return the response data if needed
                        else:
                            print(f"Failed to send data to backend. Status: {response.status}")
                            return None
            except aiohttp.ClientError as e:
                print(f"Error sending data to backend: {str(e)}")
                return None

        # async def _answer(text: str):
        #     """
        #     Answer the user's message with the given text and optionally the latest
        #     image captured from the video track.
        #     """
        #     content: list[str | ChatImage] = [text]
        #     if use_image and latest_image:
        #         content.append(ChatImage(image=latest_image))

        #     chat_context.messages.append(ChatMessage(role="user", content=content))

        #     stream = gpt.chat(chat_ctx=chat_context)
        #     response = await assistant.say(stream, allow_interruptions=True)

        #     # Check if any functions were called during the response
        #     if response.function_calls:
        #         for function_call in response.function_calls:
        #             if function_call.name == "request_personal_data":
        #                 # Generate a follow-up response after the function call
        #                 follow_up_response = "Now that I've requested your personal information, please go ahead and provide it."
        #                 await assistant.say(follow_up_response, allow_interruptions=False)

        @assistant.on("user_speech_committed")
        def on_transcription(transcript: rtc.ChatMessage):
            """This event triggers when voice input is transcribed."""
            print("\n\n\n VOICE INPUT TRANSCRIBED:", transcript)
            
            user_transcript = {"user_message": transcript.content}

            if transcript.content:
                asyncio.create_task(send_transcript_to_backend(user_transcript, \
                                    "/voice/transcript/commit", chat_context, ctx.room))

        @assistant.on("agent_speech_committed")
        def on_transcription(transcript: rtc.ChatMessage):
            """This event triggers when voice input is transcribed."""
            print("\n\n\n VOICE INPUT TRANSCRIBED:", transcript)

            assistant_transcript = {"assistant_message": transcript.content}

            if transcript.content:
                asyncio.create_task(send_transcript_to_backend(assistant_transcript, \
                                    "/voice/transcript/commit", chat_context, ctx.room))

                for_msg = f""" 
                # User Query:
                {transcript.content}
                """
   
        @assistant.on("function_calls_finished")
        def on_function_calls_finished(called_functions: list[agents.llm.CalledFunction]):
            print("\n\n\n on_function_calls_finished method called")
            print("\n\n\n called_functions:", called_functions)

            """This event triggers when an assistant's function call completes."""

            for called_function in called_functions:
                function_name = called_function.call_info.function_info.name
                print(f"Function called: {function_name}")

                if function_name == "request_personal_data":
                    print("Triggering show_chat_input")
                    # Create a background task to run the async function
                    asyncio.create_task(assistant.trigger_show_chat_input(ctx.room.name, ctx.job.id))

        assistant.start(ctx.room)

        #await asyncio.sleep(0.5)
        await assistant.say(OPENING_LINE, allow_interruptions=False)

        # Keep the process running
        while True:
            await asyncio.sleep(0.2)

    except Exception as e:
        print(f"Error in entrypoint: {str(e)}")
    finally:
        await release_room_lock(room_name)

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
