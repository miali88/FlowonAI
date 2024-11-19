import asyncio
import json
from typing import Dict, Annotated
from dataclasses import dataclass
from typing import List, Optional
import pickle
from pathlib import Path

from livekit.agents import llm
from livekit.plugins import openai, anthropic
from livekit.agents.llm import USE_DOCSTRING
from services.cache import get_agent_metadata

from services.chat.chat import similarity_search

import logging
logger = logging.getLogger(__name__)

@dataclass
class ChatScenario:
    name: str
    description: str
    messages: List[dict]
    expected_function_calls: List[str] = None
    actual_function_calls: List[str] = None

class ChatTester:
    def __init__(self, scenarios_dir: str = "chat_scenarios"):
        self.scenarios_dir = Path(scenarios_dir)
        self.scenarios_dir.mkdir(exist_ok=True)
        self.current_scenario = None
    
    def save_scenario(self, scenario: ChatScenario):
        with open(self.scenarios_dir / f"{scenario.name}.pkl", "wb") as f:
            pickle.dump(scenario, f)
    
    def load_scenario(self, name: str) -> Optional[ChatScenario]:
        try:
            with open(self.scenarios_dir / f"{name}.pkl", "rb") as f:
                return pickle.dump(f)
        except FileNotFoundError:
            return None

async def get_llm_response(chat_ctx: llm.ChatContext, fnc_ctx: llm.FunctionContext = None):
    print("\n\n\n\n GET LLM RESPONSE")
    llm_instance = openai.LLM()
    response_stream = llm_instance.chat(
        chat_ctx=chat_ctx,
        fnc_ctx=fnc_ctx if fnc_ctx else None,
    )

    full_response = ""
    function_calls = []  # Track function calls
    
    async for chunk in response_stream:
        if chunk.choices[0].delta.content is not None:
            content = chunk.choices[0].delta.content
            print(content, end="", flush=True)
            full_response += content
        elif chunk.choices[0].delta.tool_calls:
            for tool_call in chunk.choices[0].delta.tool_calls:
                function_calls.append(tool_call.function_info.name)
                print(f"\nFunction called: {tool_call.function_info.name}")
                print(f"Arguments: {tool_call.arguments}")
                
                called_function = tool_call.execute()
                result = await called_function.task
                print(f"Function result: {result}")
                full_response += f"\nFunction result: {result}"
    
    return full_response, function_calls


@llm.ai_callable(
    name="question_and_answer",
    description="Extract user's question and perform information retrieval search to provide relevant answers",
    auto_retry=True
)
async def question_and_answer(
    question: Annotated[
        str,
        llm.TypeInfo(
            description="The user's question that needs to be answered"
        )
    ]
) -> str:
    """
    Takes the user's question and performs information retrieval search based on the user's question.
    Returns relevant information found in the knowledge base.
    """
    try:
        print("\n\n Processing Q&A tool")
        logger.info(f"Processing Q&A for question: {question}")
        room_name = "agent_ae1d8dc1-ef3a-4b94-98d3-d78f0a4ad494_room_visitor_02c0f9d7-0343-4a18-9800-d74ae75df057"

        agent_id = room_name.split('_')[1]  # Extract agent_id from room name
        agent_metadata: Dict = await get_agent_metadata(agent_id)

        user_id: str = agent_metadata['userId']
        data_source: str = agent_metadata.get('dataSource', None)
        
        if data_source != "all":
            data_source: Dict = json.loads(data_source)
            data_source: Dict = {
                "web": [item['title'] for item in data_source if item['data_type'] == 'web'],
                "text_files": [item['id'] for item in data_source if item['data_type'] != 'web']
            }

            print("data_source:", data_source)
            results = await similarity_search(question, data_source=data_source, user_id=user_id)
          
        else:
            data_source = {"web": ["all"], "text_files": ["all"]}
            results = await similarity_search(question, data_source=data_source, user_id=user_id)

        rag_prompt = f"""
        ## User Query: {question}
        ## Results: {results}
        """

        chat_ctx = llm.ChatContext()
        chat_ctx.append(
            role="user",
            text=rag_prompt
                    )

        return await get_llm_response(chat_ctx)


    except Exception as e:
        logger.error(f"Error in question_and_answer: {str(e)}", exc_info=True)
        return "I apologize, but I encountered an error while searching for an answer to your question."

form_fields = ['full name', 'organization', 'industry sector']
sys_prompt_onboarding = f"""You are a helpful AI assistant focused on onboarding new users.
Your goal is to collect user information including {', '.join(form_fields)}.
Be friendly and professional while gathering this information."""

sys_prompt_qa = f"""You are a helpful AI assistant focused on answering questions accurately.
When a user asks a question, you will:
1. Use the question_and_answer function to search for relevant information
2. Provide clear, concise answers based on the search results
3. If you're unsure about something, admit it and explain what you do know"""

async def lk_chat_process(message: str, agent_id: str) -> str:
    """
    Process a chat message using LiveKit's LLM functionality.
    Returns the AI's response while maintaining streaming capability.
    """
    try:
        # Set up function context for available AI functions
        fnc_ctx = llm.FunctionContext()
        fnc_ctx._register_ai_function(question_and_answer)
        
        # Create chat context
        chat_ctx = llm.ChatContext()
        chat_ctx.append(
            role="system",
            text=sys_prompt_qa
        )
        
        # Add user message
        chat_ctx.append(
            role="user",
            text=message
        )
        
        # Get response using existing streaming function
        response, function_calls = await get_llm_response(chat_ctx, fnc_ctx)
        
        return response

    except Exception as e:
        logger.error(f"Error in lk_chat_process: {str(e)}", exc_info=True)
        raise Exception("Failed to process chat message")

async def test_scenario(scenario: ChatScenario):
    fnc_ctx = llm.FunctionContext()
    fnc_ctx._register_ai_function(question_and_answer)
    # fnc_ctx._register_ai_function(verify_user_info)
    # fnc_ctx._register_ai_function(redirect_to_dashboard)
    
    chat_ctx = llm.ChatContext()
    chat_ctx.append(role="system", text=sys_prompt_onboarding)
    
    actual_function_calls = []
    
    for message in scenario.messages:
        chat_ctx.append(role=message["role"], text=message["content"])
        if message["role"] == "user":
            response, functions_called = await get_llm_response(chat_ctx, fnc_ctx)
            actual_function_calls.extend(functions_called)
            chat_ctx.append(role="assistant", text=response)
    
    scenario.actual_function_calls = actual_function_calls
    return scenario

# Example usage in main:
async def run_tests():
    tester = ChatTester()
    
    # Create a test scenario
    scenario = ChatScenario(
        name="onboarding_flow",
        description="Test basic onboarding flow with form collection",
        messages=[
            {"role": "user", "content": "Hi, I'm interested in using Flowon AI"},
            {"role": "user", "content": "I work at Acme Corp in the tech sector"},
            {"role": "user", "content": "Yes, you can collect my information"},
        ],
        expected_function_calls=["verify_user_info"]
    )
    
    # Run the scenario
    result = await test_scenario(scenario)
    
    # Compare expected vs actual function calls
    print(f"\nScenario: {result.name}")
    print(f"Expected function calls: {result.expected_function_calls}")
    print(f"Actual function calls: {result.actual_function_calls}")
    
    # Save for future reference
    tester.save_scenario(result)

# Replace the test function with the interactive chat
if __name__ == "__main__":
    asyncio.run(interactive_chat())
    asyncio.run(run_tests())

# Make sure this function is defined before any usage
__all__ = ['lk_chat_process']  # This explicitly declares what should be exported