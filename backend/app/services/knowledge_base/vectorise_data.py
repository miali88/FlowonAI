import logging
from tiktoken import encoding_for_model
import requests
import json
from typing import List, Tuple 

import spacy
from openai import AsyncOpenAI

from app.core.config import settings
from app.clients.supabase_client import get_supabase

openai = AsyncOpenAI()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

nlp = spacy.load("en_core_web_md")

def clean_data(data: str) -> str:
    doc = nlp(data)
    cleaned_text = ' '.join(
        [token.text for token in doc if not token.is_space and not token.is_punct]
    )
    return cleaned_text

def count_tokens(text: str, model: str = "gpt-4o") -> int:
    encoder = encoding_for_model(model)
    tokens = encoder.encode(text)
    return len(tokens)

def sliding_window_chunking(text: str, max_window_size: int = 600, overlap: int = 200) -> List[str]:
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

async def insert_chunk(
    parent_id: str, content: str, chunk_index: int, embedding: List[float], user_id: str, token_count: int, title: str
) -> None:
    logger.info(f"Inserting chunk {chunk_index} for document {parent_id}")
    try:
        supabase = await get_supabase()

        await supabase.table('chunks').insert({
            'parent_id': parent_id,
            'content': content,
            'chunk_index': chunk_index,
            'jina_embedding': embedding,
            'user_id': user_id,
            'token_count': token_count,
            "title": title
        }).execute()
        logger.debug(f"Successfully inserted chunk {chunk_index}")
    except Exception as e:
        logger.error(f"Failed to insert chunk {chunk_index}: {str(e)}")
        raise

async def get_embedding(text: str) -> Tuple[List[float], int]:
    logger.info("Requesting embedding from Jina AI")
    try:
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
        response = requests.post(
            url, 
            headers=headers, 
            data=json.dumps(data),
            timeout=30  # Add timeout to prevent potential DoS attacks
        )
        response.raise_for_status()
        logger.debug("Successfully received embedding from Jina AI")

        embedding = response.json()['data'][0]['embedding']
        token_count = response.json()['usage']['total_tokens']
        return embedding, token_count
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to get embedding from Jina AI: {str(e)}")
        raise

async def process_item(item_id: str, content: str, user_id: str, title: str) -> int:
    logger.info(f"Processing item {item_id} for user {user_id}")
    chunks = sliding_window_chunking(content)
    logger.info(f"Created {len(chunks)} chunks for processing")
    total_tokens = 0
    for index, chunk in enumerate(chunks):
        logger.debug(f"Processing chunk {index}/{len(chunks)}")
        try:
            embedding, token_count = await get_embedding(chunk)
            await insert_chunk(
                item_id,
                chunk,
                index,
                embedding,
                user_id,
                token_count,
                title
            )
            total_tokens += token_count
        except Exception as e:
            logger.error(f"Failed to process chunk {index}: {str(e)}")
            raise
    return total_tokens

async def update_file_tokens(data_id: str, total_tokens: int, title: str) -> None:
    logger.info(f"Updating token count for file {title}")
    try:
        supabase = await get_supabase()

        await supabase.table('user_text_files')\
            .update({'token_count': total_tokens})\
            .eq('id', data_id)\
            .execute()
        logger.debug(f"Successfully updated token count for file {title}")
    except Exception as e:
        logger.error(f"Failed to update token count: {str(e)}")
        raise

async def process_tabular_item(item_id: str, rows: List[dict], user_id: str, title: str) -> int:
    """Process tabular data rows and store them as chunks with embeddings"""
    logger.info(f"Processing tabular item {item_id} with {len(rows)} rows")
    total_tokens = 0
    
    for index, row in enumerate(rows):
        logger.debug(f"Processing row {index}/{len(rows)}")
        try:
            # Convert row dict to string representation
            row_content = json.dumps(row, ensure_ascii=False)
            
            # Get embedding for the row
            embedding, token_count = await get_embedding(row_content)
            
            # Store in chunks table
            await insert_chunk(
                item_id,
                row_content,
                index,
                embedding,
                user_id,
                token_count,
                title
            )
            total_tokens += token_count
            
        except Exception as e:
            logger.error(f"Failed to process row {index}: {str(e)}")
            raise
    
    return total_tokens

""" ENTRY POINT """
async def kb_item_to_chunks(data_id: str, data_content: str, user_id: str, title: str, is_tabular: bool = False) -> None:
    """Modified to handle both text and tabular data"""
    logger.info(f"Starting knowledge base item processing for ID {data_id}")
    
    try:
        if is_tabular:
            # For tabular data, data_content will be a list of dictionaries
            total_tokens = await process_tabular_item(
                item_id=data_id,
                rows=data_content,
                user_id=user_id,
                title=title
            )
        else:
            # Existing text processing logic
            cleaned_text = clean_data(data_content)
            logger.debug(f"Cleaned text length: {len(cleaned_text)} characters")
            
            if not cleaned_text:
                logger.warning(f"No valid text content for item {title}")
                return
                
            total_tokens = await process_item(
                item_id=data_id,
                content=cleaned_text,
                user_id=user_id,
                title=title
            )
            
        logger.info(f"Successfully processed knowledge base item {title}")
        await update_file_tokens(data_id, total_tokens, title)
        
    except Exception as e:
        logger.error(f"Failed to process knowledge base item {title}: {str(e)}")
        raise
