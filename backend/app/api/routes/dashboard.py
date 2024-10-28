from typing import Optional, List
from pydantic import BaseModel
import json, logging, os
from dotenv import load_dotenv


from fastapi import Request, HTTPException, Depends, Header, APIRouter, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi import File, UploadFile

from supabase import create_client, Client
import tiktoken

from app.core.config import settings
from services.knowledge_base import file_processing
from services.dashboard import kb_item_to_chunks
from services.knowledge_base.kb import get_kb_items
from services.knowledge_base.web_scrape import map_url

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

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

class KnowledgeBaseItem(BaseModel):
    id: int
    title: str
    content: Optional[str]
    url: Optional[str] = None      # Add 'url' if applicable
    token_count: Optional[int] = None
    user_id: str
    data_type: Optional[str] = None

class KnowledgeBaseItemCreate(BaseModel):
    title: str
    content: str
    user_id: str

class ScrapeUrlRequest(BaseModel):
    url: str

async def get_current_user(x_user_id: str = Header(...)):
    logger.info("Authenticating user")
    #logger.debug(f"Authorization header: {authorization}")
    logger.debug(f"x_user_id header: {x_user_id}")
    
    # if not authorization or not authorization.startswith('Bearer '):
    #     logger.error("Invalid or missing token")
    #     raise HTTPException(status_code=401, detail="Invalid or missing token")
    
    # Here you would typically validate the token with Clerk
    # For now, we'll just return the user ID from the header
    logger.info(f"User authenticated: {x_user_id}")
    return x_user_id

@router.post("/upload_file")
async def upload_file_handler(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    authorization: str = Header(...),
    x_user_id: str = Header(..., alias="X-User-ID")
):
    try:
        logger.info(f"Received file: {file.filename}")
        logger.info(f"User ID from header: {x_user_id}")

        # Validate the token (you may want to use your get_current_user function here)
        if not authorization or not authorization.startswith('Bearer '):
            raise HTTPException(status_code=401, detail="Invalid or missing token")

        content = await file_processing.process_file(file)
        logger.info("Finished processing file")

        # Insert the processed content into the knowledge base
        new_item = supabase.table('knowledge_base').insert({
            "title": file.filename,
            "content": content,
            "user_id": x_user_id  # Use the user ID from the header
        }).execute()

        # Schedule the kb_item_to_chunks function to run in the background
        background_tasks.add_task(kb_item_to_chunks, 
        new_item.data[0]['id'], 
        content,
        new_item.data[0]['user_id'])

        return JSONResponse(status_code=200, content={
            "message": "File processed and added to knowledge base successfully",
            "data": new_item.data[0]
        })
    except Exception as e:
        logger.error(f"Error processing file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@router.get("/knowledge_base")
async def get_items_handler(current_user: str = Depends(get_current_user)):
    try:
        items, total_tokens = await get_kb_items(current_user)
        print("\n\ntotal_tokens:", total_tokens)
        return JSONResponse(content={
            "items": items,
            "total_tokens": total_tokens
        })
    except Exception as e:
        logger.error(f"Error fetching items: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/knowledge_base")
async def create_item_handler(request: Request, 
                            background_tasks: BackgroundTasks,
                            ):
    logger.debug("Received POST request to /knowledge_base")
    raw_body = await request.body()
    logger.debug(f"Raw request body: {raw_body.decode()}")
    headers = dict(request.headers)
    logger.debug(f"Request headers: {json.dumps(headers, indent=2)}")

    try:
        data = await request.json()
        logger.debug(f"Parsed request data: {json.dumps(data, indent=2)}")

        # Determine which table to use based on data type
        data_type = data.get('data_type', 'text')  # Default to 'text' if not specified
        print("\n\n\n data_type:", data_type)
        table_name = 'user_web_data' if data_type == 'web' else 'user_text_files'
        
        # Insert the data into the appropriate Supabase table
        new_item = supabase.table(table_name).insert(data).execute()
        logger.info(f"New item created in {table_name}: {json.dumps(new_item.data[0], indent=2)}")

        # Schedule the kb_item_to_chunks function to run in the background
        background_tasks.add_task(kb_item_to_chunks, 
            new_item.data[0]['id'], 
            new_item.data[0]['content'],
            new_item.data[0]['user_id'],
        )

        return JSONResponse(status_code=200, content={"message": "Item created successfully", "data": new_item.data[0]})
    except json.JSONDecodeError as e:
        logger.error(f"Error decoding JSON: {str(e)}")
        return JSONResponse(status_code=400, content={"detail": "Invalid JSON data"})
    except Exception as e:
        logger.error(f"Error creating item: {str(e)}", exc_info=True)
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})

@router.delete("/knowledge_base/{item_id}")
async def delete_item_handler(item_id: int, request: Request, current_user: str = Depends(get_current_user)):
    try:
        # Get the request body
        body = await request.json()
        data_type = body.get('data_type')
        logger.info(f"Deleting item {item_id} with data_type: {data_type}")

        if data_type == 'web':
            # Delete from user_web_data if data_type is web
            result = supabase.table('user_web_data').delete().eq('id', item_id).eq('user_id', current_user).execute()
        else:
            # Delete from user_text_files for all other data types
            result = supabase.table('user_text_files').delete().eq('id', item_id).eq('user_id', current_user).execute()
        
        if len(result.data) == 0:
            raise HTTPException(status_code=404, detail="Item not found or not authorized to delete")
            
        return {"message": "Item deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting item: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/scrape_url")
async def scrape_url_handler(request: ScrapeUrlRequest, current_user: str = Depends(get_current_user)):
    try:

        map_result = await map_url(request.url)
        return {"map_result": map_result}
    
        """ old way, single url scrape"""
        # crawler = FirecrawlApp(api_key=os.getenv("FIRECRAWL_API_KEY"))
        # result = crawler.scrape_url(request.url)

        # # Extract the markdown content from the result
        # markdown_content = result.get('markdown', '')
        
        # # Limit content to a reasonable length (e.g., 5000 characters)
        # markdown_content = markdown_content[:5000] + '...' if len(markdown_content) > 5000 else markdown_content
        
        # return {"content": markdown_content}
    

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error scraping URL: {str(e)}")


@router.post("/crawl_url")
async def crawl_url_handler(request: ScrapeUrlRequest, current_user: str = Depends(get_current_user)):
    try:
        map_result: List[str] = await map_url(request.url)
        return map_result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error crawling URL: {str(e)}")

@router.post("/calculate_tokens")
async def calculate_tokens_handler(request: Request, current_user: str = Depends(get_current_user)):
    try:
        data = await request.json()
        content = data.get('content', '')
        token_count = num_tokens_from_string(content, "cl100k_base")
        return {"token_count": token_count}
    except Exception as e:
        logger.error(f"Error calculating tokens: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

def num_tokens_from_string(string: str, encoding_name: str) -> int:
    """Returns the number of tokens in a text string."""
    encoding = tiktoken.get_encoding(encoding_name)
    num_tokens = len(encoding.encode(string))
    return num_tokens
