import logging
from dotenv import load_dotenv
from itertools import groupby
from operator import itemgetter
from typing import List, Dict

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
            
            grouped: List[Dict] = group_by_root_url(results.data)
            
            all_items.extend(grouped)
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
                    'tag': item.get('tag', ''),
                    'token_count': item.get('token_count', 0)
                }
                for item in items.data
            ]
            all_items.extend(formatted_items)
            total_tokens += sum(item.get('token_count', 0) for item in results.data)

    return all_items, total_tokens


def group_by_root_url(items):
    if not isinstance(items, list):
        raise TypeError(f"Expected a list, got {type(items)}")
    
    # Sort items by root_url
    sorted_items = sorted(items, key=itemgetter('root_url'))
    
    # Group items and create consolidated records
    result = []
    for root_url, group in groupby(sorted_items, key=itemgetter('root_url')):
        group_list = list(group)
        
        # Create consolidated record
        consolidated = {
            'title': root_url,  # Using root_url as title
            'root_url': root_url,
            'content': [{  # Group of URLs and their fields
                'url': item.get('url', ''),
                'id': item['id'],
                'token_count': item.get('token_count', 0)
            } for item in group_list],
            'url_tokens': sum(item.get('token_count', 0) for item in group_list),  # Sum of all tokens
            'created_at': next(iter(group_list)).get('created_at', ''),  # Take created_at from first item
            'data_type': 'web',
            'user_id': group_list[0].get('user_id')  # Assuming user_id is consistent within group
        }
        result.append(consolidated)
    
    return result