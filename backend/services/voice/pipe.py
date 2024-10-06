from livekit.agents.voice_assistant import VoicePipelineAgent
from livekit.plugins import elevenlabs, deepgram, openai, silero
from livekit.agents import llm 

initial_ctx = llm.ChatContext().append(
    role="system",
    text="Your name is Beth. You are a helpful assistant.")


agent = VoicePipelineAgent(
    vad=silero.VAD.load(),
    # flexibility to use any models
    stt=deepgram.STT(model="nova-2-general"),
    llm=openai.LLM(),
    tts=elevenlabs.TTS(),
    # intial ChatContext with system prompt
    chat_ctx=initial_ctx,
    # whether the agent can be interrupted
    allow_interruptions=True,
    # sensitivity of when to interrupt
    interrupt_speech_duration=0.5,
    interrupt_min_words=0,
    # minimal silence duration to consider end of turn
    min_endpointing_delay=0.5,
    # callback to run before LLM is called, can be used to modify chat context
    before_llm_cb=None,
    # callback to run before TTS is called, can be used to customize pronounciation
    before_tts_cb=None,
)
