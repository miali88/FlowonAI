import requests
import json
import os 
from typing import List, Dict
from urllib.parse import urlparse
import asyncio
from datetime import datetime

from firecrawl import FirecrawlApp
from tiktoken import encoding_for_model
from supabase import create_client, Client
from dotenv import load_dotenv  

load_dotenv()

FIRECRAWL_API = os.getenv("FIRECRAWL_API_KEY")
app = FirecrawlApp(api_key=FIRECRAWL_API)

async def count_tokens(text, model="gpt-4o"):
    encoder = encoding_for_model(model)
    tokens = encoder.encode(text)
    return len(tokens)

JINA_API_KEY = os.getenv('JINA_API_KEY')
async def get_embedding(text):
    """ JINA EMBEDDINGS """
    url = 'https://api.jina.ai/v1/embeddings'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {JINA_API_KEY}'
    }

    data = {
        "model": "jina-embeddings-v3",
        "task": "retrieval.passage",
        "dimensions": 1024,
        "late_chunking": False,
        "embedding_type": "float",
        "input": text
    }
    response = requests.post(url, headers=headers, data=json.dumps(data))
    return response.json()#['data'][0]['embedding']

async def sliding_window_chunking(text, max_window_size=900, overlap=200):
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
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async def insert_to_db(data):
    print("inserting to db")
    supabase.table('user_web_data').insert(data).execute()


async def map_url(url):
    map_result: List[str] = app.map_url(url, params={
        'includeSubdomains': True
    })
    return map_result

async def scrape_url(urls: List[str], user_id: str = None):
    print(f"Starting scrape process for user {user_id} at {datetime.now()}")
    #await asyncio.sleep(1)  # Simulated long process
    print(f"Finished sleep for user {user_id} at {datetime.now()}")
    # Extract root URL from the first URL in the list
    parsed_url = urlparse(urls[0])
    root_url = f"{parsed_url.scheme}://{parsed_url.netloc}"

    sb_insert = {
        "url": "",
        "header": "",
        "content": "",
        "token_count": 0,
        "jina_embedding": "",
        "user_id": user_id,
        "root_url": root_url  # Add root_url to the insert dictionary
    }

    results = []
    for site in urls:
        try:
            response = app.scrape_url(url=site, params={
                'formats': ['markdown'],
                'waitFor': 1000
            })

            content = [item for item in response['markdown'].split('\n\n') if not item.startswith('[![]')]
            content = "\n\n".join(content)
            
            try:
                header = "## Title: " + response['metadata']['title'] + " ## Description: " + response['metadata']['description']
            except KeyError:
                print(f"KeyError occurred for site {site}: Missing description")
                header = "## Title: " + response['metadata']['title']

            chunks = await sliding_window_chunking(content)

            for chunk in chunks:
                print(f"processing chunk {chunks.index(chunk)} of {len(chunks)}")
                sb_insert['url'] = site
                sb_insert['header'] = header
                sb_insert['content'] = chunk
                chunk = header + chunk
                jina_response = await get_embedding(chunk)
                sb_insert['jina_embedding'] = jina_response['data'][0]['embedding']
                sb_insert['token_count'] = jina_response['usage']['total_tokens']

                await insert_to_db(sb_insert)
                results.append(sb_insert.copy())
        except KeyError as e:
            print(f"KeyError occurred for site {site}: {str(e)}")
            print("Proceeding without description")
            chunks = await sliding_window_chunking(content)
            #header = "## Title: " + response['metadata']['title'] 

            for chunk in chunks: 
                print(f"processing chunk {chunks.index(chunk)} of {len(chunks)}")
                sb_insert['url'] = site
                #sb_insert['header'] = header
                sb_insert['content'] = chunk
                #chunk = header + chunk
                jina_response = await get_embedding(chunk)
                sb_insert['jina_embedding'] = jina_response['data'][0]['embedding']
                sb_insert['token_count'] = jina_response['usage']['total_tokens']

                await insert_to_db(sb_insert)
                results.append(sb_insert.copy())
            continue
        except Exception as e:
            print(f"Error processing site {site}: {str(e)}")
            continue


    return results
