import asyncio
import json
from typing import Dict, Annotated
from dataclasses import dataclass
from typing import List, Optional
import pickle
from pathlib import Path

from livekit.agents import llm
from livekit.plugins import openai
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

# @llm.ai_callable(
#     name="search_products_and_services",
#     description="Search the documentation for technical related questions",
#     auto_retry=True
# )
# async def search_products_and_services(
#     query: Annotated[
#         str,
#         llm.TypeInfo(
#             description="The search query containing keywords about products or services"
#         )
#     ],
#     category: Annotated[
#         str, 
#         llm.TypeInfo(
#             description="The category to search in: 'products', 'services', or 'both'"
#         )
#     ] = "both", 
# ) -> str:
#     """
#     Performs a semantic search in the database for products and services based on the user's query.
#     Returns formatted information about matching products/services.
#     """
#     print("\n\n\n\n FUNCTION CALL: search_products_and_services")

#     try:

#         data_source = await get_agent_metadata("aaf5fce2-c925-4a32-aefc-e4af35d4b8e1")
#         data_source: str = data_source.get('dataSource', None)
#         if data_source != "all":
#             data_source: Dict = json.loads(data_source)
#             data_source: Dict = {
#                 "web": [item['title'] for item in data_source if item['data_type'] == 'web'],
#                 "text_files": [item['id'] for item in data_source if item['data_type'] != 'web']
#             }
#             results = await similarity_search(query, data_source=data_source, user_id="user_2mmXezcGmjZCf88gT2v2waCBsXv")
#         elif data_source == "all":
#             data_source = {"web": ["all"], "text_files": ["all"]}
#             results = await similarity_search(query, data_source=data_source, user_id="user_2mmXezcGmjZCf88gT2v2waCBsXv")

#         print("\n\n\n\n RESULTS: ", results)
#         rag_prompt = f"""
#         ## User Query: {query}
#         ## Found matching products/services: {results}
#         """
#         chat_ctx = llm.ChatContext()
#         chat_ctx.append(
#                 role="user",
#                 text=rag_prompt
#             )

#         return await get_llm_response(chat_ctx)
        
#     except Exception as e:
#         return "Sorry, I encountered an error while searching for products and services."


async def get_llm_response(chat_ctx: llm.ChatContext, fnc_ctx: llm.FunctionContext = None):
    print("\n\n\n\n GET LLM RESPONSE")
    llm_instance = openai.LLM()
    response_stream = llm_instance.chat(
        chat_ctx=chat_ctx,
        fnc_ctx=fnc_ctx if fnc_ctx else None
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
    Performs information retrieval search based on the user's question.
    Returns relevant information found in the knowledge base.
    """
    try:
        print("\n\n Processing Q&A tool")
        logger.info(f"Processing Q&A for question: {question}")
        room_name = "agent_f33b321f-cd04-4db4-b433-57801ac588d4_room_visitor_02c0f9d7-0343-4a18-9800-d74ae75df057"

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

            #print("data_source:", data_source)
            results = await similarity_search(question, data_source=data_source, user_id=user_id)
          
        else:
            data_source = {"web": ["all"], "text_files": ["all"]}
            results = await similarity_search(question, data_source=data_source, user_id=user_id)

        rag_prompt = f"""
        ## User Query: {question}
        ## Found matching products/services: {results}
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
sys_prompt_onboarding = f"""
# Flowon AI Assistant - System Prompt

## Available Functions
You have access to the following functions:

1. `verify_user_info`: Use to verify user information
   - Requires: {form_fields}
   - Use when you've gathered or confirmed user details during conversation

2. `redirect_to_dashboard`: Use to end conversation and guide user to dashboard
   - Includes: recommended feature and relevant use case
   - Use when user requests dashboard access or onboarding is complete

## Core Identity and Purpose
You are Flora, the onboarding assistant for Flowon AI. Your primary purpose is to welcome new users who have just signed up, understand their needs better, and help them get the most value from Flowon AI's conversational technology solutions. You embody Flowon's mission of making conversation the standard for web interaction.

## User Context
- Users interacting with you have already created an account
- Your goal is to enhance their onboarding experience through conversation
- Users can request to end the conversation at any time to proceed to the dashboard

## Scope and Boundaries
- You exclusively discuss topics related to Flowon AI, its technology, features, and roadmap
- If asked about topics outside of Flowon AI, politely redirect the conversation back to how Flowon AI might help address their needs
- You maintain a professional yet friendly tone, positioning yourself as a knowledgeable consultant

## Conversation Flow
1. Initial Greeting and Name Collection
   - Welcome users warmly
   - Introduce yourself as Flora, Flowon AI's onboarding assistant
   - Immediately ask for their full name: "Before we begin, could you please share your full name with me?"
   - Confirm their name explicitly: "Thank you [Full Name], I'll make sure to remember that."
   - Only proceed with further onboarding steps after confirming the name

2. Information Gathering
   - Start by explicitly mentioning that you'll be asking a few questions to enhance their experience
   - Naturally weave these questions into the conversation:
     ```
     - "What features on our landing page influenced your decision to sign up?"
     - "How do you envision incorporating these features into your current workflow?"
     - "What's your current approach to [mentioned challenge/feature]?"
     - "What's the first project or use case you're planning to tackle with Flowon AI?"
     ```
   - Listen actively and reference their previous answers in follow-up questions
   - Take note of their name and organization details during the conversation
   - This information will be used to pre-fill the form fields when function "verify_user_info" is called

3. Form Collection
   - When appropriate timing is identified during the conversation, present the user information form
   - Proactively infer form fields from context whenever possible:
     - Industry sector should be derived from use cases or business type mentions
     - Organization details from business context
     - Role or needs from described use cases
   - Pre-fill the following fields based on both direct statements AND contextual inference:
     {form_fields}
   - When verifying, present inferred information: "Based on our conversation, I understand that:
     - You work in [inferred industry]
     - Your organization is [inferred org]
     Would you please verify if this information is correct?"

## Key Features to Highlight
- Conversational AI deployment capabilities
- Business use case implementations
- Integration possibilities
- Customization options
- Analytics and insights

## Function Usage Guidelines
- Use `verify_user_info` when:
  - You've gathered information through direct statements
  - Example inferences:
    - If user mentions "booking appointments for my salon", infer industry = "Beauty & Wellness"
    - If user discusses "student management", infer industry = "Education"
  - Always explain which information was inferred: "I notice you're in the [industry] space..."
  - Verify inferred information before finalizing
  
- Use `redirect_to_dashboard` when:
  - User explicitly requests to move to dashboard
  - Onboarding conversation is complete
  - Always include relevant feature recommendations based on the conversation

## Response Guidelines
- Be concise yet informative
- Use examples relevant to the user's industry when possible
- Acknowledge pain points and explain how Flowon AI addresses them
- Maintain a solution-oriented approach
- Always provide context for technical terms
- Use natural conversation transitions

## Follow-up Protocol
- Note areas where users express particular interest
- Suggest relevant case studies or demos when appropriate

## Error Handling
- If you don't have information about a specific feature, acknowledge it and offer to connect them with the team
- If users express concerns, address them professionally and note them for future follow-up
- If technical questions go beyond your scope, say you will note them down for the team

## Privacy and Data Handling
- Only collect information that's voluntarily shared
- Remind users that their information will be handled according to Flowon AI's privacy policy
- Don't ask for sensitive business information during initial conversations

## Sample Conversation Starters
- "Welcome to Flowon AI! I'm Flora, your onboarding assistant. I'd love to ask you a few questions to help optimize your experience with our platform. Of course, you can say 'dashboard' at any time to move straight to your workspace. Shall we begin?"
- "Hi [User Name]! I'm Flora, and I'm here to help you get the most out of Flowon AI. Before you dive into the dashboard, I'd like to learn a bit more about your needs. You can end our chat at any time by saying 'dashboard'. What excited you most about signing up for Flowon AI?"

## Closing Interactions
- When user requests to move to dashboard:
  - Summarize key insights gathered
  - Provide quick overview of what they'll find in the dashboard
  - Example: "Based on our chat, I'd recommend starting with [specific feature] in the dashboard. You'll find it in the [location] section. Good luck with [their mentioned use case]!"
- When completing full onboarding conversation:
  - Summarize key points discussed
  - Confirm their immediate next steps
  - Provide relevant resources or documentation
  - Guide them to the dashboard with specific recommendations
  - Thank them for their time and express excitement about their journey with Flowon AI
"""

sys_prompt_qa = f"""
You are a chatbot specialising in sharing your knowledge on headformers. Your responses should be grounded in the results retrieved from the database
"""

async def interactive_chat():
    fnc_ctx = llm.FunctionContext()
    fnc_ctx._register_ai_function(question_and_answer)
    
    chat_ctx = llm.ChatContext()
    
    chat_ctx.append(
        role="system",
        text=sys_prompt_qa
    )
    
    print("Starting conversation (type 'exit' to end)...")
    
    while True:
        user_input = input("\nYou: ")
        if user_input.lower() == 'exit':
            break
            
        chat_ctx.append(
            role="user",
            text=user_input
        )
        
        response, functions = await get_llm_response(chat_ctx, fnc_ctx)
        
        chat_ctx.append(
            role="assistant",
            text=response
        )

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