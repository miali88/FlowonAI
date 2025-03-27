from typing import List, Dict, Any, Optional
from urllib.parse import urlparse
from datetime import datetime, timedelta
from requests.exceptions import RequestException
import asyncio, aiohttp, os
from dotenv import load_dotenv
from app.core.logging_setup import logger

from tenacity import retry, stop_after_attempt, wait_exponential
from fastapi import HTTPException
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, SemaphoreDispatcher, RateLimiter, BrowserConfig
from crawl4ai.markdown_generation_strategy import DefaultMarkdownGenerator
from tiktoken import encoding_for_model
from supabase import create_client, Client

load_dotenv()

async def count_tokens(text: str, model: str = "gpt-4o") -> int:
    logger.debug("Counting tokens with model gpt-4o")
    encoder = encoding_for_model(model)
    tokens = encoder.encode(text)
    return len(tokens)

JINA_API_KEY = os.getenv('JINA_API_KEY')
async def get_embedding(text: str) -> Dict[str, Any]:
    """ JINA EMBEDDINGS """
    url = 'https://api.jina.ai/v1/embeddings'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {os.getenv("JINA_API_KEY")}'
    }

    data = {
        "model": "jina-embeddings-v3",
        "task": "retrieval.passage",
        "dimensions": 1024,
        "late_chunking": False,
        "embedding_type": "float",
        "input": text
    }

    timeout = aiohttp.ClientTimeout(total=30)  # 30 seconds timeout
    async with aiohttp.ClientSession(timeout=timeout) as session:
        async with session.post(url, headers=headers, json=data) as response:
            return await response.json()

async def sliding_window_chunking(
    text: str, 
    max_window_size: int = 900, 
    overlap: int = 200
) -> List[str]:
    encoder = encoding_for_model("gpt-4o")  # Use the same model as in count_tokens
    tokens = encoder.encode(text)
    chunks = []
    start = 0
    while start < len(tokens):
        end = start + max_window_size
        chunk_tokens = tokens[start:end]
        chunk = encoder.decode(chunk_tokens)
        chunks.append(chunk)
        start += max_window_size - overlap
    return chunks


SUPABASE_URL = os.getenv("SUPABASE_URL")
if not SUPABASE_URL:
    raise ValueError("SUPABASE_URL is not set in the environment variables")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
if not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("SUPABASE_SERVICE_ROLE_KEY is not set in the environment variables")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_KEY")
if not SUPABASE_ANON_KEY:
    raise ValueError("SUPABASE_KEY is not set in the environment variables")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async def insert_to_db(data: Dict[str, Any]) -> None:
    try:
        # Extract headers data
        headers_data = {
            "url": data["url"],
            "header": data["header"],
            "user_id": data["user_id"],
            "root_url": data["root_url"]
        }
        
        # Prepare main data
        main_data = {
            "url": data["url"],
            "header": data["header"],
            "content": data["content"],
            "token_count": data["token_count"],
            "jina_embedding": data["jina_embedding"],
            "user_id": data["user_id"],
            "root_url": data["root_url"]
        }

        # Insert into user_web_data
        web_data_result = await asyncio.to_thread(
            lambda: supabase.table('user_web_data')
                .insert(main_data)
                .execute()
        )
        
        if not web_data_result.data:
            raise Exception("Failed to insert into user_web_data")
            
        logger.info(f"Successfully inserted data into user_web_data for URL: {main_data['url']}")

        # Insert into user_web_data_headers
        headers_result = await asyncio.to_thread(
            lambda: supabase.table('user_web_data_headers')
                .insert(headers_data)
                .execute()
        )
        
        if not headers_result.data:
            raise Exception("Failed to insert into user_web_data_headers")
            
        logger.info(f"Successfully inserted data into user_web_data_headers for URL: {headers_data['url']}")

    except Exception as e:
        logger.error(f"Database insertion error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to insert data: {str(e)}"
        )


# Rate limit constants
SCRAPE_RATE_LIMIT = 20  # per minute
CRAWL_RATE_LIMIT = 3    # per minute
MAX_PAGES = 3000


class RateLimiter:
    def __init__(self, calls_per_minute: int, name: str = "") -> None:
        self.calls_per_minute = calls_per_minute
        self.calls: List[datetime] = []
        self.name = name

    async def acquire(self) -> None:
        now = datetime.now()

        # Clean up old calls
        original_calls = len(self.calls)
        self.calls = [
            call_time for call_time in self.calls
            if now - call_time < timedelta(minutes=1)
        ]
        cleaned_calls = len(self.calls)

        logger.info(
            f"{self.name} Limiter - Current calls in window: "
            f"{len(self.calls)}/{self.calls_per_minute}"
        )

        if cleaned_calls < original_calls:
            logger.info(
                f"{self.name} Limiter - Cleaned up "
                f"{original_calls - cleaned_calls} old calls"
            )

        if len(self.calls) >= self.calls_per_minute:
            wait_time = 60 - (now - self.calls[0]).total_seconds()
            if wait_time > 0:
                logger.info(
                    f"{self.name} Limiter - Rate limit reached. "
                    f"Waiting {wait_time:.2f} seconds"
                )
                await asyncio.sleep(wait_time)

        self.calls.append(now)
        logger.info(
            f"{self.name} Limiter - Added new call. "
            f"Total calls in window: {len(self.calls)}"
        )


# Create named limiters
scrape_limiter = RateLimiter(SCRAPE_RATE_LIMIT, "Scrape")
crawl_limiter = RateLimiter(CRAWL_RATE_LIMIT, "Crawl")


@retry(
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=1, min=4, max=20)
)
async def scrape_with_retry(url: str) -> Dict[str, Any]:
    logger.info(f"Scraping URL: {url}")
    try:
        # Configure browser settings
        browser_config = BrowserConfig(
            browser_type="chromium",
            headless=True,
            extra_args=[
                "--disable-gpu",
                "--disable-dev-shm-usage",
                "--disable-setuid-sandbox",
                "--no-sandbox",
                "--disable-web-security",
                "--disable-features=IsolateOrigins,site-per-process",
                "--disable-site-isolation-trials"
            ],
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Cache-Control': 'max-age=0'
            }
        )
        
        run_cfg = CrawlerRunConfig(
            markdown_generator=DefaultMarkdownGenerator()  # Enable markdown generation
        )
        
        async with AsyncWebCrawler(config=browser_config) as crawler:
            result = await crawler.arun(url=url, config=run_cfg)
            
            # Handle unsuccessful scraping
            if not result.success:
                logger.warning(f"Scraping unsuccessful for {url}: {result.error_message}")
                return {
                    'content': 'Unable to scrape content at this time.',
                    'metadata': {'title': 'Scraping Error', 'description': result.error_message},
                    'success': False,
                    'error_message': result.error_message
                }
            
            # Convert CrawlResult to dictionary with expected structure
            return {
                'content': result.markdown if isinstance(result.markdown, str) 
                    else result.markdown.text if result.markdown 
                    else result.cleaned_html,
                'metadata': result.metadata or {},
                'success': True,
                'error_message': None
            }
            
    except RequestException as e:
        logger.error(f"HTTP error while scraping {url}: {str(e)}")
        return {
            'content': 'Unable to access the website at this time.',
            'metadata': {'title': 'Connection Error', 'description': str(e)},
            'success': False,
            'error_message': f"HTTP error: {str(e)}"
        }
    except Exception as e:
        logger.error(f"Unexpected error while scraping {url}: {str(e)}")
        return {
            'content': 'An unexpected error occurred while processing this website.',
            'metadata': {'title': 'Processing Error', 'description': str(e)},
            'success': False,
            'error_message': f"Unexpected error: {str(e)}"
        }

async def process_single_url(
    site: str, 
    user_id: str, 
    root_url: str
) -> Optional[List[Dict[str, Any]]]:
    logger.info(f"Processing single URL: {site}")
    
    if "screen" in site:
        logger.info(f"Skipping screen {site}")
        return None

    try:
        response = await scrape_with_retry(site)

        # If scraping was unsuccessful, log and return None
        if not response['success']:
            logger.warning(
                f"Failed to scrape {site}: {response['error_message']}"
            )
            return None

        content_list = [
            item for item in response['content'].split('\n\n')
            if not item.startswith('[![]')
        ]
        content = "\n\n".join(content_list)

        try:
            title = response['metadata'].get('title', 'No Title Available')
            description = response['metadata'].get('description', 'No Description Available')
            header = f"## Title: {title} ## Description: {description}"
        except KeyError:
            logger.warning(f"KeyError occurred for site {site}: Missing metadata")
            header = "## Title: No Title Available ## Description: No Description Available"

        # Skip processing if content is empty
        if not content.strip():
            logger.warning(f"Empty content for site {site}")
            return None

        chunks = await sliding_window_chunking(content)
        results = []

        async def process_chunk(chunk: str) -> Optional[Dict[str, Any]]:
            try:
                sb_insert = {
                    "url": site,
                    "header": header,
                    "content": chunk,
                    "token_count": 0,
                    "jina_embedding": "",
                    "user_id": user_id,
                    "root_url": root_url
                }
                logger.info(f"Processing chunk for URL: {sb_insert['url']}")

                chunk_text = header + chunk
                try:
                    jina_response = await get_embedding(chunk_text)
                    sb_insert['jina_embedding'] = jina_response['data'][0]['embedding']
                    sb_insert['token_count'] = jina_response['usage']['total_tokens']
                except Exception as e:
                    logger.error(f"Error getting embedding for {site}: {str(e)}")
                    return None

                await insert_to_db(sb_insert)
                return sb_insert
            except Exception as e:
                logger.error(f"Error processing chunk for {site}: {str(e)}")
                return None

        chunk_tasks = [process_chunk(chunk) for chunk in chunks]
        results = await asyncio.gather(*chunk_tasks, return_exceptions=True)

        # Filter out None results and exceptions
        valid_results = []
        for result in results:
            if isinstance(result, dict):
                valid_results.append(result)
            elif isinstance(result, Exception):
                logger.error(f"Error processing chunk: {str(result)}")

        return valid_results if valid_results else None

    except Exception as e:
        logger.error(f"Error processing site {site}: {str(e)}", exc_info=True)
        return None

async def scrape_url(
    urls: List[str], 
    user_id: Optional[str] = None
) -> Dict[str, Any]:
    logger.info(f"URLs to scrape at {datetime.now()}: {urls}")
    
    if not urls:
        logger.warning("No URLs provided for scraping")
        return {
            "message": "No URLs provided for scraping",
            "success": False,
            "error_count": 0,
            "success_count": 0
        }

    try:
        parsed_url = urlparse(urls[0])
        root_url = f"{parsed_url.scheme}://{parsed_url.netloc}"
    except Exception as e:
        logger.error(f"Error parsing root URL: {str(e)}")
        return {
            "message": f"Error parsing root URL: {str(e)}",
            "success": False,
            "error_count": len(urls),
            "success_count": 0
        }

    tasks = [process_single_url(site, user_id, root_url) for site in urls]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    success_count = 0
    error_count = 0
    errors = []

    for i, result in enumerate(results):
        if isinstance(result, Exception):
            error_count += 1
            logger.error(f"Error processing {urls[i]}: {str(result)}")
            errors.append({"url": urls[i], "error": str(result)})
        elif result is None:
            error_count += 1
            logger.warning(f"No data extracted from {urls[i]}")
        elif isinstance(result, list):
            success_count += 1
            logger.info(f"Successfully processed {urls[i]}")

    status_message = (
        "All URLs processed successfully" if error_count == 0
        else f"Processed with {error_count} errors and {success_count} successes"
    )

    logger.info(f"Scraping completed: {status_message}")
    return {
        "message": status_message,
        "success": error_count == 0,
        "error_count": error_count,
        "success_count": success_count,
        "errors": errors if errors else None
    }

async def map_url(url: str) -> List[str]:
    logger.info(f"Starting URL mapping for: {url}")

    try:
        # Configure the crawler with specific options
        run_cfg = CrawlerRunConfig(
            markdown_generator=DefaultMarkdownGenerator()
        )
        browser_config=BrowserConfig(
            browser_type="chromium",
            headless=True,
            extra_args=["--disable-gpu"]
        )
        # Configure the dispatcher with rate limiting
        dispatcher = SemaphoreDispatcher(
            max_session_permit=MAX_PAGES
        )
        
        logger.info("Initializing crawler...")
        
        async with AsyncWebCrawler(
            config=browser_config
        ) as crawler:
            logger.info("Crawler started successfully")
            
            result = await crawler.arun(
                url=url,
                config=run_cfg,
                dispatcher=dispatcher
            )
            
            if result.success:
                # Extract URLs from the links dictionary
                all_urls = []
                if result.links:
                    for link_type, links in result.links.items():
                        extracted_urls = [link['href'] for link in links if 'href' in link]
                        all_urls.extend(extracted_urls) 
                
                logger.info(f"Successfully mapped URL. Found {len(all_urls)} URLs")
                return all_urls
            else:
                logger.error(f"Failed to map URL {url}: {result.error_message}")
                return []
                
    except Exception as e:
        logger.error(f"Error mapping URL {url}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to map URL: {str(e)}"
        )

async def scrape_url_simple(url: str) -> str:
    """
    Simplified version that just scrapes a single URL and returns the content
    without saving to database or processing embeddings.
    
    Args:
        url: The URL to scrape
        
    Returns:
        The scraped content as a string
    """
    logger.info(f"Simple scraping of URL: {url}")
    
    try:
        # Use the existing scrape_with_retry function
        response = await scrape_with_retry(url)
        
        if not response['success']:
            logger.error(f"Failed to scrape URL {url}: {response.get('error_message', 'Unknown error')}")
            return "Failed to scrape the website."
        
        # Clean up the content
        content_list = [
            item for item in response['content'].split('\n\n')
            if not item.startswith('[![]')
        ]
        content = "\n\n".join(content_list)
        
        # Add metadata if available
        try:
            title = response['metadata'].get('title', 'No Title Available')
            description = response['metadata'].get('description', 'No Description Available')
            header = f"## Title: {title} ## Description: {description}\n\n"
            content = header + content
        except KeyError:
            logger.warning(f"Missing metadata for {url}")
        
        logger.info(f"Successfully scraped URL {url}, content length: {len(content)}")
        return content
        
    except Exception as e:
        logger.error(f"Error in simple scraping of {url}: {str(e)}")
        return f"Error scraping website: {str(e)}"