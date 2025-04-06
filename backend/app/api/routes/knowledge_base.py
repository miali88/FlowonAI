from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel
import json
from app.core.logging_setup import logger
import tiktoken
from datetime import datetime
from uuid import UUID

from fastapi import Request, HTTPException, Depends, APIRouter, BackgroundTasks
from fastapi import File, UploadFile

from app.services.knowledge_base import knowledge_base
from app.core.auth import get_current_user

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
        new_item = await knowledge_base.process_and_store_file(
            file=file,
            user_id=current_user,
            background_tasks=background_tasks
        )

        return MessageResponse(
            message="File processed and added to knowledge base successfully",
            data=new_item
        )
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise e
    except Exception as e:
        logger.error(f"Error processing file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@router.get("/", response_model=KnowledgeBaseItemsResponse)
async def get_items_handler(current_user: str = Depends(get_current_user)):
    try:
        items, total_tokens = await knowledge_base.get_knowledge_base_items(current_user)
        
        return KnowledgeBaseItemsResponse(
            items=items,
            total_tokens=total_tokens
        )
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise e
    except Exception as e:
        logger.error(f"Error fetching items: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/", response_model=MessageResponse)
async def create_item_handler(
    request: Request, 
    background_tasks: BackgroundTasks,
    current_user: str = Depends(get_current_user)
):
    logger.debug("Received POST request to /knowledge_base")
    raw_body = await request.body()
    logger.debug(f"Raw request body: {raw_body.decode()}")
    headers = dict(request.headers)
    logger.debug(f"Request headers: {json.dumps(headers, indent=2)}")

    try:
        data = await request.json()
        logger.debug(f"Parsed request data: {json.dumps(data, indent=2)}")
        
        # Add user_id to data if not present
        if 'user_id' not in data:
            data['user_id'] = current_user
            
        new_item = await knowledge_base.create_knowledge_base_item(data, background_tasks)

        return MessageResponse(
            message="Item created successfully", 
            data=new_item
        )
    except json.JSONDecodeError as e:
        logger.error(f"Error decoding JSON: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid JSON data")
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise e
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
        # Get the request body
        body = await request.json()
        data_type = body.get('data_type')
        logger.info(f"Deleting item {item_id} with data_type: {data_type}")

        await knowledge_base.delete_knowledge_base_item(item_id, data_type, current_user)
                
        return MessageResponse(message="Item deleted successfully")
            
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise e
    except Exception as e:
        # Log and raise request parsing errors
        logger.error(f"Error parsing delete request: {str(e)}")
        raise HTTPException(status_code=400, detail="Error parsing delete request")

@router.get("/headers", response_model=KnowledgeBaseHeadersResponse)
async def get_items_headers_handler(current_user: str = Depends(get_current_user)):
    try:
        items, total_tokens = await knowledge_base.get_knowledge_base_headers(current_user)
        
        return KnowledgeBaseHeadersResponse(
            items=items,
            total_tokens=total_tokens
        )
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise e
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
        
        result = await knowledge_base.start_web_scraping(urls, current_user)
        
        return MessageResponse(
            message=result["message"], 
            data={"urls_count": result["urls_count"]}
        )
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise e
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing URLs: {str(e)}")

@router.post("/crawl_url", response_model=List[str])
async def crawl_url_handler(request: ScrapeUrlRequest, current_user: str = Depends(get_current_user)):
    try:
        map_result: List[str] = await knowledge_base.crawl_website(request.url)
        return map_result
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise e
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error crawling URL: {str(e)}")

@router.post("/calculate_tokens", response_model=TokenCountResponse)
async def calculate_tokens_handler(request: TokenCalculationRequest, current_user: str = Depends(get_current_user)):
    try:
        token_count = knowledge_base.calculate_tokens(request.content)
        return TokenCountResponse(token_count=token_count)
    except Exception as e:
        logger.error(f"Error calculating tokens: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/users", response_model=UserResponse)
async def user_info(current_user: str = Depends(get_current_user)):
    try:
        user_info = await knowledge_base.get_user_info(current_user)
        return user_info
    except Exception as e:
        logger.error(f"Error fetching user info: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error fetching user info: {str(e)}")

@router.post("/scrape_for_setup", response_model=MessageResponse)
async def scrape_for_setup_handler(
    request: Request, 
    background_tasks: BackgroundTasks,
    current_user: str = Depends(get_current_user)
):
    """
    Scrape a website for guided setup and agent training.
    This endpoint is specifically designed for the guided setup flow.
    """
    try:
        request_data = await request.json()
        website_url = request_data.get('website_url')
        
        result = await knowledge_base.scrape_for_setup(website_url, current_user, background_tasks)
        
        return MessageResponse(
            message="Website scraping started in background", 
            data=result
        )
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise e
    except Exception as e:
        logger.error(f"Error in scrape_for_setup: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error scraping website: {str(e)}")

def num_tokens_from_string(string: str, encoding_name: str) -> int:
    """Returns the number of tokens in a text string."""
    encoding = tiktoken.get_encoding(encoding_name)
    num_tokens = len(encoding.encode(string))
    return num_tokens
