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


async def get_kb_items(
    current_user: str,
    page_size: int = 1000,
    page: int = 0
) -> Tuple[List[Dict], int, int]:
    """
    Fetch KB items with pagination.
    Returns: (items, total_tokens, total_count)
    """
    kb_tables = ["user_web_data", "user_text_files"]
    logger.info(f"Fetching items for user: {current_user}, page: {page}")
    all_items = []
    total_tokens: int = 0
    total_count: int = 0

    for table in kb_tables:
        offset = page * page_size
        logger.info(f"Processing table: {table} with offset: {offset}, page_size: {page_size}")
        
        if table == "user_web_data":
            results = (
                supabase.table(table)
                .select('*', count='exact')
                .eq('user_id', current_user)
                .range(offset, offset + page_size - 1)
                .execute()
            )
            logger.info(f"Found {len(results.data)} records in {table}")
            logger.debug(f"Raw results from {table}: {results.data}")
            total_count += results.count or 0

            grouped: List[Dict] = group_by_root_url(results.data)
            logger.info(f"After grouping: {len(grouped)} unique root_urls")
            all_items.extend(grouped)
            total_tokens += sum(item.get('token_count', 0) for item in results.data)

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
                    'token_count': item.get('token_count', 0)
                }
                for item in items.data
            ]
            all_items.extend(formatted_items)
            total_tokens += sum(item.get('token_count', 0) for item in items.data)

    logger.info(f"Returning {len(all_items)} total items with {total_tokens} tokens")
    return all_items, total_tokens


async def get_kb_headers(current_user: str) -> Tuple[List[Dict], int]:
    kb_tables = ["user_web_data_headers", "user_text_files_headers"]
    logger.info(f"Starting to fetch KB headers for user: {current_user}")
    all_items = []
    total_tokens: int = 0
    
    for table in kb_tables:
        page = 0
        limit = 1000  # Max allowed by Supabase
        table_items = []
        
        logger.info(f"Processing table: {table}")
        
        while True:
            offset = page * limit
            logger.debug(f"Fetching page {page} (offset: {offset}) from {table}")
            
            if table == "user_web_data_headers":
                results = (
                    supabase.table(table)
                    .select('*')
                    .eq('user_id', current_user)
                    .range(offset, offset + limit - 1)
                    .execute()
                )
                
                if not results.data:
                    logger.debug(f"No more data in {table}")
                    break
                
                logger.debug(f"Retrieved {len(results.data)} records from {table}")
                table_items.extend(results.data)
                current_tokens = sum(item.get('token_count', 0) or 0 for item in results.data)
                total_tokens += current_tokens
                logger.debug(f"Added {current_tokens} tokens from this batch")
                
            elif table == "user_text_files_headers":
                items = (
                    supabase.table(table)
                    .select('*')
                    .eq('user_id', current_user)
                    .range(offset, offset + limit - 1)
                    .execute()
                )
                
                if not items.data:
                    logger.debug(f"No more data in {table}")
                    break
                
                logger.debug(f"Retrieved {len(items.data)} records from {table}")
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
                current_tokens = sum(item.get('token_count', 0) or 0 for item in items.data)
                total_tokens += current_tokens
                logger.debug(f"Added {current_tokens} tokens from this batch")
            
            # Break if we got less than the limit (last page)
            current_batch = len(results.data if table == "user_web_data_headers" else items.data)
            if current_batch < limit:
                logger.debug(f"Retrieved less than limit ({current_batch} < {limit}). This was the last page.")
                break
                
            page += 1
            
        # After collecting all items for the table
        logger.info(f"Finished collecting all items from {table}. Total items: {len(table_items)}")
        
        if table == "user_web_data_headers":
            logger.debug("Grouping web data by root URL")
            grouped: List[Dict] = group_by_root_url(table_items)
            all_items.extend(grouped)
            logger.debug(f"Added {len(grouped)} grouped items to results")
        else:
            all_items.extend(table_items)
            logger.debug(f"Added {len(table_items)} items to results")

    logger.info(f"Completed fetching all KB headers. Total items: {len(all_items)}, Total tokens: {total_tokens}")
    return all_items, total_tokens


def group_by_root_url(items: List[Dict]) -> List[Dict]:
    logger.info(f"Starting group_by_root_url with {len(items)} items")
    if not isinstance(items, list):
        logger.error(f"Invalid input type: {type(items)}")
        raise TypeError(f"Expected a list, got {type(items)}")

    # Sort items by root_url
    sorted_items = sorted(items, key=itemgetter('root_url'))
    logger.debug(f"Sorted items by root_url: {[item.get('root_url') for item in sorted_items]}")
    id_item = 0

    # Group items and create consolidated records
    result = []
    for root_url, group in groupby(sorted_items, key=itemgetter('root_url')):
        id_item += 1
        group_list = list(group)
        logger.info(f"Processing group for root_url: {root_url} with {len(group_list)} items")
        
        # Log individual URLs in the group
        for item in group_list:
            logger.debug(f"Item in group - URL: {item.get('url')}, ID: {item.get('id')}, Tokens: {item.get('token_count')}")

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
        logger.info(f"Created consolidated record for {root_url} with {len(consolidated['content'])} URLs")
        result.append(consolidated)

    return result
