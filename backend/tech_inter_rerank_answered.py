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

# Initialize clients
openai = OpenAI()
anthropic = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

conversation_histories = {}

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

async def llm_response(system_prompt, user_prompt, model="gpt-4", token_size=1000, max_retries=5):
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

async def similarity_search(query: str):
    print("\n\nsimilarity_search...")
    all_results = ['Python is a programming language.', 
                    'The cat sat on the mat.', 
                   'Entropy is always increasing in a closed system.', 
                   'Dogs are friendly pets.']

    return all_results

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
        print(user_prompt)

        system_prompt = """
        You are a helpful assistant.
        """

        response = await llm_response(system_prompt, user_prompt)
        return response
    
    except Exception as e:
        print(f"An error occurred: {e}")
        raise e


async def main():
    await chat_process("Pets are fun to have")


if __name__ == "__main__":
    asyncio.run(main())