import logging
from dotenv import load_dotenv
from itertools import groupby
from operator import itemgetter
from typing import List, Dict, Tuple
from supabase import create_client, Client
from openai import AsyncOpenAI
from app.core.config import settings

load_dotenv()

openai = AsyncOpenAI()
supabase: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_SERVICE_ROLE_KEY
)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


async def get_kb_items(current_user: str) -> Tuple[List[Dict], int]:
    kb_tables = ["user_web_data", "user_text_files"]
    logger.info(f"Fetching items for user: {current_user}")
    all_items = []
    total_tokens: int = 0

    for table in kb_tables:
        if table == "user_web_data":
            results = (
                supabase.table(table)
                .select('*')
                .eq('user_id', current_user)
                .limit(100000)
                .execute()
            )

            grouped: List[Dict] = group_by_root_url(results.data)
            all_items.extend(grouped)
            total_tokens += sum(item.get('token_count', 0) for item in results.data)

        elif table == "user_text_files":
            items = (
                supabase.table(table)
                .select('*')
                .eq('user_id', current_user)
                .limit(100000)
                .execute()
            )

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
            total_tokens += sum(item.get('token_count', 0) for item in items.data)

    return all_items, total_tokens


async def get_kb_headers(current_user: str) -> Tuple[List[Dict], int]:
    kb_tables = ["user_web_data_headers", "user_text_files_headers"]
    logger.info(f"Fetching items for user: {current_user}")
    all_items = []
    total_tokens: int = 0

    for table in kb_tables:
        if table == "user_web_data_headers":
            results = (
                supabase.table(table)
                .select('*')
                .eq('user_id', current_user)
                .limit(100000)
                .execute()
            )

            grouped: List[Dict] = group_by_root_url(results.data)
            all_items.extend(grouped)
            total_tokens += sum(item.get('token_count', 0) or 0 for item in results.data)

        elif table == "user_text_files_headers":
            items = (
                supabase.table(table)
                .select('*')
                .eq('user_id', current_user)
                .limit(100000)
                .execute()
            )

            formatted_items = [
                {
                    'id': item['parent_id'],
                    'title': item.get('heading', 'No Title'),
                    'data_type': item.get('data_type'),
                    'tag': item.get('tag', ''),
                    'token_count': item.get('token_count', 0) or 0
                }
                for item in items.data
            ]
            all_items.extend(formatted_items)
            total_tokens += sum(item.get('token_count', 0) or 0 for item in items.data)

    return all_items, total_tokens


def group_by_root_url(items: List[Dict]) -> List[Dict]:
    if not isinstance(items, list):
        raise TypeError(f"Expected a list, got {type(items)}")

    # Sort items by root_url
    sorted_items = sorted(items, key=itemgetter('root_url'))
    id_item = 0

    # Group items and create consolidated records
    result = []
    for root_url, group in groupby(sorted_items, key=itemgetter('root_url')):
        id_item += 1
        group_list = list(group)

        # Create consolidated record
        consolidated = {
            'id': id_item,
            'title': root_url,
            'root_url': root_url,
            'content': [
                {
                    'url': item.get('url', ''),
                    'id': item['id'],
                    'token_count': item.get('token_count', 0)
                } for item in group_list
            ],
            'url_tokens': sum(item.get('token_count', 0) for item in group_list),
            'created_at': next(iter(group_list)).get('created_at', ''),
            'data_type': 'web',
            'user_id': group_list[0].get('user_id')
        }
        result.append(consolidated)

    return result
