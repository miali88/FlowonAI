from typing import Dict

from composio import ComposioToolSet, App
from composio_openai import ComposioToolSet, Action
from openai import OpenAI

import logging

logger = logging.getLogger(__name__)


async def get_calendar_slots(user_id: str, app: str):
    entity_id = user_id
    toolset = ComposioToolSet(entity_id=entity_id)
    entity = toolset.get_entity()
    request = entity.initiate_connection(app)




async def get_notion_database(database_name: str) -> Dict:
    try:
        # Initialize clients
        openai_client = OpenAI()
        composio_toolset = ComposioToolSet(entity_id="Jessica")  # You might want to make this dynamic

        # Search for the database
        tools = composio_toolset.get_tools(actions=[Action.NOTION_SEARCH_NOTION_PAGE])
        
        search_response = openai_client.chat.completions.create(
            model="gpt-4o",
            tools=tools,
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": f"Search for a database called {database_name} in my Notion workspace"},
            ],
        )
        search_result = composio_toolset.handle_tool_calls(search_response)
        
        # Extract database ID
        db_id = search_result[0]['data']['response_data']['results'][0]['id']
        
        # Query the database contents
        tools = composio_toolset.get_tools(actions=[Action.NOTION_QUERY_DATABASE])
        
        query_response = openai_client.chat.completions.create(
            model="gpt-4o",
            tools=tools,
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": f"Get the contents of the database with ID {db_id}"},
            ],
        )
        query_result = composio_toolset.handle_tool_calls(query_response)
        
        return {
            "database_id": db_id,
            "contents": query_result
        }
        
    except Exception as e:
