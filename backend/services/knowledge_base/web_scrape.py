import asyncio, logging, aiohttp, os
from typing import List, Dict, Any, Optional
from urllib.parse import urlparse
from datetime import datetime, timedelta

from dotenv import load_dotenv
from requests.exceptions import RequestException
from tiktoken import encoding_for_model
from fastapi import HTTPException
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, SemaphoreDispatcher, RateLimiter, BrowserConfig
from crawl4ai.markdown_generation_strategy import DefaultMarkdownGenerator
from tenacity import retry, stop_after_attempt, wait_exponential

from services.supabase.client import get_supabase

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

JINA_API_KEY = os.getenv('JINA_API_KEY')

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

async def count_tokens(text: str, model: str = "gpt-4o") -> int:
    logger.debug("Counting tokens with model gpt-4o")
    encoder = encoding_for_model(model)
    tokens = encoder.encode(text)
    return len(tokens)

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

async def insert_to_db(data: Dict[str, Any]) -> None:
    try:
        supabase = await get_supabase()
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

        # Insert into user_web_data - now properly awaited
        web_data_result = await supabase.table('user_web_data').insert(main_data).execute()
        
        if not web_data_result.data:
            raise Exception("Failed to insert into user_web_data")
            
        logger.info(f"Successfully inserted data into user_web_data for URL: {main_data['url']}")

        # Insert into user_web_data_headers - now properly awaited
        headers_result = await supabase.table('user_web_data_headers').insert(headers_data).execute()
        
        if not headers_result.data:
            raise Exception("Failed to insert into user_web_data_headers")
            
        logger.info(f"Successfully inserted data into user_web_data_headers for URL: {headers_data['url']}")

    except Exception as e:
        logger.error(f"Database insertion error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to insert data: {str(e)}"
        )

@retry(
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=1, min=4, max=20)
)
async def scrape_with_retry(url: str) -> Dict[str, Any]:
    logger.info(f"Scraping URL: {url}")
    
    # Add rate limiting check
    if not await scrape_limiter.acquire():
        wait_info = await scrape_limiter.get_remaining()
        logger.info(f"Rate limit reached. Remaining: {wait_info['remaining']}, Reset at: {wait_info['reset_time']}")
        await asyncio.sleep(60)  # Wait for the next window
        
    try:
        run_cfg = CrawlerRunConfig(
            markdown_generator=DefaultMarkdownGenerator()
        )
        browser_config=BrowserConfig(
            browser_type="chromium",
            headless=True,
            extra_args=["--disable-gpu"]
        )
        async with AsyncWebCrawler(config=browser_config) as crawler:
            result = await crawler.arun(url=url, config=run_cfg)
            
            # Convert CrawlResult to dictionary with expected structure
            return {
                'content': result.markdown if isinstance(result.markdown, str) 
                    else result.markdown.text if result.markdown 
                    else result.cleaned_html,
                'metadata': result.metadata or {},
                'success': result.success,
                'error_message': result.error_message
            }
            
    except RequestException as e:
        logger.error(f"HTTP error while scraping {url}: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error while scraping {url}: {str(e)}")
        raise

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
        response = await scrape_with_retry(
            site
        )

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
            logger.warning(f"KeyError occurred for site {site}: Missing description")
            header = "## Title: " + response['metadata']['title']

        chunks = await sliding_window_chunking(content)
        results = []

        async def process_chunk(chunk: str) -> Dict[str, Any]:
            sb_insert = {
                "url": site,
                "header": header,
                "content": chunk,
                "token_count": 0,
                "jina_embedding": "",
                "user_id": user_id,
                "root_url": root_url
            }
            logger.info(f"sb_insert url: {sb_insert['url']}")

            chunk_text = header + chunk
            jina_response = await get_embedding(chunk_text)
            sb_insert['jina_embedding'] = jina_response['data'][0]['embedding']
            sb_insert['token_count'] = jina_response['usage']['total_tokens']

            await insert_to_db(sb_insert)
            return sb_insert

        chunk_tasks = [process_chunk(chunk) for chunk in chunks]
        results = await asyncio.gather(*chunk_tasks, return_exceptions=True)

        return [r for r in results if isinstance(r, dict)]

    except Exception as e:
        logger.error(f"Error processing site {site}: {str(e)}", exc_info=True)
        return None

async def scrape_url(
    urls: List[str], 
    user_id: Optional[str] = None
) -> Dict[str, str]:
    logger.info(f"URLs to scrape at {datetime.now()}: {urls}")
    parsed_url = urlparse(urls[0])
    root_url = f"{parsed_url.scheme}://{parsed_url.netloc}"

    tasks = [process_single_url(site, user_id, root_url) for site in urls]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    flat_results = []
    for result in results:
        if isinstance(result, list):
            flat_results.extend(result)

    logger.info("Scraping completed")
    return {"message": "Scraping completed"}

async def map_url(url: str) -> List[str]:
    logger.info(f"Starting URL mapping for: {url}")
    
    # Add rate limiting check
    if not await crawl_limiter.acquire():
        wait_info = await crawl_limiter.get_remaining()
        logger.info(f"Rate limit reached. Remaining: {wait_info['remaining']}, Reset at: {wait_info['reset_time']}")
        raise HTTPException(
            status_code=429,
            detail="Rate limit reached. Please try again later."
        )
        
    try:
        # Configure the crawler with specific options
        run_cfg = CrawlerRunConfig(
            markdown_generator=DefaultMarkdownGenerator(),
            follow_links=True,  # Enable following links
            max_depth=2,  # Limit crawl depth
            ignore_robots_txt=True  # Skip robots.txt check
        )
        
        browser_config = BrowserConfig(
            browser_type="chromium",
            headless=True,
            extra_args=[
                "--disable-gpu",
                "--no-sandbox",
                "--disable-dev-shm-usage"
            ]
        )
        
        # Configure the dispatcher with rate limiting
        dispatcher = SemaphoreDispatcher(
            max_session_permit=MAX_PAGES,
            rate_limiter=RateLimiter(
                requests_per_second=2  # Limit to 2 requests per second
            )
        )
        
        logger.info("Initializing crawler...")
        
        async with AsyncWebCrawler(
            config=browser_config
        ) as crawler:
            logger.info("Crawler started successfully")
            
            try:
                result = await crawler.arun(
                    url=url,
                    config=run_cfg,
                    dispatcher=dispatcher
                )
            except Exception as crawler_error:
                logger.error(f"Crawler execution error: {str(crawler_error)}")
                raise HTTPException(
                    status_code=400,
                    detail=f"Failed to crawl URL: {str(crawler_error)}"
                )
            
            if result.success:
                # Extract URLs from the links dictionary
                all_urls = set()  # Use set to avoid duplicates
                if result.links:
                    for link_type, links in result.links.items():
                        for link in links:
                            if 'href' in link:
                                href = link['href']
                                # Only include URLs from the same domain
                                parsed_url = urlparse(url)
                                parsed_href = urlparse(href)
                                if parsed_href.netloc == parsed_url.netloc:
                                    all_urls.add(href)
                
                logger.info(f"Successfully mapped URL. Found {len(all_urls)} unique URLs")
                return list(all_urls)
            else:
                error_msg = f"Failed to map URL {url}: {result.error_message}"
                logger.error(error_msg)
                raise HTTPException(
                    status_code=400,
                    detail=error_msg
                )
                
    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"Error mapping URL {url}: {str(e)}"
        logger.error(error_msg)
        raise HTTPException(
            status_code=500,
            detail=error_msg
        )