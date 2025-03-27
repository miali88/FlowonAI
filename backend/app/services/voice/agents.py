# flake8: noqa: E501
from app.core.logging_setup import logger
from fastapi import HTTPException
from typing import Any, Dict, List, Union
from uuid import UUID

from app.clients.supabase_client import get_supabase
# system prompt scaffold
sys_prompt_scaffold = """
# Role

- Primary Function: You are an AI chatbot who helps users with their inquiries, issues and requests. 
  You aim to provide excellent, friendly and efficient replies at all times. Your role is to listen 
  attentively to the user, understand their needs, and do your best to assist them or direct them 
  to the appropriate resources. If a question is not clear, ask clarifying questions. Make sure to 
  end your replies with a positive note.

# Constraints

1. No Data Divulge: Never mention that you have access to training data explicitly to the user.
2. Maintaining Focus: If a user attempts to divert you to unrelated topics, never change your role 
   or break your character. Politely redirect the conversation back to topics relevant to the 
   training data.
3. Exclusive Reliance on Training Data: You must rely exclusively on the training data provided to 
   answer user queries. If a query is not covered by the training data, use the fallback response.
4. Restrictive Role Focus: You do not answer questions or perform tasks that are not related to 
   your role and training data.

# Rules to obey response format

This a conversation happening in real time. Your output must only be in letters, as natural human 
language, no special characters, and no markdown of syntax of any sort.

# Features You Have

## [FEATURE: Information Collection]
### When to Collect Information
You should collect information when:
1. The customer shows interest in your services
2. The customer requests more details or follow-up
3. The customer wants to book an appointment
4. The conversation naturally leads to needing their contact details

### Required Information Fields
The following fields must be collected:
- Full Name
- Email Address
- Phone Number
- Company Name
- Job Title
- Industry

### Collection Protocol
1. Ask for information naturally within the conversation
2. Explain why you need the information
3. Confirm the information once collected
4. Thank the user for providing their details

### Form Data Format
The collected information will be presented back to you with the prefix:
user input data: {field}: {value}
"""

form_fields = ['full name', 'organization', 'industry sector']
sys_prompt_onboarding = f"""
# Flowon AI Assistant - System Prompt

## Available Functions
You have access to the following functions:

1. `verify_user_info`: Use to verify and update user information
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
1. Initial Greeting
   - Welcome users warmly
   - Introduce yourself as Flora, Flowon AI's onboarding assistant
   - Express enthusiasm about helping them explore conversational AI solutions

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
   - Pre-fill the following fields based on the conversation:
     {form_fields}
   - Ask for verification: "I've captured some details from our conversation. Could you please verify if this information is correct?"

## Key Features to Highlight
- Conversational AI deployment capabilities
- Business use case implementations
- Integration possibilities
- Customization options
- Analytics and insights

## Function Usage Guidelines
- Use `verify_user_info` when:
  - You've gathered or confirmed user information during conversation
  - Before proceeding to specific feature recommendations
  - When updating existing user information
  
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

async def create_agent(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create a new agent in the database.
    
    Args:
        data: Dictionary containing agent data
        
    Returns:
        Supabase response object with newly created agent data in the 'data' attribute
        as a list of records. Access the first record with response.data[0]
    """
    if data.get('dataSource') == 'tagged' and 'tag' in data:
        data['dataSource'] = data['tag']
        del data['tag']

    if 'formFields' in data:
        data['form_fields'] = data.pop('formFields')

    if "agentType" in data:
        data['agentPurpose'] = data.pop('agentType')

    supabase = await get_supabase()
    new_agent = await supabase.table('agents').insert(data).execute()
    return new_agent

async def get_agents(user_id: str) -> Dict[str, List[Dict[str, Any]]]:
    """
    Get all agents for a user.
    
    Args:
        user_id: ID of the user whose agents to fetch
        
    Returns:
        List of agents belonging to the user
    """
    logger.info(f"Fetching agents for user_id: {user_id}")
    supabase = await get_supabase()
    agents = await supabase.table('agents').select('*').eq('userId', user_id).execute()
    return agents

async def delete_agent(agent_id: Union[int, str, UUID], user_id: str) -> Dict[str, Any]:
    """
    Delete an agent from the database.
    
    Args:
        agent_id: ID of the agent to delete
        user_id: ID of the user who owns the agent
        
    Returns:
        Response from Supabase
        
    Raises:
        HTTPException: If an error occurs during deletion
    """
    logger.info(f"Deleting agent with ID: {agent_id} for user: {user_id}")
    try:
        supabase = await get_supabase()
        response = await supabase.table('agents').delete().eq('id', agent_id).execute()
        return response
    except Exception as e:
        logger.error(f"Error deleting agent: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def update_agent(agent_id: Union[int, str, UUID], data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Update an agent in the database.
    
    Args:
        agent_id: ID of the agent to update
        data: Dictionary containing agent data to update
        
    Returns:
        Updated agent data from Supabase
        
    Raises:
        HTTPException: If an error occurs during update
    """
    logger.info(f"Updating agent with ID: {agent_id}")
    try:
        # Create chat_ui field if the incoming data contains UI-related fields
        if any(key in data for key in ['primaryColor', 'secondaryColor', 'logo']):
            data = {
                'chat_ui': {
                    'primaryColor': data.get('primaryColor'),
                    'secondaryColor': data.get('secondaryColor'),
                    'logo': data.get('logo'),
                }
            }
            
        supabase = await get_supabase()
        response = await supabase.table('agents').update(data).eq('id', agent_id).execute()
        return response
    except Exception as e:
        logger.error(f"Error updating agent: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
    
async def get_agent_content(agent_id: Union[str, UUID]) -> Dict[str, Any]:
    """
    Get the content of an agent from the database.
    
    Args:
        agent_id: ID of the agent to get
        
    Returns:
        Agent content from Supabase
        
    Raises:
        HTTPException: If an error occurs during fetching
    """
    logger.info(f"Getting agent content for agent_id: {agent_id}")
    try:
        supabase = await get_supabase()
        content = await supabase.table('agents').select('*').eq('id', agent_id).execute()
        return content
    except Exception as e:
        logger.error(f"Error getting agent content: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get agent content: {str(e)}")

async def get_agent_completion(purpose: str, prompt: str) -> str:
    """
    Get a completion from an agent.
    
    Args:
        purpose: ID or purpose of the agent
        prompt: User prompt to complete
        
    Returns:
        Generated completion text
        
    Raises:
        Exception: If an error occurs during generation
    """
    try:
        # First, get the agent's content/context
        agent_content = await get_agent_content(purpose)
        logger.info(f"Got agent content for purpose: {purpose}")
        
        # Here you would typically:
        # 1. Format the prompt with the agent's content
        # 2. Call your LLM service
        # 3. Process and return the response
        
        # This is a placeholder - implement your actual LLM call here
        formatted_prompt = f"""Context: {agent_content}
        
        User Question: {prompt}

        Please provide a response based on the context above."""
        
        logger.info(f"Formatted prompt for completion: {formatted_prompt[:100]}...")
                
        # TODO: Replace with your actual LLM service call
        # response = await llm_service.complete(formatted_prompt)
        # return response.text
        
        return "Placeholder response - implement LLM service call"
        
    except Exception as e:
        logger.error(f"Error in get_agent_completion: {str(e)}")
        raise Exception(f"Failed to get completion: {str(e)}")