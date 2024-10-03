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

    total_tokens = 0

    for table in kb_tables:
        if table == "user_web_data":
            results = supabase.table("user_web_data") \
                              .select('*') \
                              .eq('user_id', current_user) \
                              .execute()
            
            # Map 'url' to 'title' and provide a 'content' placeholder if appropriate
            for item in results.data:
                title = item.get('url', 'No Title')
                if title not in seen_titles:
                    seen_titles.add(title)
                    all_items.append({
                        'id': item['id'],
                        'title': title,
                        'content': 'Content not available',  # Adjust as needed
                        'user_id': current_user,
                        'data_type': 'web'
                    })
                total_tokens += (item.get('token_count', 0))

        elif table == "user_text_files":
            items = supabase.table(table).select('*').eq('user_id', current_user).execute()
            formatted_items = [
                {
                    'id': item['id'],
                    'title': item.get('heading', 'No Title'),
                    'content': item.get('content', ''),
                    'user_id': current_user,
                    'data_type': item.get('data_type')
                }
                for item in items.data
            ]
            all_items.extend(formatted_items)
            total_tokens += (item.get('token_count', 0))

    return all_items
