import asyncio

import logging
from typing import List
from dotenv import load_dotenv

from tiktoken import encoding_for_model

import spacy
from firecrawl import FirecrawlApp
from supabase import create_client, Client
from openai import AsyncOpenAI

from app.core.config import settings

load_dotenv()

openai = AsyncOpenAI()

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


async def get_kb_items(current_user):
    kb_tables = ["user_web_data", "user_text_files"]
    print(f"Fetching items for user: {current_user}")
    all_items = []
    seen_titles = set()  # To keep track of unique titles

    total_tokens: int = 0

    for table in kb_tables:
        if table == "user_web_data":
            results = supabase.table(table) \
                              .select('*') \
                              .eq('user_id', current_user) \
                              .execute()
            
            formatted_items = [
                {
                    'id': item['id'],
                    'title': item.get('url', 'No Title'),
                    'root_url': item.get('root_url', ''),
                    'content': 'Content not available',
                    'user_id': current_user,
                    'data_type': 'web',
                    'created_at': item.get('created_at', ''),
                    'token_count': item.get('token_count', 0)
                }
                for item in results.data
            ]
            all_items.extend(formatted_items)
            total_tokens += sum(item.get('token_count', 0) for item in results.data)

        elif table == "user_text_files":
            items = supabase.table(table).select('*').eq('user_id', current_user).execute()
            formatted_items = [
                {
                    'id': item['id'],
                    'title': item.get('heading', 'No Title'),
                    'content': item.get('content', ''),
                    'user_id': current_user,
                    'data_type': item.get('data_type'),
                    'tag': item.get('tag', '')
                }
                for item in items.data
            ]
            all_items.extend(formatted_items)
            total_tokens += sum(item.get('token_count', 0) for item in results.data)


    return all_items, total_tokens
