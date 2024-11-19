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
from services.voice.tool_use import AgentFunctions
from services.voice.livekit_services import get_agent

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

        return f"Based on the search results: {results}"

    except Exception as e:
        logger.error(f"Error in question_and_answer: {str(e)}", exc_info=True)
        return "I apologize, but I encountered an error while searching for an answer to your question."


async def lk_chat_process(message: str, agent_id: str):
    try:
        # Fetch agent configuration
        agent = await get_agent(agent_id)
        if not agent:
            raise ValueError(f"Agent {agent_id} not found")

        # Initialize function context
        fnc_ctx = llm.FunctionContext()
        fnc_ctx._register_ai_function(question_and_answer)
        
        # Create chat context with agent-specific instructions
        chat_ctx = llm.ChatContext()
        chat_ctx.append(
            role="system",
            text=agent['instructions']  # Use agent-specific instructions
        )
        
        chat_ctx.append(
            role="user",
            text=message
        )
        
        # Get streaming response using agent-specific configuration
        llm_instance = openai.LLM(
            model="gpt-4o",
        )
        
        response_stream = llm_instance.chat(
            chat_ctx=chat_ctx,
            fnc_ctx=fnc_ctx
        )
        
        async for chunk in response_stream:
            print(chunk)
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
            elif chunk.choices[0].delta.tool_calls:
                for tool_call in chunk.choices[0].delta.tool_calls:
                    called_function = tool_call.execute()
                    result = await called_function.task
                    yield f"\nFunction result: {result}"

    except Exception as e:
        logger.error(f"Error in lk_chat_process: {str(e)}", exc_info=True)
        raise Exception("Failed to process chat message")
