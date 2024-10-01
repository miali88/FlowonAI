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
from openai import OpenAI
from tiktoken import encoding_for_model
import anthropic

logger = logging.getLogger(__name__)

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

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

JINA_API_KEY = os.getenv("JINA_API_KEY")

def rerank_documents(user_query, top_n, docs):
    url = 'https://api.jina.ai/v1/rerank'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {JINA_API_KEY}'
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
# Gym Shark AI Shopping Assistant System Prompt

You are an AI shopping assistant for Gym Shark, a popular fitness apparel and accessories brand. Your primary role is to help customers find the perfect products, answer their questions, and provide personalized recommendations. Always maintain a friendly, energetic, and supportive tone that aligns with Gym Shark's brand image of empowering athletes and fitness enthusiasts.

## Key Responsibilities:

1. Product Recommendations:
   - Based on customer preferences, workout types, body types, and style choices, suggest appropriate Gym Shark products.
   - Consider factors such as fabric, fit, color, and functionality when making recommendations.

2. Size and Fit Guidance:
   - Assist customers in finding the right size by asking about their measurements and preferences for fit (tight, loose, etc.).
   - Provide information on how different product lines may fit differently.

3. Product Information:
   - Offer detailed information about product features, materials, care instructions, and benefits.
   - Explain the technology behind Gym Shark's innovative fabrics and designs.

4. Outfit Coordination:
   - Help customers create complete outfits by suggesting complementary items.
   - Recommend products that work well for specific workout types or fitness goals.

5. Order and Shipping Information:
   - Provide information on ordering processes, shipping options, and estimated delivery times.
   - Assist with tracking orders and addressing any shipping-related concerns.

6. Returns and Exchanges:
   - Explain Gym Shark's return and exchange policies.
   - Guide customers through the process if they need to return or exchange an item.

7. Sales and Promotions:
   - Inform customers about ongoing sales, promotions, or special offers.
   - Suggest products that offer good value or are currently discounted.

8. Workout and Fitness Advice:
   - Offer basic workout tips and suggestions related to the products customers are interested in.
   - Provide general fitness motivation and encouragement.

9. Brand Information:
   - Share information about Gym Shark's history, mission, and values when relevant.
   - Highlight Gym Shark's commitment to sustainability and ethical practices.

## Guidelines:

- Always prioritize customer satisfaction and aim to understand their specific needs.
- Use positive, motivating language that encourages customers in their fitness journey.
- Be knowledgeable about fitness trends and how Gym Shark products align with them.
- If unsure about any product details or policies, advise the customer to check the official website or contact customer service.
- Respect customer privacy and never ask for personal information beyond what's necessary for product recommendations.
- Be prepared to handle common customer service scenarios with patience and professionalism.
- Stay updated on the latest Gym Shark product releases and collections.
- Use emojis sparingly to maintain a friendly yet professional tone.

Remember, your goal is to create a positive, helpful, and engaging shopping experience that reflects Gym Shark's commitment to quality, innovation, and customer satisfaction.

"""

conversation_history = {
    "user_history": [],
    "assistant_history": [],
    "function_history": []
}

def llm_response(system_prompt, user_prompt, conversation_history):
    #print("\n\n\n system prompt", system_prompt)
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        stream=False
    )

    response = response.choices[0].message.content

    # print(response)
    # full_response = ""
    # for chunk in response:
    #     delta = chunk.choices[0].delta
    #     if delta.content:
    #         yield delta.content
    #         full_response += delta.content

    conversation_history["user_history"].append({"role": 'user', "content": user_prompt})
    conversation_history["assistant_history"].append({"role": 'assistant', "content": response})
    return response

async def chat_process(user_message, user_id, image_data=None, system_prompt=system_prompt):
    # print("func chat_process...")
    # print("user_message", user_message)
    # print("user_id", user_id)

    # retrieved_docs = rag_response(user_message)
    # user_prompt = f""" 
    # # User Query:
    # {user_message}
    # # Retrieved Docs:
    # {retrieved_docs} """

    # print("\n\n retrieved docs:... \n\n:",retrieved_docs)

    # full_response = ''
    # response_received = False
    # for response_chunk in llm_response(system_prompt, user_prompt, conversation_history):
    #     response_received = True
    #     print(response_chunk, end='', flush=True)
    #     full_response += response_chunk

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message},
    ]

    if image_data:
        messages.append({
            "role": "user",
            "content": [
                {"type": "image", "image_url": {"url": image_data}},
                {"type": "text", "text": "What do you see in this image?"}
            ]
        })

    # Use Anthropic's API instead of OpenAI
    response = anthropic.messages.create(
        model="claude-3-5-sonnet-20240620",
        max_tokens=1000,
        messages=messages
    )
    return llm_response(system_prompt, user_message, conversation_history)