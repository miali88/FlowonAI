import asyncio
from openai import OpenAI
from typing import List, Dict

# Initialize clients
openai = OpenAI()

async def rerank_documents(query: str, top_n: int, docs: list):
    """Rerank documents using Jina AI API"""
    """https://jina.ai/reranker/"""

    return None

async def llm_response(system_prompt, user_prompt, model="gpt-4", token_size=1000, max_retries=5):
    """Generate LLM response using OpenAI"""
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}]

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
        
        # call similarity_search

        # call rerank_documents

        user_prompt = f""" 
        # User Query:
        {user_message}
        # Retrieved Docs:
        {reranked_docs}"""
        print(user_prompt)

        system_prompt = """
        You are a helpful assistant.
        """

        #call llm_response

        return None
    
    except Exception as e:
        print(f"An error occurred: {e}")
        raise e


async def main():
    await chat_process("Pets are fun to have")


if __name__ == "__main__":
    asyncio.run(main())