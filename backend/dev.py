from livekit.agents import llm
from livekit.plugins import openai
from typing import Optional
import asyncio
# Define a function to be called by the LLM
from livekit.agents.llm import USE_DOCSTRING

@llm.ai_callable(description=USE_DOCSTRING)
async def get_weather(location: str, unit: Optional[str] = "celsius") -> str:
    """Get the weather for a specific location.
    
    Args:
        location: The city or location to get weather for
        unit: Temperature unit (celsius or fahrenheit)
    """
    # Mock implementation
    return f"The weather in {location} is 22°{unit[0].upper()}"





async def test_llm_function_calls():
    llm_instance = openai.LLM()
    
    # Create function context
    fnc_ctx = llm.FunctionContext()
    fnc_ctx.register_function(get_weather)
    
    # Create chat context
    chat_ctx = llm.ChatContext()
    chat_ctx.append(
        role="user",
        text="What's the weather like in Paris?"
    )
    
    # Get response stream with function context
    response_stream = llm_instance.chat(
        chat_ctx=chat_ctx,
        fnc_ctx=fnc_ctx
    )
    
    async for chunk in response_stream:
        if chunk.choices[0].delta.content:
            print(chunk.choices[0].delta.content, end="", flush=True)
        elif chunk.choices[0].delta.tool_calls:
            # Handle function calls
            for tool_call in chunk.choices[0].delta.tool_calls:
                print(f"\nFunction called: {tool_call.function_info.name}")
                print(f"Arguments: {tool_call.arguments}")
                
                # Execute the function
                called_function = tool_call.execute()
                result = await called_function.task
                print(f"Function result: {result}")

# Run with:
asyncio.run(test_llm_function_calls())