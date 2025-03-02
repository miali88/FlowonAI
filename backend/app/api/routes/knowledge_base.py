from typing import Optional, List, Dict, Any, Union, Tuple
from pydantic import BaseModel, Field
import json, logging
import tiktoken
from datetime import datetime
from uuid import UUID

from fastapi import Request, HTTPException, Depends, Header, APIRouter, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi import File, UploadFile

from services.supabase.client import get_supabase
from services.knowledge_base import file_processing
from services.knowledge_base.vectorise_data import kb_item_to_chunks
from services.knowledge_base.kb import get_kb_items, get_kb_headers
from services.knowledge_base.web_scrape import map_url, scrape_url
from app.core.auth import get_current_user


# Set up logging with timestamps
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# Create a custom formatter with timestamps
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# Add a StreamHandler with the custom formatter
stream_handler = logging.StreamHandler()
stream_handler.setFormatter(formatter)
logger.addHandler(stream_handler)

router = APIRouter()

# Model for web content url items
class WebContentItem(BaseModel):
    url: str
    id: Union[int, UUID]
    token_count: Optional[int] = 0

# Base models for different data types
class BaseKnowledgeItem(BaseModel):
    id: Union[int, UUID]
    created_at: Optional[datetime] = None
    user_id: str
    token_count: Optional[int] = None
    data_type: Optional[str] = None
    title: str
    
class TextFileItem(BaseKnowledgeItem):
    heading: Optional[str] = None
    content: str
    file_name: Optional[str] = None
    tag: Optional[str] = None

class WebDataItem(BaseKnowledgeItem):
    header: Optional[str] = None
    content: List[WebContentItem]  # Changed from string to List[WebContentItem]
    root_url: Optional[str] = None
    url_tokens: Optional[int] = None
    user_name: Optional[str] = None
    tag: Optional[str] = None
    rag_query: Optional[str] = None

# Request models
class KnowledgeBaseItemCreate(BaseModel):
    title: str
    content: str
    user_id: str
    data_type: Optional[str] = "text"
    token_count: Optional[int] = None
    file_name: Optional[str] = None
    tag: Optional[str] = None

class WebDataItemCreate(BaseModel):
    url: str
    content: str
    user_id: str
    header: Optional[str] = None
    token_count: Optional[int] = None
    user_name: Optional[str] = None
    root_url: Optional[str] = None
    tag: Optional[str] = None

class ScrapeUrlRequest(BaseModel):
    url: str

class DeleteItemRequest(BaseModel):
    data_type: str

class TokenCalculationRequest(BaseModel):
    content: str

# Response models
class KnowledgeBaseItemResponse(BaseModel):
    id: Union[int, UUID]
    title: str
    content: Union[str, List[WebContentItem]]  # Updated to handle both text and web content
    token_count: Optional[int] = None
    user_id: str
    data_type: Optional[str] = None
    created_at: Optional[datetime] = None

# Model validator to handle mixed item types
class KnowledgeBaseItem(BaseModel):
    id: Union[int, UUID]
    title: str
    content: Union[str, List[WebContentItem]]  # Can be either string or list of web content
    user_id: str
    token_count: Optional[int] = None
    url_tokens: Optional[int] = None
    data_type: Optional[str] = None
    root_url: Optional[str] = None
    created_at: Optional[datetime] = None
    tag: Optional[str] = None

class KnowledgeBaseItemsResponse(BaseModel):
    items: List[KnowledgeBaseItem]  # Using a single model that can handle both types
    total_tokens: int

class KnowledgeBaseHeadersResponse(BaseModel):
    items: List[Dict[str, Any]]
    total_tokens: int

class MessageResponse(BaseModel):
    message: str
    data: Optional[Dict[str, Any]] = None

class TokenCountResponse(BaseModel):
    token_count: int

class UserResponse(BaseModel):
    id: str
    email: Optional[str] = None
    # Add other user fields as needed

@router.post("/upload_file", response_model=MessageResponse)
async def upload_file_handler(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user)
):
    try:
        # Process, store and schedule chunking
        new_item = await file_processing.process_and_store_file(
            file=file,
            user_id=current_user,
            background_tasks=background_tasks
        )

        return MessageResponse(
            message="File processed and added to knowledge base successfully",
            data=new_item
        )
    except Exception as e:
        logger.error(f"Error processing file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@router.get("/", response_model=KnowledgeBaseItemsResponse)
async def get_items_handler(current_user: str = Depends(get_current_user)):
    try:
        items, total_tokens = await get_kb_items(current_user)
        
        # Ensure total_tokens is an integer, default to 0 if None
        total_tokens = total_tokens or 0
        
        # Validate each item (remove this in production)
        for i, item in enumerate(items):
            logger.debug(f"Item {i} structure: {json.dumps(item, default=str)}")
        
        return KnowledgeBaseItemsResponse(
            items=items,
            total_tokens=total_tokens
        )
    except Exception as e:
        logger.error(f"Error fetching items: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/", response_model=MessageResponse)
async def create_item_handler(request: Request, 
                            background_tasks: BackgroundTasks,
                            ):
    logger.debug("Received POST request to /knowledge_base")
    raw_body = await request.body()
    logger.debug(f"Raw request body: {raw_body.decode()}")
    headers = dict(request.headers)
    logger.debug(f"Request headers: {json.dumps(headers, indent=2)}")

    try:
        supabase = await get_supabase()

        data = await request.json()
        logger.debug(f"Parsed request data: {json.dumps(data, indent=2)}")

        # Determine which table to use based on data type
        data_type = data.get('data_type', 'text')  # Default to 'text' if not specified
        print("\n\n\n data_type:", data_type)
        table_name = 'user_web_data' if data_type == 'web' else 'user_text_files'
        
        # Insert the data into the appropriate Supabase table
        new_item = await supabase.table(table_name).insert(data).execute()
        logger.info(f"New item created in {table_name}: {json.dumps(new_item.data[0], indent=2)}")

        # Schedule the kb_item_to_chunks function to run in the background
        background_tasks.add_task(kb_item_to_chunks, 
            new_item.data[0]['id'], 
            new_item.data[0]['content'],
            new_item.data[0]['user_id'],
        )

        return MessageResponse(
            message="Item created successfully", 
            data=new_item.data[0]
        )
    except json.JSONDecodeError as e:
        logger.error(f"Error decoding JSON: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid JSON data")
    except Exception as e:
        logger.error(f"Error creating item: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/{item_id}", response_model=MessageResponse)
async def delete_item_handler(
    item_id: int, 
    request: Request, 
    current_user: str = Depends(get_current_user)
):
    try:
        supabase = await get_supabase()

        # Get the request body
        body = await request.json()
        data_type = body.get('data_type')
        logger.info(f"Deleting item {item_id} with data_type: {data_type}")

        try:
            if data_type == 'web':
                # Delete from user_web_data if data_type is web
                result = await supabase.table('user_web_data').delete().eq('id', item_id).eq('user_id', current_user).execute()
            else:
                # Delete from user_text_files for all other data types
                result = await supabase.table('user_text_files').delete().eq('id', item_id).eq('user_id', current_user).execute()
            
            if len(result.data) == 0:
                raise HTTPException(status_code=404, detail="Item not found or not authorized to delete")
                
            return MessageResponse(message="Item deleted successfully")
            
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

@router.get("/headers", response_model=KnowledgeBaseHeadersResponse)
async def get_items_headers_handler(current_user: str = Depends(get_current_user)):
    try:
        items, total_tokens = await get_kb_headers(current_user)
        # Ensure total_tokens is an integer, default to 0 if None
        total_tokens = total_tokens or 0
        
        return KnowledgeBaseHeadersResponse(
            items=items,
            total_tokens=total_tokens
        )
    except Exception as e:
        logger.error(f"Error fetching items: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/scrape_web", response_model=MessageResponse)
async def scrape_url_handler(
    request: Request, 
    background_tasks: BackgroundTasks,
    current_user: str = Depends(get_current_user)
):
    try:
        request_data = await request.json()
        request_data: List[str] = request_data.get('urls')
        urls = request_data if isinstance(request_data, list) else [request_data]
        
        # Schedule scraping to run in the background
        background_tasks.add_task(scrape_url, urls, current_user)
        
        return MessageResponse(
            message="Scraping started in background", 
            data={"urls_count": len(urls)}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing URLs: {str(e)}")

@router.post("/crawl_url", response_model=List[str])
async def crawl_url_handler(request: ScrapeUrlRequest, current_user: str = Depends(get_current_user)):
    try:
        map_result: List[str] = await map_url(request.url)
        return map_result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error crawling URL: {str(e)}")

@router.post("/calculate_tokens", response_model=TokenCountResponse)
async def calculate_tokens_handler(request: TokenCalculationRequest, current_user: str = Depends(get_current_user)):
    try:
        token_count = num_tokens_from_string(request.content, "cl100k_base")
        return TokenCountResponse(token_count=token_count)
    except Exception as e:
        logger.error(f"Error calculating tokens: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/users", response_model=UserResponse)
async def user_info(current_user: str = Depends(get_current_user)):
    try:
        supabase = await get_supabase()

        user_info = await supabase.table('users').select('*').eq('id', current_user).execute()
        if not user_info.data:
            raise HTTPException(status_code=404, detail="User not found")
        return user_info.data[0]
    except Exception as e:
        logger.error(f"Error fetching user info: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error fetching user info: {str(e)}")

def num_tokens_from_string(string: str, encoding_name: str) -> int:
    """Returns the number of tokens in a text string."""
    encoding = tiktoken.get_encoding(encoding_name)
    num_tokens = len(encoding.encode(string))
    return num_tokens
