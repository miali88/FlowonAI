import requests
import json
import os 
from typing import List, Dict

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

supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

async def insert_to_db(data):
    print("inserting to db")
    supabase.table('user_web_data').insert(data).execute()


async def map_url(url):
    map_result: List[str] = app.map_url(url, params={
        'includeSubdomains': True
    })
    return map_result