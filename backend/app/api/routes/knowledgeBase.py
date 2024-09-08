from fastapi import FastAPI, Request, HTTPException, Depends, Query, Header, APIRouter
from fastapi.middleware.cors import CORSMiddleware
import logging
from fastapi.responses import JSONResponse
from supabase import create_client, Client
from dotenv import load_dotenv
import os 
from typing import List
from pydantic import BaseModel, ValidationError
import json
from firecrawl import FirecrawlApp
import tiktoken
from app.core.config import settings


load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

router = APIRouter()

class KnowledgeBaseItem(BaseModel):
    id: int
    title: str
    content: str
    user_id: str

class KnowledgeBaseItemCreate(BaseModel):
    title: str
    content: str
    user_id: str

class ScrapeUrlRequest(BaseModel):
    url: str

async def get_current_user(authorization: str = Header(...), x_user_id: str = Header(...)):
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Invalid or missing token")
    # Here you would typically validate the token with Clerk
    # For now, we'll just return the user ID from the header
    return x_user_id

@router.get("/knowledge_base", response_model=List[KnowledgeBaseItem])
async def get_items(current_user: str = Depends(get_current_user)):
    try:
        print(f"Fetching items for user: {current_user}")
        items = supabase.table('knowledge_base').select('*').eq('user_id', current_user).execute()
        print('Items loaded:', items)
        return items.data
    except Exception as e:
        logger.error(f"Error fetching items: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/knowledge_base")
async def create_item(request: Request):
    logger.debug("Received POST request to /knowledge_base")
    
    # Log the raw request body
    raw_body = await request.body()
    logger.debug(f"Raw request body: {raw_body.decode()}")
    
    # Log headers
    headers = dict(request.headers)
    logger.debug(f"Request headers: {json.dumps(headers, indent=2)}")

    try:
        # Parse the JSON data from the request body
        data = await request.json()
        logger.debug(f"Parsed request data: {json.dumps(data, indent=2)}")

        # Insert the data into Supabase
        new_item = supabase.table('knowledge_base').insert(data).execute()
        logger.info(f"New item created: {json.dumps(new_item.data[0], indent=2)}")

        # Return a success response
        return JSONResponse(status_code=200, content={"message": "Item created successfully", "data": new_item.data[0]})
    except json.JSONDecodeError as e:
        logger.error(f"Error decoding JSON: {str(e)}")
        return JSONResponse(status_code=400, content={"detail": "Invalid JSON data"})
    except Exception as e:
        logger.error(f"Error creating item: {str(e)}", exc_info=True)
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})

@router.delete("/knowledge_base/{item_id}")
async def delete_item(item_id: int, current_user: str = Depends(get_current_user)):
    try:
        result = supabase.table('knowledge_base').delete().eq('id', item_id).eq('user_id', current_user).execute()
        if len(result.data) == 0:
            raise HTTPException(status_code=404, detail="Item not found or not authorized to delete")
        return {"message": "Item deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting item: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/chat")
async def chat(request: Request, current_user: str = Depends(get_current_user)):
    try:
        data = await request.json()
        message = data.get('message', '')
        # Here you would typically use the user's knowledge base and context to generate a response
        # For now, we'll just return a placeholder response
        return {"response": {"answer": "This is a placeholder response"}}
    except Exception as e:
        logger.error(f"Error in chat: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

def setup_exception_handlers(app: FastAPI):
    @app.exception_handler(ValidationError)
    async def validation_exception_handler(request: Request, exc: ValidationError):
        logger.error(f"Validation error in request: {str(exc)}")
        error_details = [{"loc": err["loc"], "msg": err["msg"], "type": err["type"]} for err in exc.errors()]
        logger.error(f"Validation error details: {json.dumps(error_details, indent=2)}")
        return JSONResponse(status_code=422, content={"detail": error_details})


@router.post("/scrape_url")
async def scrape_url(request: ScrapeUrlRequest, current_user: str = Depends(get_current_user)):
    try:
        crawler = FirecrawlApp(api_key=os.getenv("FIRECRAWL_API_KEY"))
        result = crawler.scrape_url(request.url)

        # Extract the markdown content from the result
        markdown_content = result.get('markdown', '')
        
        # Limit content to a reasonable length (e.g., 5000 characters)
        markdown_content = markdown_content[:5000] + '...' if len(markdown_content) > 5000 else markdown_content
        
        return {"content": markdown_content}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error scraping URL: {str(e)}")

def num_tokens_from_string(string: str, encoding_name: str) -> int:
    """Returns the number of tokens in a text string."""
    encoding = tiktoken.get_encoding(encoding_name)
    num_tokens = len(encoding.encode(string))
    return num_tokens

@router.post("/calculate_tokens")
async def calculate_tokens(request: Request, current_user: str = Depends(get_current_user)):
    try:
        data = await request.json()
        content = data.get('content', '')
        token_count = num_tokens_from_string(content, "cl100k_base")
        return {"token_count": token_count}
    except Exception as e:
        logger.error(f"Error calculating tokens: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
    
@router.get("/")
async def root():
    return {"message": "Welcome to the FastAPI server"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
