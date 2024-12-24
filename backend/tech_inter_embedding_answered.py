import os
import json
import random
import asyncio
import requests
from openai import OpenAI
from anthropic import AsyncAnthropic
from app.core.config import settings
import argparse
from typing import List, Dict
from supabase import create_client
import os  
from dotenv import load_dotenv

load_dotenv()

def supabase_client(key: str = "service_role_key"):
    url = os.getenv("SUPABASE_URL")
    
    if key == "service_role_key":
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    else:
        key = os.getenv("SUPABASE_KEY")

    return create_client(url, key)
supabase = supabase_client()

# Initialize clients
openai = OpenAI()
anthropic = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

conversation_histories = {}


async def get_embedding(text):
    """Get embeddings using Jina AI API"""
    url = 'https://api.jina.ai/v1/embeddings'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {settings.JINA_API_KEY}'
    }
    data = {
        "model": "jina-embeddings-v3",
        "task": "retrieval.query",
        "dimensions": 1024,
        "late_chunking": False,
        "embedding_type": "float",
        "input": text
    }
    response = requests.post(url, headers=headers, data=json.dumps(data))
    return response.json()['data'][0]['embedding']



async def rerank_documents(query: str, top_n: int, docs: list):
    """Rerank documents using Jina AI API"""
    url = 'https://api.jina.ai/v1/rerank'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {settings.JINA_API_KEY}'
    }
    data = {
        "model": "jina-reranker-v2-base-multilingual",
        "query": query,
        "top_n": top_n,
        "documents": docs
    }

    response = requests.post(url, headers=headers, json=data)
    reranked_docs = response.json()['results']
    return [i['document']['text'] for i in reranked_docs]


async def llm_response(system_prompt, user_prompt, model="gpt-4o", token_size=1000, max_retries=5):
    """Generate LLM response using OpenAI"""
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}]


    for attempt in range(max_retries):
        try:
            response = await asyncio.to_thread(
                openai.chat.completions.create,
                model=model,
                messages=messages,
                stream=False
            )
            return response.choices[0].message.content

        except Exception as e:
            print(f"An error occurred: {e}")



async def similarity_search(query: str, data_source: Dict = None,
                            similarity_threshold: float = 0.20,
                            user_id: str = "user_2mmXezcGmjZCf88gT2v2waCBsXv"):
    print("\n\nsimilarity_search...")
    embedding_column = "jina_embedding"
    max_results = 5

    # Get embedding once for both queries
    query_embedding = await get_embedding(query)
    
    results = supabase.rpc(
        "user_web_data",
        {
            'query_embedding': query_embedding,
            'embedding_column': embedding_column,
            'similarity_threshold': similarity_threshold,
            'max_results': max_results,
            'root_url_filter': ["https://wecreate.com.pt"],
            'user_id_filter': user_id
        }).execute()

    if results.data:
        to_list_strings = [item['content'] for item in results.data]
        return to_list_strings
    else:
        return []

async def chat_process(user_message):
    print("\nfunc chat_process...")
    try:
        # Get relevant documents using RAG
        retrieved_docs = await similarity_search(query=user_message)

        reranked_docs = await rerank_documents(query=user_message, top_n=2, docs=retrieved_docs)

        user_prompt = f""" 
        # User Query:
        {user_message}
        # Retrieved Docs:
        {reranked_docs}"""
        
        system_prompt = """
        You are a helpful assistant.
        """

        response = await llm_response(system_prompt, user_prompt)
        return response
    
    except Exception as e:
        print(f"An error occurred: {e}")
        raise e



async def main():
    response = await chat_process("What does the Company WeCreate do?")
    print("\nLLM Response:", response)


if __name__ == "__main__":
    asyncio.run(main())