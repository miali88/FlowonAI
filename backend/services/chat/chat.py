from fastapi import Request
from fastapi.responses import JSONResponse
from services.db.supabase_ops import supabase_ops
from app.core.config import settings
from dotenv import load_dotenv
import json
import logging
import os 
import requests
from supabase import create_client, Client
from termcolor import colored
import spacy
from openai import OpenAI
from tiktoken import encoding_for_model

logger = logging.getLogger(__name__)

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

openai = OpenAI()

def get_embedding(text):
    response = openai.embeddings.create(
        input=text,
        model="text-embedding-3-small"
    )

    return response.data[0].embedding

def similarity_search(query, table_name, match_threshold=0.2, match_count=10):
    query_embedding = get_embedding(query)
    response = supabase.rpc(
        'match_documents',
        {
            'query_embedding': query_embedding,
            'match_threshold': match_threshold,
            'match_count': match_count,
            'table_name': table_name
        }
    ).execute()

    return response.data

def rerank_documents(user_query, top_n, docs):
    url = 'https://api.jina.ai/v1/rerank'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer jina_b716ce28cd1b49bc920e57a5bfb6de061z36vM3vogg6y-_2d5qcoXHe_rdo'
    }
    data = {
        "model": "jina-reranker-v2-base-multilingual",
        "query": user_query,
        "top_n": top_n,
        "documents": docs
    }
    response = requests.post(url, headers=headers, json=data)
    reranked_docs = response.json()['results']
    reranked_docs = [i['document']['text'] for i in reranked_docs]

    return reranked_docs

def rag_response(user_query):
    table_name = "chunks"
    results = similarity_search(user_query,table_name)
    docs = [result['content'] for result in results]
    reranked_docs = rerank_documents(user_query, 3, docs)

    return reranked_docs


system_prompt = """
You are a helpful assistant designed to search the company knowledge base, and find relevant information to answer questions from users.
Where a question from the user appears to be specific to, you will use the <context> to augment your response to the user.
"""

conversation_history = {
    "user_history": [],
    "assistant_history": [],
    "function_history": []
}

def llm_response(system_prompt, user_prompt, conversation_history):
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        stream=True
    )

    full_response = ""
    tool_calls = []

    for chunk in response:
        delta = chunk.choices[0].delta
        if delta.content:
            yield delta.content
            full_response += delta.content
        if delta.tool_calls:
            tool_calls.extend(delta.tool_calls)

    conversation_history["user_history"].append({"role": 'user', "content": user_prompt})
    conversation_history["assistant_history"].append({"role": 'assistant', "content": full_response})
    return full_response


async def chat_process(user_message, user_id):
    print("func chat_process...")
    print("user_message", user_message)
    print("user_id", user_id)

    retrieved_docs = rag_response(user_message)
    user_prompt = f""" {user_message}
    # retrieved docs {retrieved_docs} """

    response_received = False
    for response_chunk in llm_response(system_prompt, user_prompt, conversation_history):
        response_received = True
        print(response_chunk, end='', flush=True)

