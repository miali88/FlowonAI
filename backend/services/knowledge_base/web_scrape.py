from typing import List
from urllib.parse import urlparse
import asyncio
from datetime import datetime, timedelta
import logging
import aiohttp
from tenacity import retry, stop_after_attempt, wait_exponential
from requests.exceptions import RequestException
import os
from typing import Optional, Dict, List, Any
from firecrawl import FirecrawlApp # type: ignore
from tiktoken import encoding_for_model
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

FIRECRAWL_API = os.getenv("FIRECRAWL_API_KEY")
app = FirecrawlApp(api_key=FIRECRAWL_API)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def count_tokens(text: str, model: str = "gpt-4o") -> int:
    print("hello, count_tokens")
    encoder = encoding_for_model(model)
    tokens = encoder.encode(text)
    return len(tokens)


async def get_embedding(text: str) -> Any:
    print("hello, get_embedding")
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


async def sliding_window_chunking(text: str, max_window_size: int = 900, overlap: int = 200) -> List[str]:
    print("hello, sliding_window_chunking")
    encoder = encoding_for_model("gpt-4o")
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


async def insert_to_db(data: Dict) -> None:
    print("hello, insert_to_db")
    headers_data = {
        k: v for k, v in data.items()
        if k not in ["jina_embedding", "content"]
    }

    async def insert_data() -> Any:
        return await asyncio.to_thread(
            lambda: supabase.table('user_web_data').insert(data).execute()
        )

    async def insert_headers() -> Any:
        return await asyncio.to_thread(
            lambda: (
                supabase.table('user_web_data_headers')
                .insert(headers_data).execute()
            )
        )

    await asyncio.gather(insert_data(), insert_headers())


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
async def scrape_with_retry(url: str, params: Dict) -> Dict:
    await scrape_limiter.acquire()
    try:
        return await asyncio.to_thread(
            lambda: app.scrape_url(url=url, params=params)
        )
    except RequestException as e:
        logger.error(f"HTTP error while scraping {url}: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error while scraping {url}: {str(e)}")
        raise


async def process_single_url(site: str, user_id: Optional[str], root_url: str) -> Optional[List[Dict]]:
    print("\nhello, process_single_url")

    if "screen" in site:
        logger.info(f"Skipping screen {site}")
        return None

    try:
        response = await scrape_with_retry(
            site,
            {'formats': ['markdown'], 'waitFor': 2000}
        )

        content_list = [
            item for item in response['markdown'].split('\n\n')
            if not item.startswith('[![]')
        ]
        content = "\n\n".join(content_list)

        try:
            header = (
                "## Title: " + response['metadata']['title'] +
                " ## Description: " + response['metadata']['description']
            )
        except KeyError:
            print(f"KeyError occurred for site {site}: Missing description")
            header = "## Title: " + response['metadata']['title']

        chunks = await sliding_window_chunking(content)
        results = []

        async def process_chunk(chunk: str) -> Dict:
            sb_insert = {
                "url": site,
                "header": header,
                "content": chunk,
                "token_count": 0,
                "jina_embedding": "",
                "user_id": user_id,
                "root_url": root_url
            }

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


async def scrape_url(urls: List[str], user_id: Optional[str]) -> List[Dict]:
    print("hello, scrape_url")
    print(f"Starting scrape process for user {user_id} at {datetime.now()}")

    parsed_url = urlparse(urls[0])
    root_url = f"{parsed_url.scheme}://{parsed_url.netloc}"

    tasks = [process_single_url(site, user_id, root_url) for site in urls]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    flat_results = []
    for result in results:
        if isinstance(result, list):
            flat_results.extend(result)

    print("end, scrape_url")
    return flat_results


async def map_url(url: str) -> List[str]:
    print("hello, map_url")
    logger.info(f"Starting URL mapping for: {url}")

    try:
        await crawl_limiter.acquire()
        map_result: List[str] = await asyncio.to_thread(
            lambda: app.map_url(url, params={'includeSubdomains': True})
        )
        # Enforce maximum pages limit
        map_result = map_result[:MAX_PAGES]
        logger.info(f"Successfully mapped URL. Found {len(map_result)} URLs")
        return map_result
    except Exception as e:
        logger.error(f"Error mapping URL {url}: {str(e)}")
        raise
