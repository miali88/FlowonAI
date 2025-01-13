from app.core.config import settings
from dotenv import load_dotenv
import logging
import os
import requests
import asyncio
from typing import List, Dict
import random
import re
import json

from services.db.supabase_services import supabase_client
from openai import OpenAI
from anthropic import AsyncAnthropic

supabase = supabase_client()

logger = logging.getLogger(__name__)
load_dotenv()

openai = OpenAI()
anthropic = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

conversation_histories = {}


async def get_embedding(text):
    # if table == "user_text_files":
    #     """ OPENAI EMBEDDINGS """
    #     response = openai.embeddings.create(
    #         input=text,
    #         model="text-embedding-3-large")
    #     return response.data[0].embedding

    # """ VOYAGE EMBEDDINGS """
    # response = vo.embed(text, model="voyage-law-2", input_type="query")
    # return response.embeddings[0]

    """ JINA EMBEDDINGS """
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


async def rerank_documents(user_query: str, top_n: int, docs: List):
    print("func rerank_documents..")
    url = 'https://api.jina.ai/v1/rerank'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {settings.JINA_API_KEY}'
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


async def llm_response(system_prompt, user_prompt, conversation_history=None,
                       model="claude", token_size=1000, max_retries=5):
    messages = []

    if conversation_history:
        # Add the conversation history for this session
        for i, msg in enumerate(conversation_history['user_history']):
            messages.append({"role": "user", "content": msg['content']})
            if i < len(conversation_history['assistant_history']):
                messages.append({
                    "role": "assistant",
                    "content": conversation_history['assistant_history'][i]['content']
                })

        # If the last message is from the user,
        # add a placeholder assistant message
        if messages and messages[-1]['role'] == 'user':
            messages.append({"role": "assistant", "content": "Processing your query."})

    # Add the current user prompt
    messages.append({"role": "user", "content": user_prompt})

    # print("\n\n\n =-[=-[=-[=-[=-[ \n\n\n\nmessages:", messages)
    for attempt in range(max_retries):
        try:
            if model == "openai":
                # Use asyncio.to_thread to run the synchronous OpenAI
                # call in a separate thread
                response = await asyncio.to_thread(
                    openai.chat.completions.create,
                    model="gpt-4o",
                    messages=[{"role": "system", "content": system_prompt}] + messages,
                    stream=False
                )
                response_content = response.choices[0].message.content
            elif model == "claude":
                try:
                    response = await anthropic.messages.create(
                        model="claude-3-5-sonnet-20240620",
                        system=system_prompt,
                        messages=messages,
                        max_tokens=token_size
                    )
                    response_content = response.content[0].text
                except Exception as claude_error:
                    # If Claude is overloaded, switch to OpenAI
                    print("Claude API overloaded, switching to OpenAI...")
                    response = await asyncio.to_thread(
                        openai.chat.completions.create,
                        model="gpt-4o",
                        messages=[
                            {"role": "system", "content": system_prompt}
                        ] + messages,
                        stream=False
                    )
                    response_content = response.choices[0].message.content
            else:
                raise ValueError(
                    "Invalid model specified. Choose 'openai' or 'claude'."
                )

            return response_content

        except Exception as e:
            if hasattr(e, 'response') and e.response.status_code == 529:
                if attempt < max_retries - 1:
                    wait_time = (2 ** attempt) + random.uniform(0, 1)
                    print(f"API overloaded. Retrying in {wait_time:.2f} seconds...")
                    await asyncio.sleep(wait_time)
                else:
                    raise e
            else:
                raise e

tables = ["user_web_data", "user_text_files"]


async def similarity_search(query: str, data_source: Dict = None,
                            table_names: List[str] = tables,
                            search_type: str = "Quick Search",
                            similarity_threshold: float = 0.20,
                            embedding_column: str = "jina_embedding",
                            max_results: int = 15,
                            user_id: str = None):
    print("\n\nsimilarity_search...")
    print("\n\n data_source in similarity_search:", data_source)
    all_results = []

    # Set search parameters based on search type
    if search_type == "Deep Search":
        similarity_threshold = 0.30
        max_results = 10
    elif search_type == "Quick Search":
        similarity_threshold = 0.20
        max_results = 7

    async def fetch_table_data(table, query_embedding):
        try:
            if table == "user_web_data":
                return supabase.rpc(
                    "user_web_data",
                    {
                        'query_embedding': query_embedding,
                        'embedding_column': embedding_column,
                        'similarity_threshold': similarity_threshold,
                        'max_results': max_results,
                        'root_url_filter': data_source['web'],
                        'user_id_filter': user_id
                    }
                ).execute()

            # elif table == "corporate_law":
            #     return supabase.rpc(
            #         "search_corporate_law",
            #         {
            #             'query_embedding': query_embedding,
            #             'embedding_column': embedding_column,
            #             'similarity_threshold': similarity_threshold,
            #             'max_results': max_results,
            #             'user_id_filter': user_id,
            #         }
            #     ).execute()

            elif table == "user_text_files":
                return supabase.rpc(
                    "search_chunks",
                    {
                        'query_embedding': query_embedding,
                        'embedding_column': embedding_column,
                        'similarity_threshold': similarity_threshold,
                        'max_results': max_results,
                        'parent_id_filter': data_source['text_files'],
                        'filter_user_id': user_id
                    }
                ).execute()
        except Exception as e:
            logger.error(f"Error querying table {table}: {str(e)}")
            return None

    # Get embedding once for both queries
    query_embedding = await get_embedding(query)

    # Run queries concurrently
    tasks = [fetch_table_data(table, query_embedding) for table in table_names]
    responses = await asyncio.gather(*tasks)

    # Process results
    for response in responses:
        if response and hasattr(response, 'data') and response.data:
            all_results.extend(response.data)
    print("Length of results:", len(all_results))
    # print("\n\n\n all_results:", all_results)
    return all_results


async def rag_response(user_query: str, user_search_type: str, user_id: str):
    print("\nfunc rag_response..")
    table_names = ["user_web_data"]

    results = await similarity_search(
        user_query,
        table_names,
        user_id,
        user_search_type
    )

    docs = []
    kb_titles = []  # Initialize kb_titles list
    """ formatting results into docs for RAG filtering, then extracting titles """
    for table in table_names:
        if table == "chunks":
            print("\n\n\n table:", table)
            chunks = results[table]
            for item in chunks:
                print("\n\n\nitem heading", item['heading'])
                print("=-=-=-=-=-=-=-=-=-=-=-=-")
                docs.append(
                    f"#Source: User's Knowledge Base\n"
                    f"#Title:\n{item['title']}\n"
                    f"#Heading:\n{item['heading']}\n"
                    f"#Content:{item['content']}\n\n"
                )
                kb_titles.append(item['title'])  # Add title to kb_titles
        elif table == "stock_chunks":
            print("\n\n\n table:", table)
            stock_chunks = results[table]
            for item in stock_chunks:
                print("\n\n\nitem heading", item['heading'])
                print("=-=-=-=-=-=-=-=-=-=-=-=-")
                docs.append(
                    f"#Source: Legislation\n"
                    f"#Heading:\n{item['heading']}\n"
                    f"#Content:{item['content']}"
                )

                # Note: We don't add stock_chunks titles to kb_titles

    if docs and user_search_type == "Deep Search":
        """ filtered docs via agents """
        filtered_docs = await filter_relevant_docs(user_query, docs)

        # Filter kb_titles based on filtered_docs, only for user's knowledge base items
        filtered_kb_titles = [
            title for doc, title in zip(docs, kb_titles)
            if doc in filtered_docs and doc.startswith("#Source: User's Knowledge Base")
        ]

        # Fetch all knowledge base items for the user
        response = supabase.table('knowledge_base') \
            .select('title,file_url') \
            .eq('user_id', user_id) \
            .execute()
        kb_items = {item['title']: item['file_url'] for item in response.data}
        print("\n\n\nfiltered_kb_titles:", filtered_kb_titles)
        # Convert filtered_kb_titles to tuples with URL
        kb_titles = [(title, kb_items.get(title, "")) for title in filtered_kb_titles]

        # print("\n\n\nfiltered_docs...\n\n", filtered_docs)

        return filtered_docs, kb_titles

    elif docs and user_search_type == "Quick Search":
        # Convert list of lists to list of tuples (which are hashable)
        kb_titles = [
            tuple(title) if isinstance(title, list) else title
            for title in kb_titles
            ]
        filtered_kb_titles = list(dict.fromkeys(kb_titles))

        # Fetch all knowledge base items for the user
        response = supabase.table('knowledge_base') \
            .select('title,file_url') \
            .eq('user_id', user_id) \
            .execute()
        kb_items = {item['title']: item['file_url'] for item in response.data}
        print("\n\n\nfiltered_kb_titles:", filtered_kb_titles)
        # Convert filtered_kb_titles to tuples with URL
        kb_titles = [(title, kb_items.get(title, "")) for title in filtered_kb_titles]

        return docs, kb_titles
    else:
        raise ValueError("No relevant documents found for the given query.")


def extract_thinking(response):
    pattern = r'<thinking>(.*?)</thinking>'
    matches = re.findall(pattern, response, re.DOTALL)
    return ['<thinking>' + match + '</thinking>' for match in matches]
