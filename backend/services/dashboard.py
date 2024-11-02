import asyncio
import logging
from tiktoken import encoding_for_model
import requests
import json

import spacy
from openai import AsyncOpenAI

from app.core.config import settings
from services.db.supabase_services import supabase_client

supabase = supabase_client()
openai = AsyncOpenAI()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

nlp = spacy.load("en_core_web_md")

def clean_data(data):
    doc = nlp(data)
    cleaned_text = ' '.join([token.text for token in doc if not token.is_space and not token.is_punct])
    return cleaned_text

def count_tokens(text, model="gpt-4o"):
    encoder = encoding_for_model(model)
    tokens = encoder.encode(text)
    return len(tokens)

def sliding_window_chunking(text, max_window_size=600, overlap=200):
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

async def insert_chunk(parent_id, content, chunk_index, embedding, user_id):
    print("func insert_chunk...")
    # Run the synchronous Supabase operation in a separate thread
    await asyncio.to_thread(
        supabase.table('chunks').insert({
            'parent_id': parent_id,
            'content': content,
            'chunk_index': chunk_index,
            'jina_embedding': embedding,
            'user_id': user_id,
        }).execute
    )

async def get_embedding(text):
    # """ OPENAI EMBEDDINGS """
    # response = await openai.embeddings.create(
    #     input=text,
    #     model="text-embedding-3-small"
    # )
    # return response.data[0].embedding

    """ JINA EMBEDDINGS """
    url = 'https://api.jina.ai/v1/embeddings'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {settings.JINA_API_KEY}'
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
    return response.json()['data'][0]['embedding']


async def process_item(item_id, content, user_id):
    print("func process_item...")
    chunks = sliding_window_chunking(content) 
    for index, chunk in enumerate(chunks):
        embedding = await get_embedding(chunk)
        print("index", index)
        print("chunk", chunk)
        await insert_chunk(item_id, chunk, index, embedding, user_id)

async def kb_item_to_chunks(data_id, data_content, user_id):
    print("func kb_item_to_chunks...")
    cleaned_text = clean_data(data_content)
    if cleaned_text:
        print("text cleaned")
    await process_item(item_id=data_id, content=cleaned_text, user_id=user_id)
    print("kb item embedded")

