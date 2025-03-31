from itertools import groupby
from operator import itemgetter
from typing import List, Dict, Tuple
from openai import AsyncOpenAI
from app.core.logging_setup import logger
from app.clients.supabase_client import get_supabase

openai = AsyncOpenAI()

async def get_kb_items(
    current_user: str,
    page_size: int = 1000,
    page: int = 0
) -> Tuple[List[Dict], int, int]:
    """
    Fetch KB items with pagination.
    Returns: (items, total_tokens, total_count)
    """
    supabase = await get_supabase()
    kb_tables = ["user_web_data", "user_text_files"]
    logger.info(f"Fetching items for user: {current_user}, page: {page}")
    all_items = []
    total_tokens: int = 0
    total_count: int = 0

    for table in kb_tables:
        offset = page * page_size
        logger.info(f"Processing table: {table}")
        
        if table == "user_web_data":
            results = (
                supabase.table(table)
                .select('*', count='exact')
                .eq('user_id', current_user)
                .range(offset, offset + page_size - 1)
                .execute()
            )
            logger.info(f"Found {len(results.data)} records in {table}")
            total_count += results.count or 0

            grouped: List[Dict] = group_by_root_url(results.data)
            logger.info(f"After grouping: {len(grouped)} unique root_urls")
            all_items.extend(grouped)
            total_tokens += sum(item.get('token_count', 0) or 0 for item in results.data)

        elif table == "user_text_files":
            items = (
                supabase.table(table)
                .select('*', count='exact')
                .eq('user_id', current_user)
                .range(offset, offset + page_size - 1)
                .execute()
            )
            total_count += items.count or 0

            formatted_items = [
                {
                    'id': item['id'],
                    'title': item.get('heading', 'No Title'),
                    'content': item.get('content', ''),
                    'user_id': current_user,
                    'data_type': item.get('data_type'),
                    'tag': item.get('tag', ''),
                    'token_count': item.get('token_count', 0) or 0
                }
                for item in items.data
            ]
            all_items.extend(formatted_items)
            total_tokens += sum(item.get('token_count', 0) or 0 for item in items.data)

    logger.info(f"Retrieved {len(all_items)} total items")
    return all_items, total_tokens


async def get_kb_headers(current_user: str) -> Tuple[List[Dict], int]:
    supabase = await get_supabase()
    kb_tables = ["user_web_data_headers", "user_text_files_headers"]
    logger.info(f"Fetching KB headers for user: {current_user}")
    all_items = []
    total_tokens: int = 0
    
    for table in kb_tables:
        page = 0
        limit = 1000
        table_items = []
        
        logger.info(f"Processing table: {table}")
        
        while True:
            offset = page * limit
            
            if table == "user_web_data_headers":
                results = (
                    supabase.table(table)
                    .select('*')
                    .eq('user_id', current_user)
                    .range(offset, offset + limit - 1)
                    .execute()
                )
                
                if not results.data:
                    break
                
                table_items.extend(results.data)
                total_tokens += sum(item.get('token_count', 0) or 0 for item in results.data)
                
            elif table == "user_text_files_headers":
                items = (
                    supabase.table(table)
                    .select('*')
                    .eq('user_id', current_user)
                    .range(offset, offset + limit - 1)
                    .execute()
                )
                
                if not items.data:
                    break
                
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
                table_items.extend(formatted_items)
                total_tokens += sum(item.get('token_count', 0) or 0 for item in items.data)
            
            current_batch = len(results.data if table == "user_web_data_headers" else items.data)
            if current_batch < limit:
                break
                
            page += 1
            
        logger.info(f"Retrieved {len(table_items)} items from {table}")
        
        if table == "user_web_data_headers":
            grouped: List[Dict] = group_by_root_url(table_items)
            all_items.extend(grouped)
        else:
            all_items.extend(table_items)

    logger.info(f"Retrieved {len(all_items)} total items")
    return all_items, total_tokens


def group_by_root_url(items: List[Dict]) -> List[Dict]:
    if not isinstance(items, list):
        logger.error(f"Invalid input type: {type(items)}")
        raise TypeError(f"Expected a list, got {type(items)}")

    sorted_items = sorted(items, key=itemgetter('root_url'))
    id_item = 0
    result = []
    
    for root_url, group in groupby(sorted_items, key=itemgetter('root_url')):
        id_item += 1
        group_list = list(group)
        
        consolidated = {
            'id': id_item,
            'title': root_url,
            'root_url': root_url,
            'content': [
                {
                    'url': item.get('url', ''),
                    'id': item['id'],
                    'token_count': item.get('token_count', 0) or 0
                } for item in group_list
            ],
            'url_tokens': sum(item.get('token_count', 0) or 0 for item in group_list),
            'created_at': next(iter(group_list)).get('created_at', ''),
            'data_type': 'web',
            'user_id': group_list[0].get('user_id')
        }
        result.append(consolidated)

    return result
