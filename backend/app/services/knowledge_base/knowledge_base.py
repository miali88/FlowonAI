from typing import Optional, List, Dict, Any, Union, Tuple
from pydantic import BaseModel
import json
from app.core.logging_setup import logger
import tiktoken
from datetime import datetime
from uuid import UUID
from fastapi import BackgroundTasks, UploadFile, HTTPException

from app.clients.supabase_client import get_supabase
from app.services.knowledge_base import file_processing
from app.services.knowledge_base.vectorise_data import kb_item_to_chunks
from app.services.knowledge_base.kb import get_kb_items, get_kb_headers
from app.services.knowledge_base.web_scrape import map_url, scrape_url

# Model for web content url items
class WebContentItem(BaseModel):
    url: str
    id: Union[int, UUID]
    token_count: Optional[int] = 0

async def process_and_store_file(
    file: UploadFile,
    user_id: str,
    background_tasks: BackgroundTasks
) -> Dict[str, Any]:
    """Process, store and schedule chunking for a file"""
    try:
        # Process, store and schedule chunking
        new_item = await file_processing.process_and_store_file(
            file=file,
            user_id=user_id,
            background_tasks=background_tasks
        )
        return new_item
    except Exception as e:
        logger.error(f"Error processing file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

async def get_knowledge_base_items(user_id: str) -> Tuple[List[Dict[str, Any]], int]:
    """Get all knowledge base items for a user"""
    try:
        items, total_tokens = await get_kb_items(user_id)
        
        # Ensure total_tokens is an integer, default to 0 if None
        total_tokens = total_tokens or 0
        
        # Process items to ensure all required fields have valid values
        for item in items:
            # Set default values for any missing required fields
            if item.get('title') is None:
                item['title'] = "Untitled Document"  # Default title for items with NULL title
        

        return items, total_tokens
    except Exception as e:
        logger.error(f"Error fetching items: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

async def get_knowledge_base_headers(user_id: str) -> Tuple[List[Dict[str, Any]], int]:
    """Get headers for all knowledge base items for a user"""
    try:
        items, total_tokens = await get_kb_headers(user_id)
        # Ensure total_tokens is an integer, default to 0 if None
        total_tokens = total_tokens or 0
        
        return items, total_tokens
    except Exception as e:
        logger.error(f"Error fetching items: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def create_knowledge_base_item(data: Dict[str, Any], background_tasks: BackgroundTasks) -> Dict[str, Any]:
    """Create a new knowledge base item"""
    logger.debug("Creating knowledge base item")
    try:
        supabase = await get_supabase()

        # Determine which table to use based on data type
        data_type = data.get('data_type', 'text')  # Default to 'text' if not specified
        table_name = 'user_web_data' if data_type == 'web' else 'user_text_files'
        
        # Insert the data into the appropriate Supabase table
        new_item = await supabase.table(table_name).insert(data).execute()
        logger.info(f"New item created in {table_name}: {json.dumps(new_item.data[0], indent=2)}")

        # Schedule the kb_item_to_chunks function to run in the background
        background_tasks.add_task(kb_item_to_chunks, 
            new_item.data[0]['id'], 
            new_item.data[0]['content'],
            new_item.data[0]['user_id'],
            new_item.data[0]['title']
        )

        return new_item.data[0]
    except Exception as e:
        logger.error(f"Error creating item: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

async def delete_knowledge_base_item(item_id: int, data_type: str, user_id: str) -> None:
    """Delete a knowledge base item"""
    try:
        supabase = await get_supabase()

        try:
            if data_type == 'web':
                # Delete from user_web_data if data_type is web
                result = await supabase.table('user_web_data').delete().eq('id', item_id).eq('user_id', user_id).execute()
            else:
                # Delete from user_text_files for all other data types
                result = await supabase.table('user_text_files').delete().eq('id', item_id).eq('user_id', user_id).execute()
            
            if len(result.data) == 0:
                raise HTTPException(status_code=404, detail="Item not found or not authorized to delete")
                
        except HTTPException as he:
            # Re-raise HTTP exceptions
            raise he
        except Exception as e:
            # Log and raise database/other errors
            logger.error(f"Database error while deleting item: {str(e)}")
            raise HTTPException(status_code=500, detail="Database error while deleting item")
            
    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        # Log and raise request parsing errors
        logger.error(f"Error parsing delete request: {str(e)}")
        raise HTTPException(status_code=400, detail="Error parsing delete request")

async def start_web_scraping(urls: List[str], user_id: str) -> Dict[str, Any]:
    """Start scraping URLs in the background"""
    try:
        # Schedule scraping to run in the background
        await scrape_url(urls, user_id)
        
        return {
            "message": "Scraping started in background", 
            "urls_count": len(urls)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing URLs: {str(e)}")

async def crawl_website(url: str) -> List[str]:
    """Crawl a website and return a list of URLs"""
    try:
        map_result: List[str] = await map_url(url)
        return map_result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error crawling URL: {str(e)}")

def calculate_tokens(content: str, encoding_name: str = "cl100k_base") -> int:
    """Calculate the number of tokens in a text string"""
    encoding = tiktoken.get_encoding(encoding_name)
    num_tokens = len(encoding.encode(content))
    return num_tokens

async def get_user_info(user_id: str) -> Dict[str, Any]:
    """Get user information from Supabase"""
    try:
        supabase = await get_supabase()
        user_info = await supabase.table('users').select('*').eq('id', user_id).execute()
        if not user_info.data:
            raise HTTPException(status_code=404, detail="User not found")
        return user_info.data[0]
    except Exception as e:
        logger.error(f"Error fetching user info: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error fetching user info: {str(e)}")

async def scrape_for_setup(website_url: str, user_id: str, background_tasks: BackgroundTasks) -> Dict[str, Any]:
    """
    Scrape a website for guided setup and agent training.
    This function is specifically designed for the guided setup flow.
    """
    try:
        if not website_url:
            raise HTTPException(status_code=400, detail="website_url is required")
        
        # Use the existing crawl_website function to get URLs
        urls = await crawl_website(website_url)
        
        # Remove duplicates from the URL list
        unique_urls = list(dict.fromkeys(urls))
        logger.info(f"Found {len(urls)} URLs, {len(unique_urls)} unique URLs")
        
        # Limit to 50 unique URLs
        urls_to_scrape = unique_urls[:50]
        
        # Process URLs in batches of 10 to optimize memory usage
        batch_size = 7
        for i in range(0, len(urls_to_scrape), batch_size):
            batch = urls_to_scrape[i:i+batch_size]
            # Schedule each batch to run in the background
            background_tasks.add_task(start_web_scraping, batch, user_id)
        
        return {
            "website_url": website_url,
            "urls_found": len(urls),
            "unique_urls": len(unique_urls),
            "urls_to_scrape": len(urls_to_scrape),
            "batches": (len(urls_to_scrape) + batch_size - 1) // batch_size
        }
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise e
    except Exception as e:
        logger.error(f"Error in scrape_for_setup: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error scraping website: {str(e)}") 